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
