# TestFlow — Hướng dẫn cài đặt và chạy (bản hoàn chỉnh)

Yêu cầu: **Node.js 22+** (đã kiểm tra với v22.12). **Không cần cài PostgreSQL hay Docker**: dự án dùng gói `embedded-postgres` để chạy PostgreSQL 18 thật ngay trong thư mục `backend/.pgdata`.

## Lần đầu

```bash
cd backend
npm install
copy .env.example .env      # rồi đổi JWT_SECRET thành chuỗi ngẫu nhiên
```

```bash
cd ../frontend
npm install
```

## Mỗi lần chạy (mở 3 cửa sổ terminal)

| Terminal | Lệnh | Ghi chú |
| --- | --- | --- |
| 1 | `cd backend` → `npm run db:start` | PostgreSQL ở cổng 5433, để nguyên cửa sổ này |
| 2 | `cd backend` → `npm run db:deploy` → `npm run db:seed` → `npm run start:dev` | Lần đầu cần migrate + seed. API ở http://localhost:3000/api |
| 3 | `cd frontend` → `npm run dev` | Giao diện ở http://localhost:5173 |

- Tài liệu API (Swagger): http://localhost:3000/api/docs
- `npm run db:seed` **xoá sạch và tạo lại** dữ liệu demo (3 tài khoản, 2 dự án, 34 ca, 3 đợt). Nên chạy trước khi demo.

## Tài khoản demo (dữ liệu giả lập)

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | admin@testflow.local | Admin@123 |
| Tester | tester@testflow.local | Tester@123 |
| Tester (đã khoá) | locked@testflow.local | Locked@123 |

## Kiểm thử

```bash
cd backend
npm test            # 12 unit test, không cần CSDL
npm run test:e2e    # 44 tình huống API TS-01..TS-44, cần db:start + db:seed
```

```bash
cd e2e
npm install
npx playwright install chromium   # lần đầu
npm test                          # 3 luồng E2E, cần CSDL + API + giao diện đang chạy
npm run screenshots               # chụp lại ảnh giao diện vào docs/screenshots (seed trước)
```

Các bộ kiểm thử tự tạo dữ liệu riêng. Riêng E2E để lại một dự án "Playwright …", nên chạy `npm run db:seed` sau khi chạy xong.

## Vận hành

| Lệnh (trong `backend`) | Tác dụng |
| --- | --- |
| `npm run perf` | Đo hiệu năng: 1.000 ca, 5 người dùng đồng thời trong 30 giây; ghi `docs/ket-qua/hieu-nang.json`. Cần API đang chạy |
| `npm run db:backup` | Sao lưu toàn bộ CSDL ra `backend/backups/testflow-*.json` (kèm mã băm SHA-256) |
| `npm run db:restore` | Phục hồi từ bản sao lưu mới nhất, hoặc `npm run db:restore -- backups/<tệp>.json`. **Xoá dữ liệu hiện tại** |

## Dựng lại hồ sơ nộp

```bash
cd docs/build
npm install
npm run all     # sơ đồ PNG → báo cáo .docx → slide .pptx → phiếu, tiến độ → PDF (cần Microsoft Word, PowerPoint)
```

## Dùng PostgreSQL cài sẵn hoặc Docker thay cho bản nhúng

Chỉ cần sửa `DATABASE_URL` trong `backend/.env` trỏ tới máy chủ PostgreSQL của bạn, bỏ qua bước `db:start`.

## Đưa lên Internet

Xem [docs/TRIEN_KHAI.md](docs/TRIEN_KHAI.md): giao diện trên Netlify, API trên Render, CSDL trên Neon. Cách dùng phần mềm xem [docs/HUONG_DAN_SU_DUNG.md](docs/HUONG_DAN_SU_DUNG.md).
