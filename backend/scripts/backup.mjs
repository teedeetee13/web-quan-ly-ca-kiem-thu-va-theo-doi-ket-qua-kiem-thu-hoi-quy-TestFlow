/**
 * Sao lưu logic toàn bộ CSDL TestFlow ra một file JSON (backups/testflow-YYYYMMDD-HHmmss.json).
 * Bản PostgreSQL nhúng không kèm pg_dump nên dùng Prisma đọc từng bảng; cách này chạy được
 * với mọi máy chủ PostgreSQL. Nếu dùng PostgreSQL cài sẵn, có thể dùng thêm pg_dump.
 *
 * Chạy: npm run db:backup
 */
import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

process.loadEnvFile?.('.env');

/** Thứ tự cha trước con để khi phục hồi không vi phạm khoá ngoại. */
export const TABLES = ['user', 'project', 'testSuite', 'testCase', 'testStep', 'testRun', 'runCase', 'testResult'];

/** Mã băm nội dung để so sánh bản sao lưu với dữ liệu sau phục hồi. */
export function checksum(tables) {
  return crypto.createHash('sha256').update(JSON.stringify(tables)).digest('hex');
}

export async function dumpAll(prisma) {
  const tables = {};
  for (const t of TABLES) tables[t] = await prisma[t].findMany({ orderBy: { id: 'asc' } });
  return tables;
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const tables = await dumpAll(prisma);
    const now = new Date();
    const stamp = now.toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
    const file = path.resolve('backups', `testflow-${stamp}.json`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const counts = Object.fromEntries(TABLES.map((t) => [t, tables[t].length]));
    fs.writeFileSync(file, JSON.stringify({ format: 'testflow-backup-v1', createdAt: now, counts, checksum: checksum(tables), tables }));
    console.log('Đã sao lưu:', file);
    console.table(counts);
    console.log('checksum:', checksum(tables));
  } finally {
    await prisma.$disconnect();
  }
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('backup.mjs')) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
