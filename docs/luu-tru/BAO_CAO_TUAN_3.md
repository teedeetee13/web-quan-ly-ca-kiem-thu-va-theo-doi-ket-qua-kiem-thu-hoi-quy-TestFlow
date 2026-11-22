> **Lưu trữ:** báo cáo tiến độ tuần 3 (28/10/2026), giữ lại làm minh chứng quá trình. Trạng thái các chức năng trong tài liệu này là tại thời điểm đó; trạng thái hiện tại xem [TIEN_DO_HOAN_THANH.md](../TIEN_DO_HOAN_THANH.md).

# BÁO CÁO TIẾN ĐỘ TUẦN 3 — TestFlow

**Đề tài:** Xây dựng ứng dụng web quản lý ca kiểm thử và theo dõi kết quả kiểm thử hồi quy TestFlow
**Sinh viên:** Trần Đức Trường – 20233802 · Nhóm 18 · Lớp N09 · GVHD: ThS. Mai Văn Linh

---

## 1. Tuần 3 nằm ở đâu trong kế hoạch?

Theo bảng WBS trong kế hoạch:

| Mã WBS | Công việc | Thời gian | Đầu ra cam kết |
| --- | --- | --- | --- |
| **2.4** | Cài đặt đăng nhập, phân quyền và kiểm tra đầu vào (8 giờ) | **T3 N1 → T3 N5** | API và giao diện đăng nhập; kiểm tra quyền ở backend |
| **2.5** (bắt đầu) | Cài đặt dự án, bộ ca, ca kiểm thử và bộ lọc (16 giờ) | **T3 N6** → T4 N7 | CRUD và tìm kiếm; ít nhất 30 ca demo |
| 3.3 (song song) | Viết báo cáo | T2 N3 → T8 N2 | Báo cáo dần theo từng tuần |

Mốc kiểm tra gần nhất là **Mốc 2 – cuối tuần 4**: "tối thiểu 50% chức năng: đăng nhập/phân quyền, dự án/bộ ca, ca kiểm thử hoạt động".

## 2. Kết quả đã làm được

| Hạng mục | Trạng thái | Minh chứng |
| --- | --- | --- |
| Khung mã nguồn frontend + backend + CSDL (WBS 2.3) | Xong | `backend/`, `frontend/`, `prisma/migrations/` |
| Mô hình dữ liệu đủ **8 thực thể** của đề cương | Xong | `backend/prisma/schema.prisma` |
| Đăng nhập / đăng xuất / xem phiên / đổi mật khẩu | Xong | `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`, `PATCH /api/auth/password` |
| Băm mật khẩu bằng bcrypt | Xong | `src/common/password.ts` |
| Phân quyền **ở backend** (Admin / Tester) | Xong | `JwtAuthGuard`, `RolesGuard`, `@Roles()` |
| Admin quản lý tài khoản (tạo, sửa, khoá, đặt lại mật khẩu) | Xong | `/api/users`, trang "Tài khoản" |
| Kiểm tra dữ liệu đầu vào, thông báo lỗi tiếng Việt | Xong | DTO + `ValidationPipe` |
| Dự án: tạo, sửa, **lưu trữ** (không xoá), tìm kiếm | Xong (vượt tiến độ) | `/api/projects` |
| Bộ kiểm thử: CRUD, không xoá được bộ còn ca | Xong (vượt tiến độ) | `/api/projects/:id/suites`, `/api/suites/:id` |
| Ca kiểm thử + các bước: CRUD, tìm theo mã/tên, lọc theo bộ/độ ưu tiên, phân trang | Xong (vượt tiến độ, thuộc tuần 4) | `/api/projects/:id/cases`, `/api/cases/:id` |
| Dữ liệu demo: 2 dự án, 7 bộ, **34 ca**, 46 bước, 3 tài khoản | Xong (yêu cầu ≥ 30 ca) | `prisma/seed.ts` |
| Tài liệu API tự sinh (Swagger) | Xong | http://localhost:3000/api/docs |
| Kiểm thử tự động: **7 unit + 26 tình huống API**, tất cả đạt | Xong | `npm test`, `npm run test:e2e` |

