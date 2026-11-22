import { ResultStatus } from '@prisma/client';
import { compareRuns, computeStats } from './runs.service';

describe('computeStats (BR15: tỷ lệ đạt = Đạt / (Đạt + Không đạt))', () => {
  it('đợt rỗng hoặc chưa chạy ca nào: tiến độ 0, tỷ lệ đạt null (chưa có dữ liệu)', () => {
    expect(computeStats([])).toMatchObject({ total: 0, progress: 0, passRate: null });
    expect(computeStats(['UNTESTED', 'UNTESTED'])).toMatchObject({ executed: 0, progress: 0, passRate: null });
  });

  it('chỉ có Bị chặn: đã thực hiện nhưng tỷ lệ đạt vẫn null', () => {
    expect(computeStats(['BLOCKED', 'UNTESTED'])).toMatchObject({ executed: 1, progress: 0.5, passRate: null });
  });

  it('Bị chặn và Chưa chạy không làm giảm tỷ lệ đạt', () => {
    const s = computeStats(['PASSED', 'PASSED', 'PASSED', 'FAILED', 'BLOCKED', 'UNTESTED']);
    expect(s.counts).toEqual({ PASSED: 3, FAILED: 1, BLOCKED: 1, UNTESTED: 1 });
    expect(s.passRate).toBeCloseTo(0.75);
    expect(s.progress).toBeCloseTo(5 / 6);
  });
});

describe('compareRuns (BR16: so sánh với đợt trước)', () => {
  const item = (testCaseId: number | null, code: string, status: ResultStatus) => ({
    runCaseId: testCaseId ?? 0,
    testCaseId,
    code,
    title: code,
    priority: 'HIGH' as const,
    status,
  });

  it('phân loại thụt lùi, đã sửa, vẫn lỗi và ca mới', () => {
    const prev = [item(1, 'A', 'PASSED'), item(2, 'B', 'FAILED'), item(3, 'C', 'FAILED'), item(4, 'D', 'PASSED')];
    const cur = [item(1, 'A', 'FAILED'), item(2, 'B', 'PASSED'), item(3, 'C', 'FAILED'), item(4, 'D', 'BLOCKED'), item(5, 'E', 'PASSED')];
    const r = compareRuns(prev, cur);
    expect(r.regressions.map((x) => x.code)).toEqual(['A']);
    expect(r.regressions[0].previousStatus).toBe('PASSED');
    expect(r.fixed.map((x) => x.code)).toEqual(['B']);
    expect(r.stillFailing.map((x) => x.code)).toEqual(['C']);
    expect(r.added.map((x) => x.code)).toEqual(['E']);
  });

  it('ca gốc đã bị xoá (testCaseId null) vẫn được ghép theo mã ca', () => {
    const r = compareRuns([item(null, 'X', 'PASSED')], [item(null, 'X', 'FAILED')]);
    expect(r.regressions.map((x) => x.code)).toEqual(['X']);
    expect(r.added).toHaveLength(0);
  });
});
