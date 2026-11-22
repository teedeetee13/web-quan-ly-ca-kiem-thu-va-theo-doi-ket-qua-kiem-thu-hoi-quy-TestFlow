import { Injectable } from '@nestjs/common';
import { Priority, ResultStatus } from '@prisma/client';
import { RunsService, compareRuns, computeStats } from './runs.service';

const STATUS_LABEL: Record<ResultStatus, string> = {
  UNTESTED: 'Chưa chạy',
  PASSED: 'Đạt',
  FAILED: 'Không đạt',
  BLOCKED: 'Bị chặn',
};
const PRIORITY_LABEL: Record<Priority, string> = {
  CRITICAL: 'Nghiêm trọng',
  HIGH: 'Cao',
  MEDIUM: 'Trung bình',
  LOW: 'Thấp',
};
const PRIORITIES: Priority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

/** Ô CSV: bọc ngoặc kép, nhân đôi ngoặc kép bên trong (RFC 4180). */
const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

const fmt = (d: Date | null | undefined) =>
  d ? d.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false }) : '';

@Injectable()
export class ReportsService {
  constructor(private readonly runs: RunsService) {}

  async stats(runId: number) {
    const run = await this.runs.findOne(runId);
    const statusOf = (rc: (typeof run.runCases)[number]) => rc.result?.status ?? 'UNTESTED';
    const byPriority = PRIORITIES.map((priority) => ({
      priority,
      ...computeStats(run.runCases.filter((rc) => rc.priority === priority).map(statusOf)),
    })).filter((p) => p.total > 0);
    const problems = run.runCases
      .filter((rc) => ['FAILED', 'BLOCKED'].includes(statusOf(rc)))
      .map((rc) => ({
        runCaseId: rc.id,
        code: rc.code,
        title: rc.title,
        priority: rc.priority,
        status: statusOf(rc),
        actualResult: rc.result?.actualResult ?? null,
        note: rc.result?.note ?? null,
      }));

    const previous = await this.runs.findPrevious(run);
    const comparison = previous && {
      previousRun: previous.run,
      ...compareRuns(
        previous.items,
        run.runCases.map((rc) => ({
          runCaseId: rc.id,
          testCaseId: rc.testCaseId,
          code: rc.code,
          title: rc.title,
          priority: rc.priority,
          status: statusOf(rc),
        })),
      ),
    };
    return {
      run: {
        id: run.id,
        name: run.name,
        version: run.version,
        status: run.status,
        createdAt: run.createdAt,
        closedAt: run.closedAt,
        project: run.project,
      },
      ...run.stats,
      byPriority,
      problems,
      comparison,
    };
  }

  /**
   * CSV UTF-8 có BOM để Excel trên Windows nhận đúng tiếng Việt.
   * Phần đầu là thông tin đợt và số liệu tổng hợp, sau đó là bảng từng ca.
   */
  async csv(runId: number) {
    const run = await this.runs.findOne(runId);
    const s = run.stats;
    const lines: unknown[][] = [
      ['Dự án', run.project.name],
      ['Đợt kiểm thử', run.name],
      ['Phiên bản', run.version],
      ['Trạng thái đợt', run.status === 'OPEN' ? 'Đang mở' : 'Đã đóng'],
      ['Tổng số ca', s.total],
      ['Đạt', s.counts.PASSED],
      ['Không đạt', s.counts.FAILED],
      ['Bị chặn', s.counts.BLOCKED],
      ['Chưa chạy', s.counts.UNTESTED],
      ['Tỷ lệ đạt', s.passRate === null ? 'Chưa có dữ liệu' : `${(s.passRate * 100).toFixed(1)}%`],
      [],
      ['STT', 'Mã ca', 'Tên ca', 'Độ ưu tiên', 'Trạng thái', 'Kết quả thực tế', 'Ghi chú', 'Người thực hiện', 'Thời điểm'],
      ...run.runCases.map((rc, i) => [
        i + 1,
        rc.code,
        rc.title,
        PRIORITY_LABEL[rc.priority],
        STATUS_LABEL[rc.result?.status ?? 'UNTESTED'],
        rc.result?.actualResult,
        rc.result?.note,
        rc.result?.executedBy?.fullName,
        fmt(rc.result?.executedAt),
      ]),
    ];
    const body = lines.map((l) => l.map(cell).join(',')).join('\r\n');
    const safeVersion = run.version.replace(/[^\w.-]+/g, '_');
    return { filename: `testflow-dot-${run.id}-v${safeVersion}.csv`, content: '﻿' + body + '\r\n' };
  }
}