**Chưa làm (đúng theo kế hoạch):** đợt kiểm thử, bản chụp ca, ghi kết quả, đóng đợt (tuần 5); thống kê, xuất CSV (tuần 6); kiểm thử E2E giao diện bằng Playwright (tuần 6–7). Bảng `TestRun`, `RunCase`, `TestResult` đã có trong CSDL nhưng chưa có API.

**Cần tự bổ sung cho hồ sơ:** sơ đồ UML (Use Case, Activity, Sequence) và ERD dạng hình vẽ thuộc WBS 2.2 (tuần 2). File `schema.prisma` là nguồn để vẽ ERD (có thể dùng dbdiagram.io hoặc draw.io).

## 3. Công nghệ sử dụng — là gì, vì sao chọn, dùng ở đâu

### 3.1 Bức tranh tổng thể

```
┌──────────────── Trình duyệt ────────────────┐       ┌──────────── Backend (Node.js) ─────────────┐      ┌─────────────┐
│ React + TypeScript (Vite)                   │ HTTP  │ NestJS                                     │ SQL  │ PostgreSQL  │
│  - Trang: Đăng nhập, Dự án, Ca, Tài khoản   │ JSON  │  Guard: JwtAuthGuard → RolesGuard          │ ───► │  8 bảng     │
│  - Lưu JWT, gắn "Authorization: Bearer ..." │ ────► │  Pipe:  ValidationPipe (DTO)               │      │             │
│  - Không bao giờ kết nối CSDL trực tiếp     │ ◄──── │  Controller → Service → Prisma ORM         │ ◄─── │             │
└─────────────────────────────────────────────┘       └────────────────────────────────────────────┘      └─────────────┘
```

Kiến trúc 3 lớp, **một backend, một CSDL**, không microservices (đúng mục 2.5 đề cương).

### 3.2 Từng công nghệ

| Công nghệ | Là gì | Vì sao chọn | Dùng ở đâu trong TestFlow |
| --- | --- | --- | --- |
| **TypeScript** | JavaScript có kiểu tĩnh | Bắt lỗi khi biên dịch; dùng **chung một ngôn ngữ** cho cả frontend và backend | Toàn bộ mã nguồn |
| **React 19** | Thư viện xây giao diện theo **component** | Phổ biến, tái sử dụng thành phần (Modal, Pagination…), cập nhật giao diện theo **state** | `frontend/src/pages`, `components` |
| **Vite 6** | Công cụ chạy/đóng gói frontend | Khởi động nhanh, tự tải lại khi sửa; có **proxy** `/api` → backend để tránh lỗi CORS | `vite.config.ts` |
| **React Router 7** | Điều hướng nhiều trang trong ứng dụng 1 trang (SPA) | Định nghĩa route và chặn trang khi chưa đăng nhập | `App.tsx` (`RequireAuth`) |
| **NestJS 11** | Framework backend Node.js theo kiến trúc **module – controller – service** | Cấu trúc rõ ràng, có sẵn Guard/Pipe/DI, hợp với dự án cần phân quyền | `backend/src/*` |
| **Prisma 6 (ORM)** | Lớp truy cập CSDL bằng mã TypeScript thay vì viết SQL tay | Schema dễ đọc (dùng luôn làm ERD), **migration** quản lý thay đổi CSDL, chống SQL injection, có transaction | `schema.prisma`, mọi `*.service.ts` |
| **PostgreSQL 18** | Hệ quản trị CSDL quan hệ | Mã nguồn mở, miễn phí (mục tiêu chi phí 0 đồng), hỗ trợ khoá ngoại, ràng buộc `UNIQUE`, kiểu `JSON` (cho bản chụp ca tuần 5) | Lưu toàn bộ dữ liệu |
| **embedded-postgres** | Gói npm chứa sẵn PostgreSQL | Máy không cần cài PostgreSQL/Docker; dễ demo trên máy khác | `scripts/dev-db.mjs` |
| **JWT** (`@nestjs/jwt`) | Chuỗi token có chữ ký, chứa `sub` (id) và `role` | Không cần lưu phiên ở server (stateless), hợp với REST API | `auth.service.ts`, `jwt-auth.guard.ts` |
| **bcrypt** (`bcryptjs`) | Hàm băm mật khẩu một chiều có **salt** và chi phí tính toán | Chuẩn an toàn để lưu mật khẩu; lộ CSDL cũng không lộ mật khẩu | `common/password.ts` |
| **class-validator / class-transformer** | Khai báo luật kiểm tra dữ liệu bằng decorator trên DTO | Kiểm tra đầu vào tập trung, tự sinh thông báo lỗi | `*/dto/*.ts`, `setup-app.ts` |
| **Swagger (OpenAPI)** | Tài liệu API tự sinh từ mã | Đáp ứng yêu cầu "tài liệu API"; thử API ngay trên trình duyệt | `/api/docs` |
| **Jest + Supertest** | Khung kiểm thử + công cụ gửi HTTP vào ứng dụng | Kiểm thử đơn vị và kiểm thử API tự động | `*.spec.ts`, `test/week3.e2e-spec.ts` |
| **Playwright** | Tự động điều khiển trình duyệt | Dự kiến tuần 6–7 cho 3 luồng E2E | Chưa dùng |

