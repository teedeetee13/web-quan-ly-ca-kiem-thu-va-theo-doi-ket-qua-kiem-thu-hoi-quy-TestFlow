/**
 * Phục hồi CSDL từ file sao lưu JSON do backup.mjs tạo ra.
 * CẢNH BÁO: xoá toàn bộ dữ liệu hiện tại rồi nạp lại từ file.
 *
 * Chạy: npm run db:restore -- backups/testflow-YYYYMMDD-HHmmss.json
 * Không truyền file thì dùng bản sao lưu mới nhất trong thư mục backups.
 */
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';
import { TABLES, checksum, dumpAll } from './backup.mjs';

process.loadEnvFile?.('.env');

/** Tên bảng trong PostgreSQL tương ứng với tên model của Prisma. */
const SQL_NAME = {
  user: 'User', project: 'Project', testSuite: 'TestSuite', testCase: 'TestCase',
  testStep: 'TestStep', testRun: 'TestRun', runCase: 'RunCase', testResult: 'TestResult',
};

function latestBackup() {
  const dir = path.resolve('backups');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort() : [];
  if (!files.length) throw new Error('Không có file sao lưu trong thư mục backups');
  return path.join(dir, files[files.length - 1]);
}

async function main() {
  const file = path.resolve(process.argv[2] ?? latestBackup());
  const backup = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (backup.format !== 'testflow-backup-v1') throw new Error('File không phải bản sao lưu TestFlow');
  if (checksum(backup.tables) !== backup.checksum) throw new Error('File sao lưu bị hỏng: checksum không khớp');

  const prisma = new PrismaClient();
  try {
    await prisma.$transaction(
      async (tx) => {
        const all = TABLES.map((t) => `"${SQL_NAME[t]}"`).join(', ');
        await tx.$executeRawUnsafe(`TRUNCATE ${all} RESTART IDENTITY CASCADE`);
        for (const t of TABLES) {
          if (backup.tables[t].length) await tx[t].createMany({ data: backup.tables[t] });
          // Đặt lại bộ đếm id để bản ghi tạo sau phục hồi không trùng khoá.
          await tx.$executeRawUnsafe(
            `SELECT setval(pg_get_serial_sequence('"${SQL_NAME[t]}"', 'id'), COALESCE((SELECT MAX(id) FROM "${SQL_NAME[t]}"), 0) + 1, false)`,
          );
        }
      },
      { timeout: 120_000 },
    );

    const after = await dumpAll(prisma);
    const ok = checksum(JSON.parse(JSON.stringify(after))) === backup.checksum;
    console.log('Đã phục hồi từ:', file);
    console.table(Object.fromEntries(TABLES.map((t) => [t, { 'sao lưu': backup.counts[t], 'sau phục hồi': after[t].length }])));
    console.log(ok ? 'Kiểm tra: dữ liệu sau phục hồi KHỚP hoàn toàn với bản sao lưu' : 'CẢNH BÁO: dữ liệu sau phục hồi KHÔNG khớp');
    if (!ok) process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
