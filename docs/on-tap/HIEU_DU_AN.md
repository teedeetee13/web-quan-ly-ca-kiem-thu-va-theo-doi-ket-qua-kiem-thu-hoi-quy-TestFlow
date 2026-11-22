# Hiểu dự án TestFlow: từ nền tảng đến công cụ

> Mục tiêu: trả lời được câu hỏi "tại sao", và khi trả lời thì **chỉ được vào đúng chỗ trong code** hoặc **chạy được một tình huống kiểm thử** để chứng minh.
> Mỗi ý trong tài liệu này có 3 phần: **Ý chính** → **Chỉ vào đâu** → **Chứng minh bằng gì**.

Cách học không bị học vẹt: đừng thuộc câu trả lời. Hãy đọc từng mục, **mở file được chỉ**, và làm phần "Tự kiểm tra" ở cuối (sửa thử một dòng, xem cái gì hỏng). Khi đã tự làm hỏng rồi sửa lại được, bạn sẽ nói về nó như người đã làm ra nó.

---

## Phần 1. Nền tảng: một ứng dụng web chạy như thế nào

### 1.1. Ba tầng, ba tiến trình

```
Trình duyệt (React, cổng 5173)  ──HTTP + JSON──▶  API (NestJS, cổng 3000)  ──SQL──▶  PostgreSQL (cổng 5433)
        giao diện                                   luật nghiệp vụ, bảo mật              lưu trữ lâu dài
```

- **Ý chính:** trình duyệt **không bao giờ** nói chuyện trực tiếp với CSDL. Mọi thứ đi qua API, nên mọi luật (phân quyền, kiểm tra dữ liệu) đặt ở API là chặn được hết.
- **Chỉ vào đâu:** 3 terminal trong [HUONG_DAN_CHAY.md](../../HUONG_DAN_CHAY.md) chính là 3 tầng này. Vite chuyển `/api` sang backend ở [vite.config.ts:9](../../frontend/vite.config.ts).
- **Tại sao tách frontend/backend?** Frontend chạy trên máy người dùng nên **ai cũng sửa được** (F12). Thứ gì cần tin cậy phải ở backend.

### 1.2. HTTP: yêu cầu và phản hồi

Một yêu cầu gồm: **phương thức** (GET đọc, POST tạo, PATCH sửa, DELETE xoá) + **đường dẫn** + **header** (ví dụ token) + **body** (JSON).
Phản hồi có **mã trạng thái**. Dự án này dùng có chủ đích các mã sau:

| Mã | Nghĩa | Ví dụ trong TestFlow | Code sinh ra mã này |
| --- | --- | --- | --- |
| 200/201 | Thành công / đã tạo | Tạo ca thành công | NestJS tự trả |
| 400 | Dữ liệu sai | Ca không có bước nào | [setup-app.ts:24](../../backend/src/setup-app.ts) |
| 401 | **Chưa xác thực**: không biết bạn là ai | Không gửi token | [jwt-auth.guard.ts:35](../../backend/src/common/guards/jwt-auth.guard.ts) |
| 403 | **Không có quyền**: biết bạn là ai nhưng không cho | Tester xem danh sách tài khoản | [roles.guard.ts:20](../../backend/src/common/guards/roles.guard.ts) |
| 404 | Không tìm thấy | Ca id không tồn tại | [test-cases.service.ts:66](../../backend/src/test-cases/test-cases.service.ts) |
| 409 | Xung đột dữ liệu | Trùng mã ca | [test-cases.service.ts:142](../../backend/src/test-cases/test-cases.service.ts) |

**Câu hỏi hay gặp: "401 khác 403 thế nào?"** 401 là "bạn là ai?", 403 là "tôi biết bạn là ai, nhưng bạn không được làm việc này". Chứng minh: TS-07 (không token → 401) và TS-10 (Tester gọi `/users` → 403) trong [week3.e2e-spec.ts](../../backend/test/week3.e2e-spec.ts).

### 1.3. REST API

- **Ý chính:** đường dẫn là **danh từ** (tài nguyên), phương thức là **động từ**. Quan hệ cha–con thể hiện bằng đường dẫn: `GET /api/projects/1/cases` nghĩa là "các ca của dự án 1".
- **Chỉ vào đâu:** mở Swagger http://localhost:3000/api/docs. Toàn bộ API hiện ra, gom theo nhóm. Swagger được bật ở [main.ts:13-19](../../backend/src/main.ts).