### 3.3 Các khái niệm NestJS cần nắm để trả lời vấn đáp

| Khái niệm | Vai trò | Ví dụ trong dự án |
| --- | --- | --- |
| **Module** | Gom các thành phần của một chức năng | `AuthModule`, `UsersModule`, `ProjectsModule`, `SuitesModule`, `TestCasesModule` |
| **Controller** | Nhận HTTP request, ánh xạ URL → hàm | `@Post('login')`, `@Get('projects/:projectId/cases')` |
| **Service** | Chứa **quy tắc nghiệp vụ**, gọi CSDL | `TestCasesService.create()` kiểm tra bộ cùng dự án, mã không trùng |
| **DTO** | Lớp mô tả dữ liệu vào + luật kiểm tra | `CreateTestCaseDto` (mã ca, tên, ≥ 1 bước…) |
| **Pipe** | Biến đổi/kiểm tra dữ liệu trước khi vào controller | `ValidationPipe` (toàn cục), `ParseIntPipe` (id trên URL) |
| **Guard** | Quyết định request có được đi tiếp không | `JwtAuthGuard` (401), `RolesGuard` (403) |
| **Decorator** | Gắn thông tin lên lớp/hàm | `@Public()`, `@Roles(Role.ADMIN)`, `@CurrentUser()` |
| **Exception Filter** | Chuyển lỗi thành phản hồi HTTP | `PrismaExceptionFilter`: lỗi trùng dữ liệu → 409 |
| **Dependency Injection** | Nest tự tạo và "tiêm" đối tượng phụ thuộc | Service nhận `PrismaService` qua constructor |

## 4. Đăng nhập và phân quyền hoạt động thế nào

### 4.1 Luồng đăng nhập

```
Người dùng      React (LoginPage)          NestJS (AuthController/Service)         PostgreSQL
    │ nhập email/mk  │                                │                                  │
    │───────────────►│ POST /api/auth/login           │                                  │
    │                │───────────────────────────────►│ ValidationPipe kiểm tra DTO      │
    │                │                                │ (sai → 400)                      │
    │                │                                │ tìm user theo email ────────────►│
    │                │                                │◄─────────────── passwordHash ────│
    │                │                                │ bcrypt.compare(mk, hash)         │
    │                │                                │ sai → 401 "Email hoặc mật khẩu…" │
    │                │                                │ khoá → 401 "Tài khoản đã bị khoá"│
    │                │◄──── { accessToken, user } ────│ ký JWT {sub, role}, hạn 8h        │
    │                │ lưu token vào localStorage     │                                  │
    │◄── trang Dự án │                                │                                  │
```

### 4.2 Mỗi request sau khi đăng nhập

1. Frontend gắn header `Authorization: Bearer <token>` (hàm `api()` trong `frontend/src/api.ts`).
2. **JwtAuthGuard** (chạy cho mọi route, trừ `@Public()`): không có token / token sai / hết hạn → **401**. Sau đó **đọc lại người dùng trong CSDL**: nếu đã bị khoá → 401 *ngay lập tức*, không cần chờ token hết hạn (tình huống TS-14).
3. **RolesGuard**: route có `@Roles(Role.ADMIN)` mà người dùng là Tester → **403**.
4. **ValidationPipe**: dữ liệu sai luật → **400** kèm danh sách lỗi tiếng Việt; trường lạ (VD: tự gửi `role: "ADMIN"`) → 400.
5. Controller → Service kiểm tra **quy tắc nghiệp vụ** → Prisma → PostgreSQL.

