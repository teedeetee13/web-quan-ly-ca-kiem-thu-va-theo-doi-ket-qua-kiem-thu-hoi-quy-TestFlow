# KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

## 1. Kết quả đạt được

Đề tài đã xây dựng hoàn chỉnh ứng dụng web TestFlow hỗ trợ quản lý ca kiểm thử và theo dõi kết quả kiểm thử hồi quy cho nhóm phát triển nhỏ. Các kết quả chính:

- **Sản phẩm:** sáu nhóm chức năng gồm tài khoản và phân quyền, dự án và bộ kiểm thử, ca kiểm thử, đợt kiểm thử, kết quả kiểm thử, thống kê và xuất CSV; 10 màn hình giao diện, 30 API REST có tài liệu Swagger, cơ sở dữ liệu 8 bảng và dữ liệu mẫu 2 dự án, 34 ca, 3 đợt.
- **Theo dõi hồi quy tự động:** thống kê mỗi đợt so sánh với đợt liền trước, chỉ ra ca thụt lùi và ca đã sửa, kể cả khi tỷ lệ đạt chung vẫn tăng.
- **Giải pháp bảo toàn lịch sử:** bản chụp nội dung ca khi tạo đợt, kết hợp khoá đợt đã đóng và lưu trữ dự án thay vì xoá. Sửa hoặc xoá ca gốc không làm thay đổi kết quả của các đợt đã thực hiện.
- **Bảo mật:** mật khẩu băm bằng bcrypt, xác thực bằng JWT, phân quyền và kiểm tra dữ liệu tại backend, khoá tài khoản có hiệu lực ngay.
- **Chất lượng đã kiểm chứng:** 44/44 tình huống kiểm thử API, 12/12 unit test, 3/3 luồng E2E đạt; p95 thời gian phản hồi API danh sách là 33 ms với 1.000 ca và 5 người dùng đồng thời (mục tiêu dưới 1 giây); thử sao lưu và phục hồi cơ sở dữ liệu thành công.
- **Tài liệu:** báo cáo, sơ đồ UML và ERD, hướng dẫn cài đặt, kịch bản demo và các nhật ký kiểm thử làm minh chứng.

Qua quá trình thực hiện, sinh viên đã vận dụng đầy đủ quy trình phát triển phần mềm từ phân tích yêu cầu, mô hình hoá, thiết kế cơ sở dữ liệu đến cài đặt và kiểm thử nhiều mức; nắm được luồng dữ liệu từ giao diện qua API đến cơ sở dữ liệu và giải thích được các quyết định thiết kế.

Hạn chế chính là chưa đánh giá giá trị sử dụng với người dùng bên ngoài và chưa đo so sánh thời gian thao tác với bảng tính; các hạn chế kỹ thuật khác đã nêu ở mục 3.5.2.

## 2. Hướng phát triển

- **Đánh giá với người dùng thực tế:** dùng TestFlow cho một ứng dụng thật qua hai phiên bản, đo thời gian chuẩn bị đợt, tra cứu ca không đạt và tổng hợp báo cáo so với bảng tính; thu thập phản hồi của lập trình viên và tester theo phiếu ở Phụ lục C.
- **Mở rộng nghiệp vụ:** nhập ca từ tệp CSV; phân quyền thành viên theo dự án; lưu lịch sử mọi lần sửa kết quả trong một đợt; đính kèm ảnh chụp minh chứng lỗi; biểu đồ xu hướng tỷ lệ đạt qua nhiều phiên bản.
- **Tích hợp:** liên kết ca Không đạt với công cụ theo dõi lỗi (GitHub Issues, Jira); nhận kết quả từ các bộ kiểm thử tự động.
- **Bảo mật và vận hành:** chuyển token sang cookie `httpOnly`, bổ sung refresh token và thu hồi phiên; đóng gói Docker và triển khai trực tuyến; sao lưu tự động định kỳ.
