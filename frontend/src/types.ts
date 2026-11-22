export type Role = 'ADMIN' | 'TESTER';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: Role;
}

export interface User extends AuthUser {
  isActive: boolean;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  isArchived: boolean;
  updatedAt: string;
  _count: { suites: number; cases: number; runs: number };
}

export interface Suite {
  id: number;
  projectId: number;
  name: string;
  description: string | null;
  _count: { cases: number };
}

export interface CaseListItem {
  id: number;
  code: string;
  title: string;
  priority: Priority;
  suiteId: number;
  updatedAt: string;
  suite: { id: number; name: string };
  _count: { steps: number };
}

export interface Step {
  id?: number;
  order?: number;
  action: string;
  expected: string;
}

export interface TestCase {
  id: number;
  projectId: number;
  suiteId: number;
  code: string;
  title: string;
  preconditions: string | null;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  suite: { id: number; name: string };
  steps: Step[];
  createdBy: { id: number; fullName: string };
  updatedBy: { id: number; fullName: string } | null;
}

export type ResultStatus = 'UNTESTED' | 'PASSED' | 'FAILED' | 'BLOCKED';
export type RunStatus = 'OPEN' | 'CLOSED';

export interface RunStats {
  total: number;
  counts: Record<ResultStatus, number>;
  executed: number;
  progress: number;
  /** null khi chưa có ca Đạt hoặc Không đạt. */
  passRate: number | null;
}

export interface RunListItem {
  id: number;
  projectId: number;
  name: string;
  version: string;
  status: RunStatus;
  createdAt: string;
  closedAt: string | null;
  createdBy: { id: number; fullName: string };
  stats: RunStats;
}

export interface TestResult {
  status: ResultStatus;
  actualResult: string | null;
  note: string | null;
  executedAt: string | null;
  executedBy: { id: number; fullName: string } | null;
}

/** Bản chụp ca lúc tạo đợt: không đổi khi ca gốc bị sửa hoặc xoá. */
export interface RunCase {
  id: number;
  runId: number;
  testCaseId: number | null;
  code: string;
  title: string;
  preconditions: string | null;
  priority: Priority;
  stepsSnapshot: { order: number; action: string; expected: string }[];
  result: TestResult | null;
}

export interface RunDetail extends RunListItem {
  project: { id: number; name: string; isArchived: boolean };
  runCases: RunCase[];
}

export interface RunReport extends RunStats {
  run: {
    id: number;
    name: string;
    version: string;
    status: RunStatus;
    createdAt: string;
    closedAt: string | null;
    project: { id: number; name: string; isArchived: boolean };
  };
  byPriority: (RunStats & { priority: Priority })[];
  problems: {
    runCaseId: number;
    code: string;
    title: string;
    priority: Priority;
    status: ResultStatus;
    actualResult: string | null;
    note: string | null;
  }[];
  /** null khi đây là đợt đầu tiên của dự án. */
  comparison: RunComparison | null;
}

export interface CompareRow {
  runCaseId: number;
  testCaseId: number | null;
  code: string;
  title: string;
  priority: Priority;
  status: ResultStatus;
  previousStatus?: ResultStatus;
}

/** So sánh với đợt liền trước của dự án (BR16). */
export interface RunComparison {
  previousRun: { id: number; name: string; version: string; status: RunStatus; createdAt: string };
  regressions: CompareRow[];
  fixed: CompareRow[];
  stillFailing: CompareRow[];
  added: CompareRow[];
}

export interface CaseHistoryItem {
  id: number;
  title: string;
  stepsSnapshot: { order: number; action: string; expected: string }[];
  run: { id: number; name: string; version: string; status: RunStatus; createdAt: string };
  result: {
    status: ResultStatus;
    actualResult: string | null;
    note: string | null;
    executedAt: string | null;
    executedBy: { fullName: string } | null;
  } | null;
}