> **Điểm nhấn khi báo cáo:** việc ẩn nút trên giao diện chỉ để tiện dùng. Quyền thật sự được kiểm tra ở backend — gọi thẳng API bằng Postman/Swagger bằng tài khoản Tester vẫn nhận 403 (đúng ý đề cương mục 2.8: "Không coi việc ẩn nút ở giao diện là biện pháp phân quyền đầy đủ").

### 4.3 Ma trận phân quyền hiện tại

| Thao tác | Chưa đăng nhập | Tester | Admin |
| --- | :-: | :-: | :-: |
| Đăng nhập | ✔ | ✔ | ✔ |
| Xem / tạo / sửa dự án | 401 | ✔ | ✔ |
| Lưu trữ / mở lại dự án | 401 | **403** | ✔ |
| CRUD bộ kiểm thử, ca kiểm thử | 401 | ✔ | ✔ |
| Quản lý tài khoản (`/api/users`) | 401 | **403** | ✔ |
| Tự khoá / tự hạ quyền chính mình | — | — | **400** (để luôn còn Admin) |

## 5. Quy tắc kiểm tra dữ liệu và nghiệp vụ đã cài đặt

| Đối tượng | Quy tắc | Lỗi trả về |
| --- | --- | --- |
| Đăng nhập | Email đúng định dạng, mật khẩu không rỗng; email được trim + viết thường | 400 |
| Mật khẩu mới | 8–72 ký tự, có cả chữ và số | 400 |
| Tài khoản | Email không trùng | 409 |
| Dự án | Tên bắt buộc, ≤ 100 ký tự, không trùng (không phân biệt hoa thường) | 400 / 409 |
| Dự án đã lưu trữ | Chỉ xem; mọi thao tác ghi lên bộ/ca bị từ chối | 400 |
| Bộ kiểm thử | Tên bắt buộc, không trùng trong dự án; **không xoá bộ còn ca** | 400 / 409 |
| Ca kiểm thử | Mã `[A-Z0-9_-]{2,50}` tự viết hoa, **duy nhất trong dự án**; tên bắt buộc; **≥ 1 bước**, mỗi bước có thao tác và kết quả mong đợi | 400 / 409 |
| Ca kiểm thử | Bộ được chọn **phải thuộc cùng dự án** (quy tắc mục 2.3) | 400 |
| Sửa các bước | Xoá bước cũ + ghi bước mới trong **một transaction** (lỗi giữa chừng không mất dữ liệu) | — |
| Phân trang | `page ≥ 1`, `1 ≤ pageSize ≤ 100` | 400 |

## 6. Thiết kế CSDL (trích `schema.prisma`)

| Bảng | Khoá / ràng buộc chính | Tuần dùng |
| --- | --- | --- |
| `User` | `email` UNIQUE; `role` ∈ {ADMIN, TESTER}; `isActive`; `passwordHash` | 3 |
| `Project` | `name` UNIQUE; `isArchived` (lưu trữ thay vì xoá) | 3 |
| `TestSuite` | FK `projectId`; UNIQUE (`projectId`, `name`) | 3 |
| `TestCase` | FK `projectId`, `suiteId`; UNIQUE (`projectId`, `code`); `priority`; người tạo/sửa | 3 |
| `TestStep` | FK `caseId` (xoá ca → xoá bước); UNIQUE (`caseId`, `order`) | 3 |
| `TestRun` | FK `projectId`; `version`; `status` ∈ {OPEN, CLOSED} | 5 |
| `RunCase` | **Bản chụp** mã, tên, tiền điều kiện, các bước (`JSON`) lúc tạo đợt; FK tới ca gốc `ON DELETE SET NULL` | 5 |
| `TestResult` | 1–1 với `RunCase`; `status` ∈ {UNTESTED, PASSED, FAILED, BLOCKED} | 5 |

Lý do thiết kế `RunCase` lưu bản sao thay vì chỉ tham chiếu: khi ca gốc bị sửa/xoá sau này, nội dung đợt kiểm thử cũ **vẫn giữ nguyên** — đây là điểm nhấn kỹ thuật của đề tài.

## 7. Kết quả kiểm thử tuần 3

