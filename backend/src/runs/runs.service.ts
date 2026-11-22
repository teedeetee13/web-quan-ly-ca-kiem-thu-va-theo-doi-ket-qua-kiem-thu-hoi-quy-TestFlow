import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Priority, ResultStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { paginate } from '../common/dto/pagination.dto';
import { CreateRunDto, RunQueryDto } from './dto/run.dto';

/** Bước trong bản chụp: chép nguyên từ TestStep lúc tạo đợt. */
export interface StepSnapshot {
  order: number;
  action: string;
  expected: string;
}

export interface RunStats {
  total: number;
  counts: Record<ResultStatus, number>;
  executed: number;
  /** Tiến độ = số ca đã có kết quả (khác Chưa chạy) / tổng số ca. */
  progress: number;
  /** Tỷ lệ đạt = Đạt / (Đạt + Không đạt); null khi mẫu số bằng 0 (BR15). */
  passRate: number | null;
}

export function computeStats(statuses: ResultStatus[]): RunStats {
  const counts: Record<ResultStatus, number> = { UNTESTED: 0, PASSED: 0, FAILED: 0, BLOCKED: 0 };
  for (const s of statuses) counts[s]++;
  const total = statuses.length;
  const executed = total - counts.UNTESTED;
  const judged = counts.PASSED + counts.FAILED;
  return {
    total,
    counts,
    executed,
    progress: total ? executed / total : 0,
    passRate: judged ? counts.PASSED / judged : null,
  };
}

/** Một ca trong đợt, rút gọn cho việc so sánh giữa hai đợt. */
export interface CompareItem {
  runCaseId: number;
  testCaseId: number | null;
  code: string;
  title: string;
  priority: Priority;
  status: ResultStatus;
}

export interface CompareRow extends CompareItem {
  previousStatus: ResultStatus;
}

/**
 * So sánh đợt hiện tại với đợt trước (BR16). Ghép ca theo testCaseId; ca gốc đã bị xoá thì ghép theo mã ca.
 *  - regressions (thụt lùi): trước Đạt, nay Không đạt
 *  - fixed (đã sửa): trước Không đạt, nay Đạt
 *  - stillFailing: cả hai đợt đều Không đạt
 *  - added: ca chưa có trong đợt trước
 */
export function compareRuns(previous: CompareItem[], current: CompareItem[]) {
  const key = (x: CompareItem) => (x.testCaseId !== null ? `id:${x.testCaseId}` : `code:${x.code}`);
  const before = new Map(previous.map((p) => [key(p), p]));
  const regressions: CompareRow[] = [];
  const fixed: CompareRow[] = [];
  const stillFailing: CompareRow[] = [];
  const added: CompareItem[] = [];
  for (const c of current) {
    const p = before.get(key(c));
    if (!p) {
      added.push(c);
      continue;
    }
    const row = { ...c, previousStatus: p.status };
    if (p.status === 'PASSED' && c.status === 'FAILED') regressions.push(row);
    else if (p.status === 'FAILED' && c.status === 'PASSED') fixed.push(row);
    else if (p.status === 'FAILED' && c.status === 'FAILED') stillFailing.push(row);
  }
  return { regressions, fixed, stillFailing, added };
}

const runCaseInclude = {
  result: { include: { executedBy: { select: { id: true, fullName: true } } } },
} satisfies Prisma.RunCaseInclude;

