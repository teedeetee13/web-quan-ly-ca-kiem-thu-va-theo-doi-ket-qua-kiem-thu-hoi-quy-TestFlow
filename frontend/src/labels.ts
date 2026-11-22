import type { Priority, ResultStatus, Role, RunStatus } from './types';

export const PRIORITY_LABEL: Record<Priority, string> = {
  CRITICAL: 'Nghiêm trọng',
  HIGH: 'Cao',
  MEDIUM: 'Trung bình',
  LOW: 'Thấp',
};

export const PRIORITIES: Priority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Admin',
  TESTER: 'Tester',
};

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

export const STATUS_LABEL: Record<ResultStatus, string> = {
  UNTESTED: 'Chưa chạy',
  PASSED: 'Đạt',
  FAILED: 'Không đạt',
  BLOCKED: 'Bị chặn',
};

/** Thứ tự hiển thị: kết quả xấu đứng trước để dễ thấy. */
export const STATUSES: ResultStatus[] = ['FAILED', 'BLOCKED', 'PASSED', 'UNTESTED'];

export const RUN_STATUS_LABEL: Record<RunStatus, string> = {
  OPEN: 'Đang mở',
  CLOSED: 'Đã đóng',
};

export const fmtPct = (v: number | null) => (v === null ? 'Chưa có dữ liệu' : `${(v * 100).toFixed(1)}%`);
