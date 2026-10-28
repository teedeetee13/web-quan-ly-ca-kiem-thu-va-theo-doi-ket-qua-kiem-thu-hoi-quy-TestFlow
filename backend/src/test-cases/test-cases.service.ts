import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { paginate } from '../common/dto/pagination.dto';
import { CreateTestCaseDto, TestCaseQueryDto, UpdateTestCaseDto } from './dto/test-case.dto';

const listSelect = {
  id: true,
  code: true,
  title: true,
  priority: true,
  suiteId: true,
  updatedAt: true,
  suite: { select: { id: true, name: true } },
  _count: { select: { steps: true } },
} satisfies Prisma.TestCaseSelect;

const detailInclude = {
  suite: { select: { id: true, name: true } },
  steps: { orderBy: { order: 'asc' } },
  createdBy: { select: { id: true, fullName: true } },
  updatedBy: { select: { id: true, fullName: true } },
} satisfies Prisma.TestCaseInclude;

@Injectable()
export class TestCasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
  ) {}

  async findByProject(projectId: number, q: TestCaseQueryDto) {
    await this.projects.findOne(projectId);
    const where: Prisma.TestCaseWhereInput = {
      projectId,
      suiteId: q.suiteId,
      priority: q.priority,
      OR: q.search
        ? [
            { code: { contains: q.search, mode: 'insensitive' } },
            { title: { contains: q.search, mode: 'insensitive' } },
          ]
        : undefined,
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.testCase.findMany({
        where,
        select: listSelect,
        orderBy: { code: 'asc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      this.prisma.testCase.count({ where }),
    ]);
    return paginate(items, total, q);
  }

  async findOne(id: number) {
    const tc = await this.prisma.testCase.findUnique({ where: { id }, include: detailInclude });
    if (!tc) throw new NotFoundException('Không tìm thấy ca kiểm thử');
    return tc;
  }

  async create(projectId: number, dto: CreateTestCaseDto, userId: number) {
    await this.projects.getWritable(projectId);
    await this.assertSuiteInProject(dto.suiteId, projectId);
    await this.assertCodeFree(projectId, dto.code);

    // Ca và các bước được ghi trong cùng một lệnh (nested create = một giao dịch).
    return this.prisma.testCase.create({
      data: {
        projectId,
        suiteId: dto.suiteId,
        code: dto.code,
        title: dto.title,
        preconditions: dto.preconditions,
        priority: dto.priority,
        createdById: userId,
        steps: { create: dto.steps.map((s, i) => ({ order: i + 1, ...s })) },
      },
      include: detailInclude,
    });
  }

  async update(id: number, dto: UpdateTestCaseDto, userId: number) {
    const current = await this.findOne(id);
    await this.projects.getWritable(current.projectId);
    if (dto.suiteId !== undefined) await this.assertSuiteInProject(dto.suiteId, current.projectId);
    if (dto.code) await this.assertCodeFree(current.projectId, dto.code, id);

    // Thay toàn bộ danh sách bước trong một giao dịch: lỗi giữa chừng thì không mất bước cũ.
    return this.prisma.$transaction(async (tx) => {
      if (dto.steps) {
        await tx.testStep.deleteMany({ where: { caseId: id } });
      }
      return tx.testCase.update({
        where: { id },
        data: {
          suiteId: dto.suiteId,
          code: dto.code,
          title: dto.title,
          preconditions: dto.preconditions,
          priority: dto.priority,
          updatedById: userId,
          steps: dto.steps
            ? { create: dto.steps.map((s, i) => ({ order: i + 1, ...s })) }
            : undefined,
        },
        include: detailInclude,
      });
    });
  }

  /**
   * Xoá ca gốc. Các đợt kiểm thử cũ (tuần 5) giữ bản chụp trong RunCase,
   * khoá ngoại testCaseId được đặt NULL nên lịch sử không bị mất.
   */
  async remove(id: number) {
    const tc = await this.findOne(id);
    await this.projects.getWritable(tc.projectId);
    await this.prisma.testCase.delete({ where: { id } });
    return { message: 'Đã xoá ca kiểm thử' };
  }

  private async assertSuiteInProject(suiteId: number, projectId: number) {
    const suite = await this.prisma.testSuite.findUnique({ where: { id: suiteId } });
    if (!suite || suite.projectId !== projectId) {
      throw new BadRequestException('Bộ kiểm thử không tồn tại hoặc không thuộc dự án này');
    }
  }

  private async assertCodeFree(projectId: number, code: string, exceptId?: number) {
    const dup = await this.prisma.testCase.findFirst({
      where: { projectId, code, id: exceptId ? { not: exceptId } : undefined },
    });
    if (dup) throw new ConflictException(`Mã ca ${code} đã tồn tại trong dự án`);
  }
}