### 1.4. CSDL quan hệ

- **Bảng** = một loại đối tượng. **Khoá chính** (`id`) = định danh duy nhất. **Khoá ngoại** = tham chiếu sang bảng khác (`TestCase.projectId` trỏ tới `Project.id`).
- **Ràng buộc** là luật do CSDL tự giữ, kể cả khi code có lỗi. Ví dụ: không cho 2 ca cùng mã trong một dự án ([schema.prisma:104](../../backend/prisma/schema.prisma)).
- **Giao dịch (transaction):** nhiều thao tác "hoặc thành công hết, hoặc không có gì xảy ra".

---

## Phần 2. Bản chất bài toán: TestFlow quản lý cái gì

### 2.1. Nghiệp vụ trong một câu

> Người kiểm thử viết **ca kiểm thử** (các bước + kết quả mong đợi). Mỗi lần phần mềm có phiên bản mới, họ tạo một **đợt kiểm thử** để chạy lại các ca đó (**kiểm thử hồi quy**: kiểm tra lại xem cái cũ có bị hỏng không) và ghi **kết quả** từng ca.

### 2.2. Từ nghiệp vụ ra 8 bảng

```
User ─ tạo ─▶ Project ─┬─▶ TestSuite ─▶ TestCase ─▶ TestStep        (tuần 3: đã làm)
                       └─▶ TestRun ─▶ RunCase ─▶ TestResult           (tuần 5: đợt, kết quả, thống kê)
```

| Bảng | Là gì ngoài đời | Tại sao cần nó |
| --- | --- | --- |
| Project | Phần mềm đang được kiểm thử | Tách dữ liệu nhiều sản phẩm |
| TestSuite | Nhóm ca theo chức năng (Đăng nhập, Giỏ hàng…) | Dự án có hàng trăm ca thì cần nhóm lại |
| TestCase | Một kịch bản kiểm thử | Đối tượng trung tâm |
| TestStep | Một bước: thao tác + kết quả mong đợi | Một ca có **nhiều** bước, có **thứ tự**, nên tách thành bảng riêng thay vì một ô văn bản dài |
| TestRun | Một đợt chạy lại cho phiên bản X | Kiểm thử hồi quy = chạy nhiều lần |
| RunCase | **Bản chụp** của ca tại lúc tạo đợt | Xem mục 2.3 |
| TestResult | Đạt / Không đạt / Bị chặn + ghi chú | Kết quả của từng ca trong từng đợt |

### 2.3. Ý tưởng quan trọng nhất của thiết kế: bản chụp (snapshot)

- **Vấn đề:** tháng 1 chạy đợt kiểm thử, ca TC_LOGIN_02 có 3 bước, kết quả Không đạt. Tháng 2 có người sửa ca thành 5 bước. Nếu đợt tháng 1 chỉ trỏ tới ca gốc, xem lại lịch sử sẽ thấy 5 bước. **Lịch sử bị sai.**
- **Giải pháp:** khi tạo đợt, **chép** nội dung ca sang `RunCase` (mã, tên, độ ưu tiên, các bước dạng JSON).
- **Chỉ vào đâu:** [schema.prisma:136-153](../../backend/prisma/schema.prisma). Dòng 145 là `stepsSnapshot Json`. Dòng 149 là `onDelete: SetNull`: xoá ca gốc thì liên kết thành rỗng, **bản chụp vẫn còn**. Chú thích ở [test-cases.service.ts:120-123](../../backend/src/test-cases/test-cases.service.ts).
- **Nói khi báo cáo:** "Em thiết kế bảng cho tuần 5 ngay từ tuần 3 vì nếu thiết kế sai thì phải đổi CSDL khi đã có dữ liệu."

### 2.4. Các luật nghiệp vụ và chỗ chúng nằm

