# Kịch bản demo và chuẩn bị vấn đáp

## Chuẩn bị (trước buổi bảo vệ 10 phút)

1. Mở 3 cửa sổ dòng lệnh, chạy `npm run db:start` (backend), `npm run start:dev` (backend), `npm run dev` (frontend).
2. Chạy `npm run db:seed` trong `backend` để đưa dữ liệu về trạng thái chuẩn.
3. Mở sẵn hai cửa sổ trình duyệt: một cửa sổ thường đăng nhập **Tester**, một cửa sổ ẩn danh đăng nhập **Admin**.
4. Mở sẵn Swagger http://localhost:3000/api/docs và Excel để mở tệp CSV.
5. Dự phòng: video demo, cùng `HO_SO_NOP/Slide_TestFlow.pdf` có ảnh các màn hình.

## Demo 5 phút

| # | Thao tác | Câu nói gợi ý |
| --- | --- | --- |
| 1 | Tester mở dự án **BookStore**, gõ "LOGIN" vào ô tìm kiếm, lọc độ ưu tiên "Cao" | "Ca kiểm thử được nhóm theo bộ, tìm được theo mã và tên." |
| 2 | Mở ca **TC_LOGIN_02**, kéo xuống bảng lịch sử | "Bản 1.0 Đạt, bản 1.1 Không đạt, đây là chỗ thụt lùi; bản 1.2 Đạt lại. Hai đợt cũ chạy với 3 bước, ca hiện có 4 bước: lịch sử không bị viết lại." |
| 3 | Vào Đợt kiểm thử → **+ Đợt kiểm thử**, đặt tên "Demo", phiên bản 1.3.0, lọc "Nghiêm trọng", bấm Tạo | "Lúc tạo đợt, hệ thống chụp lại nội dung các ca trong cùng một giao dịch." |
| 4 | Chọn một ca, bấm **Không đạt** rồi Lưu khi chưa nhập gì | "Không đạt mà không mô tả thì lập trình viên không sửa được, nên hệ thống từ chối." |
| 5 | Nhập kết quả thực tế, Lưu; trang tự sang ca kế tiếp, ghi **Đạt** | "Tiến độ và tỷ lệ đạt cập nhật ngay." |
| 6 | Bấm "Xem ca gốc hiện tại", thêm 1 bước, Lưu; quay lại đợt Demo | "Ca gốc giờ nhiều hơn một bước, nhưng đợt vẫn giữ đúng nội dung lúc chạy." |
| 7 | **Đóng đợt** (xác nhận), mở **Thống kê & CSV**, bấm **Xuất CSV**, mở bằng Excel | "Đợt đóng là chốt sổ, không sửa được nữa. CSV mở trong Excel không lỗi tiếng Việt." |
| 7b | Mở thống kê đợt **bản 1.1**, chỉ vào mục **So với đợt trước** | "Tỷ lệ đạt tăng từ 90,5% lên 95,5%, nhưng hệ thống vẫn chỉ ra TC_LOGIN_02 bị thụt lùi. Chỉ nhìn tỷ lệ đạt sẽ bỏ sót lỗi này. Đây là giá trị cốt lõi của theo dõi hồi quy." |
| 8 | Ở cửa sổ Admin: Tài khoản → **Khoá** tài khoản Tester; quay lại cửa sổ Tester, bấm sang trang khác | "Khoá có hiệu lực ngay vì mỗi yêu cầu, máy chủ đều đọc lại trạng thái tài khoản." |
| 9 | Mở khoá lại. Trong Swagger, đăng nhập Tester rồi gọi `GET /api/users` | "403: phân quyền nằm ở backend, ẩn menu ở giao diện chỉ để tiện dùng." |

## Câu hỏi vấn đáp thường gặp

| Câu hỏi | Ý trả lời | Chỉ vào |
| --- | --- | --- |
| Đề tài khác bảng tính ở đâu? | Bảng tính không chặn trùng mã, không giữ lịch sử khi sửa ca, không phân quyền, thống kê phải tự làm | Bảng 1.4 báo cáo |
| Kiểm thử hồi quy là gì? | Chạy lại ca cũ sau thay đổi để phát hiện chức năng bị thụt lùi; cùng bộ ca chạy qua nhiều phiên bản | Ca TC_LOGIN_02 qua 3 đợt |
| Vì sao cần bản chụp? Có vi phạm chuẩn hoá không? | Sửa ca gốc sẽ viết lại lịch sử. Đây là trùng lặp có chủ đích cho dữ liệu lịch sử, giống hoá đơn ghi giá lúc mua | `backend/src/runs/runs.service.ts` hàm `create`; `schema.prisma` model RunCase |
| Tạo đợt mà lỗi giữa chừng thì sao? | Đợt, bản chụp và kết quả nằm trong một lệnh tạo lồng nhau, tức một giao dịch: hoặc đủ hết, hoặc không có gì | TS-30 |
| Bị chặn khác Không đạt thế nào? | Không đạt là phần mềm có lỗi; Bị chặn là chưa chạy được vì trở ngại bên ngoài | Bảng 1.2 |
| Vì sao tỷ lệ đạt không chia cho tổng số ca? | Chưa chạy và Bị chặn chưa nói gì về chất lượng; mẫu số bằng 0 thì hiển thị "chưa có dữ liệu" | `computeStats` trong `runs.service.ts`, unit test `runs.service.spec.ts` |
| 401 khác 403? | 401: chưa biết bạn là ai; 403: biết nhưng không đủ quyền. Guard xác thực chạy trước guard phân quyền | `backend/src/app.module.ts` |
| Token đã có vai trò, sao còn đọc CSDL? | Để khoá tài khoản có hiệu lực ngay, không chờ 8 giờ token hết hạn | `jwt-auth.guard.ts`, TS-14 |
| Lưu mật khẩu thế nào? | Băm bcrypt 10 vòng có muối; không lưu dạng rõ, API không trả `passwordHash` | `common/password.ts` |
| Đợt đã đóng có mở lại được không? | Không. Kết quả là căn cứ quyết định phát hành; cần kiểm tra lại thì tạo đợt mới | TS-40, TS-41 |
| Đo hiệu năng thế nào? | Script tạo 1.000 ca, 5 người dùng ảo gửi liên tục 30 giây, 5 loại truy vấn; p95 33 ms. Giới hạn: đo cùng máy | `backend/scripts/perf.mjs`, Bảng 3.8 |
| Sao lưu thế nào khi không có pg_dump? | Sao lưu logic ra JSON kèm SHA-256; phục hồi trong một giao dịch, đặt lại bộ đếm id, so mã băm | `backend/scripts/backup.mjs`, `restore.mjs` |
| Vì sao không dùng microservices? | Một người, 8 tuần, một nghiệp vụ; module hoá trong một backend là đủ và tách được về sau | Hình 2.8 |
| Tỷ lệ đạt đã có, sao còn cần so sánh với đợt trước? | Tỷ lệ đạt có thể tăng mà vẫn có ca thụt lùi (bản 1.1: 90,5% → 95,5% nhưng TC_LOGIN_02 hỏng). So sánh ghép từng ca theo ca gốc nên chỉ đúng ca bị thụt lùi | `compareRuns` trong `runs.service.ts`, TS-44 |
| Hạn chế lớn nhất? | Chưa đánh giá với người dùng bên ngoài; phân quyền chưa theo dự án; token ở localStorage | Mục 3.5.2 |

Nếu gặp câu chưa chắc: nói rõ phạm vi đã làm, đánh đổi đã chọn và hướng cải tiến, đừng đoán.
