# PHỤ LỤC

## Phụ lục A. Hướng dẫn cài đặt và chạy

Yêu cầu: Node.js 22 trở lên. Không cần cài PostgreSQL hay Docker vì dự án dùng PostgreSQL nhúng.

**Cài đặt lần đầu**

```
cd backend
npm install
copy .env.example .env        (đổi JWT_SECRET thành chuỗi ngẫu nhiên)
cd ../frontend
npm install
```

**Mỗi lần chạy (3 cửa sổ dòng lệnh)**

*Bảng A.1. Các lệnh chạy ứng dụng*

| Cửa sổ | Thư mục | Lệnh | Kết quả |
| --- | --- | --- | --- |
| 1 | `backend` | `npm run db:start` | PostgreSQL chạy ở cổng 5433 |
| 2 | `backend` | `npm run db:deploy`, `npm run db:seed` (lần đầu), `npm run start:dev` | API tại http://localhost:3000/api, Swagger tại /api/docs |
| 3 | `frontend` | `npm run dev` | Giao diện tại http://localhost:5173 |

**Tài khoản demo (dữ liệu giả lập):** Admin `admin@testflow.local` / `Admin@123`; Tester `tester@testflow.local` / `Tester@123`; tài khoản đã khoá `locked@testflow.local` / `Locked@123`.

*Bảng A.2. Các lệnh kiểm thử và vận hành*

| Lệnh | Thư mục | Tác dụng |
| --- | --- | --- |
| `npm test` | `backend` | 12 unit test |
| `npm run test:e2e` | `backend` | 44 tình huống kiểm thử API (cần CSDL đang chạy, đã seed) |
| `npm install`, `npx playwright install chromium`, `npm test` | `e2e` | 3 luồng E2E (cần CSDL, API và giao diện đang chạy) |
| `npm run perf` | `backend` | Đo hiệu năng 1.000 ca, 5 người dùng đồng thời |
| `npm run db:backup` | `backend` | Sao lưu CSDL ra `backend/backups` |
| `npm run db:restore` | `backend` | Phục hồi từ bản sao lưu mới nhất |
| `npm run db:seed` | `backend` | Xoá sạch và tạo lại dữ liệu demo |

## Phụ lục B. Ví dụ tệp CSV xuất từ đợt kiểm thử

Trích 20 dòng đầu tệp xuất từ đợt "Hồi quy trước phát hành 1.0" (tệp đầy đủ: `docs/ket-qua/vi-du-xuat-csv-dot-1.csv`):

```
"Dự án","Website bán sách BookStore"
"Đợt kiểm thử","Hồi quy trước phát hành 1.0"
"Phiên bản","1.0.0"
"Trạng thái đợt","Đã đóng"
"Tổng số ca","22"
"Đạt","19"
"Không đạt","2"
"Bị chặn","1"
"Chưa chạy","0"
"Tỷ lệ đạt","90.5%"

"STT","Mã ca","Tên ca","Độ ưu tiên","Trạng thái","Kết quả thực tế","Ghi chú","Người thực hiện","Thời điểm"
"1","TC_CART_01","Thêm sách vào giỏ","Nghiêm trọng","Đạt","","","Nguyễn Văn Kiểm","08:34:00 20/10/2026"
"2","TC_CART_02","Cập nhật số lượng trong giỏ","Cao","Đạt","","","Nguyễn Văn Kiểm","08:38:00 20/10/2026"
"3","TC_CART_03","Nhập số lượng âm","Trung bình","Đạt","","","Nguyễn Văn Kiểm","08:42:00 20/10/2026"
"4","TC_CART_04","Xoá sách khỏi giỏ","Cao","Đạt","","","Nguyễn Văn Kiểm","08:46:00 20/10/2026"
"5","TC_CART_05","Giỏ hàng giữ nguyên sau khi tải lại trang","Trung bình","Đạt","","","Nguyễn Văn Kiểm","08:50:00 20/10/2026"
"6","TC_CART_06","Thêm sách đã hết hàng","Cao","Bị chặn","","Chưa có dữ liệu sách tồn kho = 0 trên môi trường thử","Nguyễn Văn Kiểm","08:54:00 20/10/2026"
"7","TC_LOGIN_01","Đăng nhập thành công với tài khoản hợp lệ","Nghiêm trọng","Đạt","","","Nguyễn Văn Kiểm","08:58:00 20/10/2026"
```

## Phụ lục C. Phiếu thu thập phản hồi và đo so sánh với bảng tính

Phiếu dùng cho hướng đánh giá giá trị sử dụng (mục 3.5 và Kết luận). Chỉ ghi nhận khi có người tham gia thật; không tự điền câu trả lời.

**Phần 1. Phản hồi người dùng**

1. Hiện anh/chị tổ chức ca kiểm thử và kết quả bằng công cụ nào?
2. Khó khăn lớn nhất khi kiểm tra lại một phiên bản mới là gì?
3. Anh/chị có cần tra cứu nội dung và kết quả của các đợt cũ không? Bao lâu một lần?
4. Anh/chị có thực hiện được các thao tác chính trên TestFlow (tạo ca, tạo đợt, ghi kết quả, xem thống kê) mà không cần hướng dẫn không?
5. Điểm nào gây nhầm lẫn hoặc cần cải thiện?

**Phần 2. Đo thời gian thao tác** (cùng 20 ca, cùng người thực hiện)

*Bảng C.1. Mẫu ghi số liệu so sánh*

| Thao tác | Bảng tính (giây) | TestFlow (giây) | Ghi chú |
| --- | --- | --- | --- |
| Chuẩn bị đợt mới cho phiên bản thứ hai | | | |
| Tìm các ca Không đạt của phiên bản trước | | | |
| Tổng hợp báo cáo tỷ lệ đạt của đợt | | | |

## Phụ lục D. Tiến độ thực hiện đồ án

*Bảng D.1. Tiến độ thực hiện đề tài*

| TT | Nội dung thực hiện | Thời gian |
| --- | --- | --- |
| 1 | Xây dựng đề cương; chốt mục tiêu, phạm vi và cấu trúc báo cáo | 14/10 – 15/10/2026 |
| 2 | Nộp đề cương | 15/10 – 16/10/2026 |
| 3 | Bảo vệ, chỉnh sửa đề cương theo góp ý | 16/10 – 19/10/2026 |
| 4 | Phân tích yêu cầu, thiết kế CSDL, khởi tạo mã nguồn | 20/10 – 27/10/2026 |
| 5 | Cài đặt đăng nhập, phân quyền, dự án, bộ và ca kiểm thử (Mốc 2) | 28/10 – 06/11/2026 |
| 6 | Hoàn thiện Chương 2: UML, ERD, đặc tả, API | 06/11/2026 |
| 7 | Cài đặt đợt kiểm thử, kết quả, thống kê, xuất CSV; kiểm thử API, E2E; đo hiệu năng; thử sao lưu phục hồi; hoàn thiện báo cáo | 07/11 – 16/11/2026 |
| 8 | Bổ sung so sánh hồi quy giữa hai đợt; rà soát, hoàn thiện báo cáo và hồ sơ | 17/11 – 20/11/2026 |
| 9 | Hoàn thiện theo ý kiến giảng viên; diễn tập demo và vấn đáp | 21/11 – 07/12/2026 |
| 10 | Nộp báo cáo | Từ 07/12/2026, theo thông báo |
| 11 | Thi vấn đáp | Theo lịch Khảo thí |