| Luật | Tại sao | Ở đâu | Kiểm thử |
| --- | --- | --- | --- |
| Mã ca duy nhất **trong một dự án** (hai dự án khác nhau được trùng mã) | Mã ca dùng để gọi nhau trong nhóm | [schema.prisma:104](../../backend/prisma/schema.prisma), [test-cases.service.ts:138-143](../../backend/src/test-cases/test-cases.service.ts) | TS-20 |
| Mã ca tự viết hoa | `tc_login` và `TC_LOGIN` không nên là hai ca | [test-case.dto.ts:38](../../backend/src/test-cases/dto/test-case.dto.ts) | TS-17 |
| Ca phải có ít nhất 1 bước | Ca không có bước thì không chạy được | [test-case.dto.ts:70](../../backend/src/test-cases/dto/test-case.dto.ts) | TS-18 |
| Bộ được chọn phải thuộc cùng dự án | Chặn người dùng sửa request để gắn ca vào bộ của dự án khác | [test-cases.service.ts:131-136](../../backend/src/test-cases/test-cases.service.ts) | TS-21 |
| Không xoá bộ còn ca | Tránh mất ca do bấm nhầm | [suites.service.ts:47-49](../../backend/src/suites/suites.service.ts) | TS-24 |
| Dự án đã lưu trữ chỉ được xem | **Lưu trữ thay vì xoá** để giữ lịch sử | [projects.service.ts:48-54](../../backend/src/projects/projects.service.ts), mọi thao tác ghi đều gọi hàm này | TS-25 |
| Admin không tự khoá hoặc tự hạ quyền | Hệ thống luôn còn người quản trị | [users.service.ts:68-71](../../backend/src/users/users.service.ts) | TS-15 |

---

## Phần 3. Công cụ: mỗi công cụ giải quyết vấn đề gì

Nguyên tắc trả lời "tại sao dùng X": **nêu vấn đề trước, công cụ sau.**

| Công cụ | Vấn đề nó giải quyết | Nếu không có nó thì sao | Chỉ vào |
| --- | --- | --- | --- |
| **TypeScript** | JavaScript không kiểm tra kiểu, gõ sai tên trường chỉ phát hiện khi chạy | Lỗi `undefined` lúc demo | Mọi file `.ts`. Ví dụ [types.ts](../../frontend/src/types.ts) dùng chung kiểu cho frontend |
| **NestJS** | Express quá tự do, dự án lớn dần sẽ rối | Mỗi người tự đặt cấu trúc riêng | Mỗi chức năng một thư mục trong `backend/src/` |
| **Prisma** | Viết SQL tay dễ sai, kết quả không có kiểu | Gõ sai tên cột chỉ biết khi chạy | [schema.prisma](../../backend/prisma/schema.prisma) → sinh code có kiểu + migration |
| **PostgreSQL** | Cần ràng buộc, khoá ngoại, giao dịch, kiểu JSON | Dữ liệu mâu thuẫn | Ràng buộc ở schema; JSON cho bản chụp |
| **embedded-postgres** | Máy không có PostgreSQL/Docker | Mất thời gian cài đặt | [scripts/dev-db.mjs](../../backend/scripts/dev-db.mjs). Vẫn là PostgreSQL thật, chỉ khác cách khởi động |
| **JWT** | HTTP không nhớ ai đã đăng nhập | Phải gửi mật khẩu ở mọi yêu cầu | [auth.service.ts:24-26](../../backend/src/auth/auth.service.ts) |
| **bcrypt** | Lưu mật khẩu thô thì lộ CSDL là lộ hết | Rò rỉ mật khẩu | [password.ts](../../backend/src/common/password.ts) |
| **class-validator** | Dữ liệu từ client không tin được | Dữ liệu rác vào CSDL | Các file `dto/*.dto.ts` |
| **React** | Cập nhật giao diện thủ công bằng DOM rất rối | Code giao diện khó bảo trì | `frontend/src/pages/` |
| **Vite** | Cần máy chủ phát triển nhanh, tự tải lại | Phải tải lại trang thủ công | [vite.config.ts](../../frontend/vite.config.ts) |
| **Jest + Supertest** | Kiểm thử tay 26 tình huống mỗi lần sửa là quá chậm | Sửa chỗ này hỏng chỗ khác mà không biết | [week3.e2e-spec.ts](../../backend/test/week3.e2e-spec.ts) |

### 3.1. Các khái niệm NestJS, gắn với file cụ thể

Lấy chức năng **Ca kiểm thử** làm ví dụ. Mở thư mục `backend/src/test-cases/`:

