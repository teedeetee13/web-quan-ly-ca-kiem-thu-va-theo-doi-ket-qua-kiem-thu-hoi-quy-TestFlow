// Chạy PostgreSQL nhúng cho môi trường phát triển (không cần cài PostgreSQL/Docker).
// Dữ liệu lưu tại backend/.pgdata; dừng bằng Ctrl+C.
import EmbeddedPostgres from 'embedded-postgres';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.pgdata');
const port = Number(process.env.PG_PORT ?? 5433);

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: 'testflow',
  password: 'testflow',
  port,
  persistent: true,
});

const firstRun = !existsSync(path.join(dataDir, 'PG_VERSION'));
if (firstRun) await pg.initialise();
await pg.start();
if (firstRun) await pg.createDatabase('testflow');
console.log(`PostgreSQL đang chạy tại localhost:${port} (database: testflow). Nhấn Ctrl+C để dừng.`);

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