@Injectable()
export class RunsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
  ) {}

  async findByProject(projectId: number, q: RunQueryDto) {
    await this.projects.findOne(projectId);
    const where: Prisma.TestRunWhereInput = {
      projectId,
      status: q.status,
      OR: q.search
        ? [
            { name: { contains: q.search, mode: 'insensitive' } },
            { version: { contains: q.search, mode: 'insensitive' } },
          ]
        : undefined,
    };
    const [runs, total] = await this.prisma.$transaction([
      this.prisma.testRun.findMany({
        where,
        include: { createdBy: { select: { id: true, fullName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      this.prisma.testRun.count({ where }),
    ]);

    // Đếm trạng thái của các đợt trong trang bằng một truy vấn.
    const rows = await this.prisma.runCase.findMany({
      where: { runId: { in: runs.map((r) => r.id) } },
      select: { runId: true, result: { select: { status: true } } },
    });
    const byRun = new Map<number, ResultStatus[]>();
    for (const r of rows) {
      const list = byRun.get(r.runId) ?? [];
      list.push(r.result?.status ?? ResultStatus.UNTESTED);
      byRun.set(r.runId, list);
    }
    const items = runs.map((r) => ({ ...r, stats: computeStats(byRun.get(r.id) ?? []) }));
    return paginate(items, total, q);
  }

  /**
   * Tạo đợt kèm bản chụp từng ca và kết quả "Chưa chạy".
   * Toàn bộ nằm trong một lệnh create lồng nhau nên là một giao dịch (BR11).
   */
  async create(projectId: number, dto: CreateRunDto, userId: number) {
    await this.projects.getWritable(projectId);
    const cases = await this.prisma.testCase.findMany({
      where: { id: { in: dto.caseIds }, projectId },
      include: { steps: { orderBy: { order: 'asc' } } },
      orderBy: { code: 'asc' },
    });
    if (cases.length !== dto.caseIds.length) {
      throw new BadRequestException('Có ca không tồn tại hoặc không thuộc dự án này');
    }

    const run = await this.prisma.testRun.create({
      data: {
        projectId,
        name: dto.name,
        version: dto.version,
        createdById: userId,
        runCases: {
          create: cases.map((c) => ({
            testCaseId: c.id,
            code: c.code,
            title: c.title,
            preconditions: c.preconditions,
            priority: c.priority,
            stepsSnapshot: c.steps.map<StepSnapshot>(({ order, action, expected }) => ({
              order,
              action,
              expected,
            })) as unknown as Prisma.InputJsonValue,
            result: { create: {} },
          })),
        },
      },
    });
    return this.findOne(run.id);
  }

  async findOne(id: number) {
    const run = await this.prisma.testRun.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, isArchived: true } },
        createdBy: { select: { id: true, fullName: true } },
        runCases: { include: runCaseInclude, orderBy: { code: 'asc' } },
      },
    });
    if (!run) throw new NotFoundException('Không tìm thấy đợt kiểm thử');
    return {
      ...run,
      stats: computeStats(run.runCases.map((rc) => rc.result?.status ?? ResultStatus.UNTESTED)),
    };
  }

  /** Đợt liền trước trong cùng dự án (theo thời điểm tạo), kèm trạng thái từng ca; null nếu không có. */
  async findPrevious(run: { id: number; projectId: number; createdAt: Date }) {
    const prev = await this.prisma.testRun.findFirst({
      where: { projectId: run.projectId, id: { not: run.id }, createdAt: { lt: run.createdAt } },
      orderBy: { createdAt: 'desc' },
      include: { runCases: { include: { result: { select: { status: true } } } } },
    });
    if (!prev) return null;
    const { runCases, ...info } = prev;
    return {
      run: { id: info.id, name: info.name, version: info.version, status: info.status, createdAt: info.createdAt },
      items: runCases.map<CompareItem>((rc) => ({
        runCaseId: rc.id,
        testCaseId: rc.testCaseId,
        code: rc.code,
        title: rc.title,
        priority: rc.priority,
        status: rc.result?.status ?? ResultStatus.UNTESTED,
      })),
    };
  }

  /** Đóng đợt: chốt kết quả, không mở lại được (BR13). */
  async close(id: number) {
    const run = await this.prisma.testRun.findUnique({ where: { id } });
    if (!run) throw new NotFoundException('Không tìm thấy đợt kiểm thử');
    await this.projects.getWritable(run.projectId);
    if (run.status === 'CLOSED') throw new BadRequestException('Đợt kiểm thử đã được đóng');
    await this.prisma.testRun.update({
      where: { id },
      data: { status: 'CLOSED', closedAt: new Date() },
    });
    return this.findOne(id);
  }
}