Chạy: `npm test` (7/7 đạt) và `npm run test:e2e` (26/26 đạt) trên PostgreSQL 18 nhúng, Windows 11, Node 22.12.

| Mã | Tình huống | Mong đợi | KQ |
| --- | --- | --- | --- |
| TS-01 | Đăng nhập đúng (Admin, Tester) | 200 + token | Đạt |
| TS-02 | Sai mật khẩu | 401 | Đạt |
| TS-03 | Email sai định dạng, mật khẩu rỗng | 400 + 2 thông báo | Đạt |
| TS-04 | Tài khoản bị khoá | 401 | Đạt |
| TS-05 | Gửi kèm trường lạ `role` khi đăng nhập | 400 | Đạt |
| TS-06 | Email viết hoa + khoảng trắng | 200 | Đạt |
| TS-07 | Gọi API không có token | 401 | Đạt |
| TS-08 | Token giả mạo | 401 | Đạt |
| TS-09 | `/auth/me` không trả `passwordHash` | 200 | Đạt |
| TS-10 | Tester xem danh sách tài khoản | 403 | Đạt |
| TS-11 | Tester tạo tài khoản | 403 | Đạt |
| TS-12 | Tester lưu trữ dự án | 403 | Đạt |
| TS-13 | Admin tạo tài khoản; mật khẩu yếu; trùng email | 201 / 400 / 409 | Đạt |
| TS-14 | Khoá tài khoản → token cũ bị từ chối ngay | 401 | Đạt |
| TS-15 | Admin tự khoá mình | 400 | Đạt |
| TS-16 | Dự án thiếu tên / trùng tên | 400 / 409 | Đạt |
| TS-17 | Tạo ca hợp lệ, mã tự viết hoa, bước đánh số 1..n | 201 | Đạt |
| TS-18 | Tạo ca thiếu tên và không có bước | 400 | Đạt |
| TS-19 | Bước thiếu kết quả mong đợi | 400 | Đạt |
| TS-20 | Trùng mã ca trong dự án | 409 | Đạt |
| TS-21 | Chọn bộ của dự án khác | 400 | Đạt |
| TS-22 | Tìm theo tên + lọc độ ưu tiên | đúng số lượng | Đạt |
| TS-23 | Sửa ca thay toàn bộ bước, ghi người sửa | 200 | Đạt |
| TS-24 | Xoá bộ còn ca | 409 | Đạt |
| TS-25 | Thêm ca vào dự án đã lưu trữ | 400 | Đạt |
| TS-26 | `pageSize = 1000` | 400 | Đạt |

Unit test: `AuthService` (đúng mật khẩu, sai mật khẩu, email không tồn tại cùng thông báo, tài khoản khoá); `RolesGuard` (không gắn @Roles, Admin qua, Tester bị 403).

Ngoài ra đã thử thủ công trên trình duyệt: đăng nhập Tester → không thấy menu "Tài khoản", gõ thẳng `/users` bị đưa về trang Dự án; gửi form ca rỗng hiển thị 4 thông báo lỗi tiếng Việt.

## 8. So sánh với kế hoạch

| | Kế hoạch | Thực tế |
| --- | --- | --- |
| WBS 2.4 | Hoàn thành T3 N5 | **Hoàn thành** |
| WBS 2.5 | Bắt đầu T3 N6, xong T4 N7 | **Đã có bản chạy được** (CRUD, tìm kiếm, lọc, 34 ca demo) |
| Mốc 2 (cuối tuần 4) | ≥ 50% chức năng | Phần chức năng của mốc 2 đã chạy; còn thiếu UML/ERD dạng hình vẽ |

**Kế hoạch tuần 4:** vẽ ERD + Use Case + Sequence từ thiết kế đã cài đặt; rà soát giao diện ca kiểm thử (sao chép ca, chuyển ca sang bộ khác); đo thời gian API danh sách với 1.000 ca; viết tiếp chương 2 báo cáo; commit Git sau mỗi buổi.

## 9. Hạn chế hiện tại (nên chủ động nêu)

