# TestFlow — Hướng dẫn cài đặt và chạy (bản tuần 3)

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
- `npm run db:seed` **xoá sạch và tạo lại** dữ liệu demo — dùng trước khi demo.

## Tài khoản demo (dữ liệu giả lập)

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | admin@testflow.local | Admin@123 |
| Tester | tester@testflow.local | Tester@123 |
| Tester (đã khoá) | locked@testflow.local | Locked@123 |

## Chạy kiểm thử tự động

```bash
cd backend
npm test            # 7 unit test (AuthService, RolesGuard), không cần CSDL
npm run test:e2e    # 26 tình huống API TS-01..TS-26, cần db:start + db:seed trước
```

## Dùng PostgreSQL cài sẵn hoặc Docker thay cho bản nhúng

Chỉ cần sửa `DATABASE_URL` trong `backend/.env` trỏ tới máy chủ PostgreSQL của bạn, bỏ qua bước `db:start`.

## Cấu trúc thư mục

```
Testflow/
├─ README.md               Kế hoạch dự án
├─ HUONG_DAN_CHAY.md       File này
├─ docs/BAO_CAO_TUAN_3.md  Báo cáo tiến độ tuần 3
├─ backend/                NestJS + Prisma
│  ├─ prisma/schema.prisma  Mô hình 8 thực thể (= ERD)
│  ├─ prisma/migrations/    Lịch sử thay đổi CSDL
│  ├─ prisma/seed.ts        Dữ liệu demo
│  ├─ scripts/dev-db.mjs    PostgreSQL nhúng
│  ├─ src/auth|users|projects|suites|test-cases/   Mỗi chức năng 1 module
│  ├─ src/common/           Guard, decorator, DTO dùng chung
│  └─ test/                 Kiểm thử e2e
└─ frontend/               React + TypeScript + Vite
   └─ src/pages|components/
```