| Khái niệm | Vai trò (ví dụ quán ăn) | File |
| --- | --- | --- |
| **Module** | Một khu bếp: gom mọi thứ của một chức năng | `test-cases.module.ts` |
| **Controller** | Người phục vụ: nhận yêu cầu, chuyển cho bếp, **không nấu** | `test-cases.controller.ts` |
| **Service** | Đầu bếp: **luật nghiệp vụ** nằm ở đây | `test-cases.service.ts` |
| **DTO** | Mẫu phiếu gọi món: dữ liệu gửi lên phải đúng mẫu | `dto/test-case.dto.ts` |
| **Guard** | Bảo vệ cửa: chặn trước khi vào controller | `common/guards/` |
| **Pipe** | Kiểm tra và chuyển đổi dữ liệu theo DTO | [setup-app.ts:19-31](../../backend/src/setup-app.ts) |
| **Filter** | Đổi lỗi thô thành phản hồi dễ hiểu | [prisma-exception.filter.ts](../../backend/src/common/filters/prisma-exception.filter.ts) |
| **Dependency Injection** | Không tự tạo đồ dùng, xin là được cấp | Constructor ở [test-cases.service.ts:33-36](../../backend/src/test-cases/test-cases.service.ts) xin `PrismaService` và `ProjectsService` |

**Tại sao tách Controller và Service?** Service không biết gì về HTTP nên kiểm thử được riêng ([auth.service.spec.ts](../../backend/src/auth/auth.service.spec.ts) gọi thẳng service, không cần máy chủ). Một luật như `getWritable` viết một lần, dùng lại ở nhiều service.

---

## Phần 4. Đi theo một yêu cầu qua toàn bộ dự án

Đây là phần **chứng minh hiểu dự án tốt nhất**. Nếu giảng viên hỏi "trình bày luồng xử lý", hãy mở lần lượt các file theo thứ tự sau.

**Tình huống:** Tester bấm "Tạo ca" trên giao diện.

| # | Chuyện gì xảy ra | File : dòng |
| --- | --- | --- |
| 1 | Form gom dữ liệu, gọi `api('POST', '/projects/1/cases', {body})` | [CaseFormPage.tsx:92](../../frontend/src/pages/CaseFormPage.tsx) |
| 2 | Hàm `api` gắn header `Authorization: Bearer <token>` lấy từ localStorage | [api.ts:34-42](../../frontend/src/api.ts) |
| 3 | Vite chuyển `/api/...` sang cổng 3000 | [vite.config.ts:9](../../frontend/vite.config.ts) |
| 4 | **JwtAuthGuard**: có token không, chữ ký đúng không, **người dùng còn hoạt động không** (đọc lại CSDL) | [jwt-auth.guard.ts:33-54](../../backend/src/common/guards/jwt-auth.guard.ts) |
| 5 | **RolesGuard**: route này có `@Roles` không? Tạo ca không có, nên cho qua | [roles.guard.ts:16](../../backend/src/common/guards/roles.guard.ts) |
| 6 | **ValidationPipe** đối chiếu body với DTO: mã viết hoa, ít nhất 1 bước, từng bước có đủ 2 trường, bỏ trường lạ | [test-case.dto.ts:36-75](../../backend/src/test-cases/dto/test-case.dto.ts) |
| 7 | Controller nhận DTO đã sạch, gọi service | `test-cases.controller.ts` |
| 8 | Service kiểm tra 3 luật: dự án chưa lưu trữ, bộ thuộc dự án, mã chưa trùng | [test-cases.service.ts:71-73](../../backend/src/test-cases/test-cases.service.ts) |
| 9 | Ghi ca và các bước trong **một lệnh**, đánh số bước 1..n | [test-cases.service.ts:76-88](../../backend/src/test-cases/test-cases.service.ts) |
| 10 | Nếu CSDL báo trùng (hai người tạo cùng lúc) thì Filter đổi thành 409 thay vì 500 | [prisma-exception.filter.ts:11](../../backend/src/common/filters/prisma-exception.filter.ts) |
| 11 | Trả 201 + JSON ca mới; frontend chuyển sang trang chi tiết ca | [CaseFormPage.tsx:93](../../frontend/src/pages/CaseFormPage.tsx) |

Thứ tự 4 → 5 → 6 → 8 được quy định ở [app.module.ts:16-18](../../backend/src/app.module.ts) (guard) và [setup-app.ts](../../backend/src/setup-app.ts) (pipe). Thứ tự này có lý do: **chưa biết là ai thì chưa xét quyền, chưa có quyền thì chưa cần kiểm tra dữ liệu.**

