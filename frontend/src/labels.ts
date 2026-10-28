import type { Priority, Role } from './types';

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
