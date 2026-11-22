# Triển khai TestFlow lên Internet (miễn phí)

TestFlow có ba phần, mỗi phần cần một nơi chạy khác nhau. **Netlify chỉ chạy được phần giao diện** (tệp tĩnh), không chạy được API NestJS và PostgreSQL. Vì vậy cần ghép ba dịch vụ miễn phí:

```
Netlify (giao diện React)  ──HTTPS──▶  Render (API NestJS)  ──▶  Neon (PostgreSQL)
https://testflow-xxx.netlify.app        https://testflow-api.onrender.com
```

Kho mã đã có sẵn cấu hình: `frontend/netlify.toml` và `render.yaml`. Thời gian làm khoảng 20 phút. Cần một tài khoản GitHub chứa mã nguồn.

## Bước 1. Cơ sở dữ liệu trên Neon

1. Đăng ký tại neon.tech → **Create project** (chọn vùng Singapore cho gần Việt Nam).
2. Sao chép **Connection string**, dạng `postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`.
3. Trên máy, tạo bảng và nạp dữ liệu mẫu vào CSDL này (PowerShell, trong thư mục `backend`):

```powershell
$env:DATABASE_URL="<connection string của Neon>"; npx prisma migrate deploy; npm run db:seed; Remove-Item Env:DATABASE_URL
```

> `db:seed` xoá sạch rồi tạo lại dữ liệu. Chỉ chạy lần đầu, hoặc khi muốn đưa bản demo về trạng thái chuẩn.

## Bước 2. API trên Render

1. Đăng ký tại render.com bằng tài khoản GitHub → **New** → **Blueprint** → chọn kho TestFlow. Render đọc `render.yaml` và tạo dịch vụ `testflow-api`.
2. Điền hai biến khi được hỏi:

| Biến | Giá trị |
| --- | --- |
| `DATABASE_URL` | Connection string của Neon ở bước 1 |
| `CORS_ORIGIN` | Tạm để `http://localhost:5173`; sửa lại ở bước 4 |

   `JWT_SECRET` được Render tự sinh chuỗi ngẫu nhiên.
3. Chờ dựng xong (3–5 phút), mở `https://testflow-api.onrender.com/api/docs`: thấy Swagger là API đã chạy.

## Bước 3. Giao diện trên Netlify

1. netlify.com → **Add new site** → **Import an existing project** → chọn kho TestFlow.
2. **Base directory:** `frontend`. Build command và Publish directory Netlify tự đọc từ `netlify.toml`.
3. **Environment variables** → thêm `VITE_API_BASE` = `https://testflow-api.onrender.com/api` (thay bằng địa chỉ Render thật của bạn).
4. **Deploy**. Xong sẽ có địa chỉ dạng `https://testflow-xxx.netlify.app`. Có thể đổi tên trong **Site configuration → Change site name**.

## Bước 4. Nối hai bên

Quay lại Render → `testflow-api` → **Environment** → sửa `CORS_ORIGIN` thành địa chỉ Netlify, **không có dấu `/` cuối**. Muốn vẫn dùng được khi chạy trên máy thì ghi cả hai, cách nhau dấu phẩy:

```
https://testflow-xxx.netlify.app,http://localhost:5173
```

Lưu lại, Render tự khởi động lại. Mở trang Netlify, đăng nhập `tester@testflow.local` / `Tester@123`.

## Kiểm tra sau khi triển khai

| Kiểm tra | Kết quả đúng |
| --- | --- |
| Đăng nhập Tester | Vào trang Dự án |
| Mở thẳng `…/runs/2/report` rồi nhấn F5 | Vẫn hiện trang thống kê, không báo 404 (nhờ `netlify.toml`) |
| Bấm **Xuất CSV** | Tải về `testflow-dot-2-v1.1.0.csv`, mở bằng Excel đúng tiếng Việt |
| Tester mở `/users` | Bị chặn, không thấy danh sách tài khoản |

## Lưu ý quan trọng

| Vấn đề | Giải thích và cách xử lý |
| --- | --- |
| **Lần mở đầu tiên chờ khoảng 1 phút** | Gói miễn phí của Render cho API "ngủ" sau 15 phút không có ai dùng. Trước khi gửi link cho giảng viên hoặc trước giờ bảo vệ, tự mở `…/api/docs` một lần để đánh thức |
| **Hôm bảo vệ vẫn demo trên máy** | Mạng phòng học có thể chập chờn. Bản trên mạng là để giảng viên tự thử trước hoặc sau buổi bảo vệ |
| Lỗi CORS trên trình duyệt | `CORS_ORIGIN` sai: thừa `/` cuối, thiếu `https://`, hoặc chưa lưu |
| Đăng nhập báo "Failed to fetch" | `VITE_API_BASE` sai hoặc thiếu `/api` ở cuối. Sửa biến xong phải **Deploy lại** trên Netlify vì biến này được gắn vào lúc dựng |
| Ai cũng biết mật khẩu demo | Đây là dữ liệu giả lập. Không nhập dữ liệu thật vào bản demo công khai; sau khi bảo vệ xong có thể khoá tài khoản Admin demo hoặc tắt dịch vụ |

Mỗi lần đẩy mã mới lên nhánh `main`, Netlify và Render tự dựng lại. Nếu có migration mới, Render tự chạy `prisma migrate deploy` trong lệnh dựng.