---

## Phần 5. Các câu hỏi "tại sao" và cách trả lời

### Nhóm A: Bảo mật

**A1. Tại sao phân quyền ở backend, giao diện đã ẩn menu rồi?**
Ẩn menu ([Layout.tsx:28](../../frontend/src/components/Layout.tsx)) chỉ để tiện dùng. Người dùng có thể mở F12 và gọi thẳng API. Lớp chặn thật là `@Roles(Role.ADMIN)` ở [users.controller.ts:12](../../backend/src/users/users.controller.ts).
→ **Demo:** đăng nhập Tester, mở Swagger, gọi `GET /api/users` → 403. Hoặc chỉ TS-10, TS-11.

**A2. Tại sao không lưu mật khẩu mà lưu hash? Tại sao bcrypt mà không phải MD5/SHA?**
Hash là một chiều: lộ CSDL cũng không ra mật khẩu. bcrypt **cố tình chậm** (10 vòng = 2^10 lần lặp, [password.ts:4](../../backend/src/common/password.ts)) và có **muối (salt) ngẫu nhiên**, nên hai người cùng mật khẩu vẫn có hash khác nhau và dò từ điển rất tốn thời gian. MD5/SHA được thiết kế để nhanh, nên dò cũng nhanh.
→ **Demo:** mở bảng User bằng `npx prisma studio`, cột `passwordHash` có dạng `$2b$10$...`.

**A3. JWT là gì, có bị làm giả được không?**
Token gồm 3 phần: header, nội dung (`{sub: id, role}`), chữ ký. Chữ ký tạo bằng `JWT_SECRET` chỉ máy chủ biết. Sửa nội dung thì chữ ký không khớp → 401 ([jwt-auth.guard.ts:40-43](../../backend/src/common/guards/jwt-auth.guard.ts)). Nội dung chỉ **mã hoá base64, không bí mật**, nên không để mật khẩu vào token.
→ **Chứng minh:** TS-08 (token giả → 401). Dán token vào jwt.io để thấy nội dung đọc được.

**A4. Token có `role` rồi, sao guard còn đọc lại CSDL mỗi lần?**
Token sống 8 giờ. Nếu Admin khoá một người, chỉ tin token thì người đó còn dùng được 8 giờ. Đọc lại CSDL ([jwt-auth.guard.ts:45-51](../../backend/src/common/guards/jwt-auth.guard.ts)) giúp **khoá có hiệu lực ngay**. Đánh đổi: thêm một truy vấn nhỏ theo khoá chính, chấp nhận được với quy mô này.
→ **Chứng minh:** TS-14.

**A5. Tại sao sai email và sai mật khẩu báo cùng một câu?**
Nếu báo "email không tồn tại", kẻ xấu dò được email nào có tài khoản. Xem [auth.service.ts:16-19](../../backend/src/auth/auth.service.ts). → TS-02.

**A6. Đăng xuất làm gì ở máy chủ?**
Không làm gì ([auth.controller.ts:26-32](../../backend/src/auth/auth.controller.ts)). JWT không lưu ở máy chủ, client xoá token là hết phiên. Hạn chế: token đã bị lộ thì vẫn dùng được tới khi hết hạn. Cách khắc phục (nói nếu được hỏi): danh sách token bị thu hồi hoặc refresh token. **Chưa làm vì ngoài phạm vi.**

**A7. Tại sao gửi thêm trường `role` khi đăng nhập lại bị 400?**
`whitelist` + `forbidNonWhitelisted` ([setup-app.ts:21-22](../../backend/src/setup-app.ts)): chỉ nhận trường có trong DTO. Chặn kiểu tấn công gửi thêm `role: "ADMIN"` khi tạo hoặc sửa dữ liệu. → TS-05.

### Nhóm B: Dữ liệu và CSDL

**B1. Tại sao kiểm tra trùng mã ở service rồi mà CSDL vẫn có ràng buộc unique?**
Service kiểm tra để báo lỗi rõ ràng bằng tiếng Việt. Nhưng nếu hai người bấm "Tạo" cùng lúc, cả hai đều qua bước kiểm tra. Khi đó ràng buộc ở CSDL ([schema.prisma:104](../../backend/prisma/schema.prisma)) là lớp chặn cuối, và Filter đổi lỗi thành 409. **Hai lớp: một lớp để thân thiện, một lớp để chắc chắn.**

