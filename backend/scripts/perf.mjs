/**
 * Đo hiệu năng API danh sách ca theo yêu cầu phi chức năng:
 * 1.000 ca kiểm thử, 5 người dùng đồng thời, mục tiêu p95 < 1 giây.
 *
 * Cần CSDL và API (cổng 3000) đang chạy. Chạy: npm run perf
 * Script tự tạo một dự án tạm có 1.000 ca, đo, rồi xoá dự án tạm.
 * Kết quả ghi vào ../docs/ket-qua/hieu-nang.json và in bảng ra màn hình.
 */
import { PrismaClient } from '@prisma/client';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';

process.loadEnvFile?.('.env');
const API = process.env.API_URL ?? 'http://localhost:3000/api';
const USERS = 5;
const DURATION_MS = Number(process.env.PERF_SECONDS ?? 30) * 1000;
const CASES = 1000;
const prisma = new PrismaClient();

const pct = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)];
const round = (n) => Math.round(n * 10) / 10;

async function login() {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'tester@testflow.local', password: 'Tester@123' }),
  });
  if (!res.ok) throw new Error(`Đăng nhập thất bại (${res.status}). API đã chạy và đã seed chưa?`);
  return (await res.json()).accessToken;
}

async function seedProject() {
  const stamp = Date.now().toString(36).toUpperCase();
  const admin = await prisma.user.findUniqueOrThrow({ where: { email: 'admin@testflow.local' } });
  const project = await prisma.project.create({ data: { name: `PERF ${stamp}`, createdById: admin.id } });
  const suites = await Promise.all(
    ['Đăng nhập', 'Tìm kiếm', 'Giỏ hàng', 'Thanh toán', 'Tài khoản'].map((name) =>
      prisma.testSuite.create({ data: { projectId: project.id, name } }),
    ),
  );
  const priorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  await prisma.testCase.createMany({
    data: Array.from({ length: CASES }, (_, i) => ({
      projectId: project.id,
      suiteId: suites[i % suites.length].id,
      code: `PERF_${String(i + 1).padStart(4, '0')}`,
      title: `Ca hiệu năng số ${i + 1} kiểm tra chức năng ${suites[i % suites.length].name.toLowerCase()}`,
      priority: priorities[i % priorities.length],
      createdById: admin.id,
    })),
  });
  const ids = await prisma.testCase.findMany({ where: { projectId: project.id }, select: { id: true } });
  await prisma.testStep.createMany({
    data: ids.flatMap(({ id }) => [1, 2, 3].map((order) => ({ caseId: id, order, action: `Thao tác ${order}`, expected: `Kết quả ${order}` }))),
  });
  return { project, suites, caseIds: ids.map((x) => x.id) };
}

/** Một người dùng ảo: gửi liên tục các truy vấn danh sách khác nhau cho đến hết thời gian. */
async function virtualUser(token, projectId, suiteIds, deadline, samples) {
  const pages = CASES / 20;
  const queries = [
    () => `page=${1 + Math.floor(Math.random() * pages)}&pageSize=20`,
    () => `search=${encodeURIComponent('PERF_0' + Math.floor(Math.random() * 100))}`,
    () => `suiteId=${suiteIds[Math.floor(Math.random() * suiteIds.length)]}&page=2&pageSize=20`,
    () => `priority=HIGH&pageSize=50`,
    () => `search=${encodeURIComponent('thanh toán')}&pageSize=100`,
  ];
  let i = 0;
  while (Date.now() < deadline) {
    const qs = queries[i++ % queries.length]();
    const t0 = performance.now();
    const res = await fetch(`${API}/projects/${projectId}/cases?${qs}`, { headers: { Authorization: `Bearer ${token}` } });
    await res.arrayBuffer();
    samples.push({ ms: performance.now() - t0, ok: res.ok });
  }
}

function summarize(samples, seconds) {
  const ms = samples.map((s) => s.ms).sort((a, b) => a - b);
  return {
    requests: samples.length,
    errors: samples.filter((s) => !s.ok).length,
    throughputPerSec: round(samples.length / seconds),
    p50: round(pct(ms, 50)),
    p95: round(pct(ms, 95)),
    p99: round(pct(ms, 99)),
    max: round(ms[ms.length - 1]),
  };
}

async function main() {
  const token = await login();
  console.log(`Tạo dự án tạm với ${CASES} ca…`);
  const { project, suites, caseIds } = await seedProject();
  try {
    // Khởi động nóng để loại thời gian kết nối lần đầu.
    for (let i = 0; i < 10; i++) await fetch(`${API}/projects/${project.id}/cases`, { headers: { Authorization: `Bearer ${token}` } });

    console.log(`Đo ${USERS} người dùng đồng thời trong ${DURATION_MS / 1000} giây…`);
    const samples = [];
    const deadline = Date.now() + DURATION_MS;
    await Promise.all(Array.from({ length: USERS }, () => virtualUser(token, project.id, suites.map((s) => s.id), deadline, samples)));
    const list = summarize(samples, DURATION_MS / 1000);

    // Phép đo bổ sung: tạo một đợt chứa đủ 1.000 ca (chụp 1.000 bản ghi trong một giao dịch).
    const t0 = performance.now();
    const created = await fetch(`${API}/projects/${project.id}/runs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Đợt hiệu năng', version: 'perf', caseIds }),
    });
    const createRunMs = round(performance.now() - t0);
    const run = await created.json();
    const t1 = performance.now();
    await (await fetch(`${API}/runs/${run.id}`, { headers: { Authorization: `Bearer ${token}` } })).arrayBuffer();
    const runDetailMs = round(performance.now() - t1);

    const result = {
      measuredAt: new Date().toISOString(),
      environment: {
        os: `${os.type()} ${os.release()}`,
        cpu: os.cpus()[0]?.model.trim(),
        cpuCores: os.cpus().length,
        ramGB: round(os.totalmem() / 1024 ** 3),
        node: process.version,
        database: 'PostgreSQL 18 (embedded-postgres), cùng máy',
        api: 'NestJS bản build production (node dist/main), cùng máy',
      },
      setup: { cases: CASES, steps: CASES * 3, concurrentUsers: USERS, durationSeconds: DURATION_MS / 1000 },
      listCasesApi: list,
      target: { p95Ms: 1000, passed: list.p95 < 1000 && list.errors === 0 },
      extra: { createRunWith1000CasesMs: createRunMs, createRunStatus: created.status, getRunDetail1000CasesMs: runDetailMs },
    };
    const out = path.resolve('../docs/ket-qua/hieu-nang.json');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(result, null, 2));

    console.table({ 'API danh sách ca': list });
    console.log(`p95 = ${list.p95} ms → ${result.target.passed ? 'ĐẠT' : 'KHÔNG ĐẠT'} mục tiêu < 1000 ms`);
    console.log(`Tạo đợt 1.000 ca: ${createRunMs} ms (HTTP ${created.status}); xem chi tiết đợt 1.000 ca: ${runDetailMs} ms`);
    console.log(`Đã ghi ${out}`);
  } finally {
    await prisma.testRun.deleteMany({ where: { projectId: project.id } });
    await prisma.testCase.deleteMany({ where: { projectId: project.id } });
    await prisma.testSuite.deleteMany({ where: { projectId: project.id } });
    await prisma.project.delete({ where: { id: project.id } });
    await prisma.$disconnect();
  }
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