- Token lưu trong `localStorage`: đơn giản, nhưng nếu trang bị lỗi XSS thì token có thể bị đọc. Hướng cải thiện: cookie `HttpOnly`.
- Đăng xuất phía server là "stateless": token cũ vẫn hợp lệ tới khi hết hạn (8h) nếu bị sao chép — được giảm thiểu bằng việc Admin khoá tài khoản có hiệu lực ngay.
- Chưa giới hạn số lần đăng nhập sai (rate limit).
- Chưa có kiểm thử giao diện tự động (Playwright – tuần 6–7) và chưa đo hiệu năng.

## 10. Câu hỏi giảng viên có thể hỏi

**Vì sao phân quyền phải làm ở backend?** Giao diện chạy trên máy người dùng, ai cũng có thể sửa hoặc gọi thẳng API. Chỉ backend là nơi đáng tin.

**401 và 403 khác nhau thế nào?** 401 = chưa xác thực được bạn là ai (thiếu/sai token). 403 = biết bạn là ai nhưng bạn không có quyền.

**Vì sao không lưu mật khẩu dạng mã hoá (encrypt) mà dùng băm (hash)?** Mã hoá giải ngược được nếu lộ khoá. Băm là một chiều; khi đăng nhập chỉ so sánh `bcrypt.compare`. Salt khiến hai người cùng mật khẩu vẫn có hash khác nhau.

**JWT chứa gì? Có bị sửa được không?** Chứa `sub` (id) và `role`, có chữ ký bằng `JWT_SECRET`. Sửa nội dung thì chữ ký sai → 401 (TS-08). Nội dung JWT **không bí mật** (chỉ mã hoá base64) nên không đưa thông tin nhạy cảm vào.

**Vì sao role đã có trong token mà vẫn đọc lại CSDL?** Để khoá tài khoản / đổi vai trò có hiệu lực ngay (TS-14), đánh đổi một truy vấn nhỏ mỗi request.

**Vì sao đăng nhập sai email và sai mật khẩu báo cùng một câu?** Tránh để kẻ xấu dò ra email nào có tài khoản trong hệ thống.

**ORM là gì, sao không viết SQL?** ORM ánh xạ bảng thành đối tượng; Prisma sinh câu lệnh tham số hoá (chống SQL injection), có kiểu TypeScript và migration. Vẫn dùng SQL thuần khi cần (VD: `TRUNCATE` trong seed).

**Migration để làm gì?** Lưu lịch sử thay đổi cấu trúc CSDL thành file SQL có thứ tự, máy khác chạy `prisma migrate deploy` là có CSDL giống hệt.

**Transaction dùng ở đâu?** Khi sửa ca: xoá bước cũ + thêm bước mới phải cùng thành công hoặc cùng thất bại. Tuần 5 dùng tiếp khi tạo đợt + bản chụp ca.

**Vì sao lưu trữ dự án thay vì xoá?** Xoá sẽ mất lịch sử các đợt kiểm thử – trái với mục tiêu "tra cứu lịch sử đáng tin cậy".

## 11. Kịch bản demo 5 phút

1. Mở http://localhost:5173 → đăng nhập **sai mật khẩu** → thấy thông báo lỗi.
2. Đăng nhập **Tester** → danh sách 2 dự án; không có menu "Tài khoản", không có nút "Lưu trữ".
3. Vào "Website bán sách BookStore" → bấm bộ "Giỏ hàng", lọc độ ưu tiên "Nghiêm trọng", gõ tìm "đăng nhập".
4. **+ Ca kiểm thử** → bấm Tạo ngay khi để trống → 4 lỗi tiếng Việt → nhập mã `tc_login_07` (tự viết hoa), 2 bước → Tạo.
5. Tạo lại với mã trùng `TC_LOGIN_01` → báo "Mã ca đã tồn tại".
6. Mở Swagger http://localhost:3000/api/docs → gọi `POST /api/auth/login` bằng tài khoản Tester → chép `accessToken` vào nút **Authorize** → gọi `GET /api/users` → **403**: chứng minh phân quyền ở backend.
7. Đăng xuất → đăng nhập **Admin** → trang Tài khoản → khoá tài khoản Tester → (cửa sổ ẩn danh đang đăng nhập Tester bấm F5 → bị đẩy ra trang đăng nhập).
8. Admin **Lưu trữ** một dự án → mở dự án đó: chỉ xem, không sửa được.
9. Mở terminal chạy `npm run test:e2e` → 26/26 đạt.