**B2. Sửa ca thì xử lý các bước thế nào? Tại sao dùng transaction?**
Xoá hết bước cũ rồi tạo lại theo danh sách mới ([test-cases.service.ts:98-117](../../backend/src/test-cases/test-cases.service.ts)). Đơn giản hơn so sánh từng bước, và thứ tự luôn đúng 1..n. Đặt trong `$transaction`: nếu tạo bước mới lỗi thì việc xoá bước cũ cũng bị huỷ, **ca không bao giờ bị mất hết bước**. → TS-23.

**B3. Tại sao lưu trữ dự án mà không xoá?**
Xoá dự án là mất toàn bộ lịch sử kiểm thử, mà lịch sử là giá trị cốt lõi của kiểm thử hồi quy. Xem [projects.service.ts:74-78](../../backend/src/projects/projects.service.ts).

**B4. Migration là gì?**
Lịch sử thay đổi cấu trúc CSDL, giống "git cho CSDL". Thư mục [prisma/migrations](../../backend/prisma/migrations). Máy khác chỉ cần `npm run db:deploy` là có đúng cấu trúc.

**B5. Seed để làm gì?**
Tạo dữ liệu demo cố định: 3 tài khoản, 2 dự án, 34 ca ([seed.ts](../../backend/prisma/seed.ts)). Kế hoạch yêu cầu tối thiểu 30 ca. Chạy lại là đưa về trạng thái sạch trước khi demo.

**B6. Danh sách lấy dữ liệu và đếm tổng cùng lúc, tại sao?**
Phân trang cần cả trang hiện tại và tổng số bản ghi. Hai truy vấn đặt trong một `$transaction` ([test-cases.service.ts:51-60](../../backend/src/test-cases/test-cases.service.ts)) để số đếm khớp với dữ liệu. Giới hạn `pageSize` tối đa 100 để không ai lấy cả triệu dòng một lần (TS-26).

### Nhóm C: Kiến trúc và lựa chọn

**C1. Tại sao không dùng microservices?**
Một người làm trong 8 tuần, một nghiệp vụ. Microservices thêm mạng, triển khai và đồng bộ dữ liệu mà không giải quyết vấn đề nào của dự án. Nhưng code vẫn **chia module theo chức năng**, nên sau này tách được.

**C2. Tại sao dùng mã ca (TC_LOGIN_02) trong khi đã có `id`?**
`id` là định danh cho máy, tự tăng và vô nghĩa. Mã ca là định danh cho người, dùng khi trao đổi ("ca TC_LOGIN_02 lại lỗi").

**C3. Tại sao có cả `createdBy` và `updatedBy`?**
Truy vết: ai viết, ai sửa lần cuối. Hiển thị ở [CaseFormPage.tsx:120-125](../../frontend/src/pages/CaseFormPage.tsx).

**C4. Tại sao lưu token ở localStorage? Có an toàn không?**
Đơn giản, phù hợp phạm vi đồ án. Rủi ro: nếu trang bị lỗi XSS, mã độc đọc được token. React tự escape nội dung hiển thị nên giảm rủi ro này. Cách an toàn hơn là cookie `httpOnly`. **Nói thẳng đây là đánh đổi có ý thức.**

### Nhóm D: Kiểm thử

**D1. Unit test khác e2e test thế nào?**
Unit test kiểm tra **một lớp** riêng lẻ, giả lập CSDL ([auth.service.spec.ts](../../backend/src/auth/auth.service.spec.ts)), chạy trong mili giây. E2E test gọi **API thật, CSDL thật** từ ngoài vào ([week3.e2e-spec.ts](../../backend/test/week3.e2e-spec.ts)), kiểm tra cả guard, pipe và service ghép lại.

**D2. 26 tình huống được chọn dựa trên gì?**
Mỗi luật ở Phần 2.4 và mỗi lớp bảo mật ở Nhóm A có ít nhất một tình huống đúng và một tình huống sai. Dự án tự kiểm thử chính nó, cũng là đúng chủ đề "quản lý ca kiểm thử".

---

## Phần 6. Kể lại quá trình làm theo thứ tự hợp lý

Khi được hỏi "em làm thế nào", hãy kể theo thứ tự **phụ thuộc** sau. Mỗi bước cần bước trước thì mới làm được:

1. **Đọc nghiệp vụ → vẽ thực thể**: ra 8 bảng ([schema.prisma](../../backend/prisma/schema.prisma)), nghĩ trước bài toán bản chụp cho tuần 5.
2. **Dựng CSDL + migration + seed**: có dữ liệu để thử.
3. **Khung NestJS dùng chung**: tiền tố `/api`, ValidationPipe, Filter ([setup-app.ts](../../backend/src/setup-app.ts)), PrismaService.
4. **Xác thực**: đăng nhập, bcrypt, JWT, `JwtAuthGuard` toàn cục + `@Public()` cho trang đăng nhập.
5. **Phân quyền**: `RolesGuard` + `@Roles(ADMIN)` cho quản lý tài khoản và lưu trữ dự án.
6. **Chức năng theo thứ tự cha → con**: Dự án → Bộ → Ca + Bước. Ca phụ thuộc bộ, bộ phụ thuộc dự án.
7. **Frontend**: hàm `api` chung ([api.ts](../../frontend/src/api.ts)) → đăng nhập → các trang.
8. **Kiểm thử**: viết TS-01..26, chạy, sửa lỗi phát hiện được.

---

## Phần 7. Tự kiểm tra (làm thật, đừng chỉ đọc)

Mỗi bài: sửa → chạy → quan sát → **hoàn tác**. Làm hết là bạn hiểu dự án bằng tay của mình.

| # | Sửa gì | Dự đoán trước, rồi chạy để xem |
| --- | --- | --- |
| 1 | Xoá dòng `@Roles(Role.ADMIN)` ở [users.controller.ts:12](../../backend/src/users/users.controller.ts) | `npm run test:e2e`: tình huống nào hỏng? Vì sao? |
| 2 | Đảo thứ tự 2 guard ở [app.module.ts:17-18](../../backend/src/app.module.ts) | Gọi `/api/users` không token thì trả 401 hay 403? Vì sao thứ tự quan trọng? |
| 3 | Bỏ đoạn đọc CSDL ở [jwt-auth.guard.ts:45-51](../../backend/src/common/guards/jwt-auth.guard.ts), gán `req.user` từ payload | TS-14 còn qua không? |
| 4 | Đổi `ArrayMinSize(1` thành `ArrayMinSize(0` ở [test-case.dto.ts:70](../../backend/src/test-cases/dto/test-case.dto.ts) | Tạo ca không bước trên giao diện được không? |
| 5 | Xoá dòng `getWritable` ở [test-cases.service.ts:71](../../backend/src/test-cases/test-cases.service.ts) | TS-25 thế nào? |
| 6 | Thêm `forbidNonWhitelisted: false` ở [setup-app.ts:22](../../backend/src/setup-app.ts) | TS-05 thế nào? Trường lạ đi đâu? |
| 7 | Trong trình duyệt, F12 → Application → Local Storage → sửa giá trị `testflow.token` thành `abc` rồi bấm sang trang khác | Bị đưa về trang đăng nhập. Lỗi gì từ backend, dòng nào ở frontend xử lý ([api.ts:46](../../frontend/src/api.ts))? |
| 8 | Đăng nhập Tester, gõ thẳng `/users` trên thanh địa chỉ | Bị đẩy về đâu, do dòng nào ([App.tsx:23](../../frontend/src/App.tsx))? Rồi gọi API trong Swagger để thấy backend vẫn chặn |

Sau khi sửa code backend cần chạy lại `npm run build` rồi khởi động lại API (hoặc dùng `npm run start:dev` để tự tải lại). `npm run test:e2e` không cần khởi động lại vì nó tự dựng ứng dụng từ mã nguồn.

---

## Phần 8. Khi gặp câu không trả lời được

- Nói phạm vi: "Phần đó nằm ngoài phạm vi đề tài (xem mục 1.4.3 báo cáo), em đã nêu ở hướng phát triển."
- Nói đánh đổi: "Em chọn cách A vì phạm vi đồ án, nếu triển khai thật em sẽ đổi sang B." (ví dụ localStorage → cookie httpOnly, đăng xuất → thu hồi token).
- **Đừng bịa.** Nói "em chưa tìm hiểu phần đó, em sẽ bổ sung" tốt hơn trả lời sai một cách tự tin.
