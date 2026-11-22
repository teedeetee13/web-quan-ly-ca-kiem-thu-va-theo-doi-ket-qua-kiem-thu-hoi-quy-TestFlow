# MỞ ĐẦU

## 1. Lý do chọn đề tài

Trong phát triển phần mềm, một chức năng đã chạy đúng ở phiên bản trước vẫn có thể phát sinh lỗi sau khi lập trình viên sửa mã nguồn hoặc bổ sung tính năng. Hiện tượng phần mềm "thụt lùi" này rất phổ biến khi nhiều chức năng dùng chung một đoạn mã. Vì vậy, trước mỗi lần phát hành, nhóm phát triển cần kiểm tra lại những hành vi quan trọng đã từng hoạt động. Hoạt động này gọi là kiểm thử hồi quy. Muốn kiểm thử hồi quy có hệ thống, nhóm cần một danh sách ca kiểm thử rõ ràng, có kết quả mong đợi cho từng bước, và cần lưu lại kết quả của từng lần thực hiện để so sánh giữa các phiên bản.

Với các dự án nhỏ, bảng tính là cách khởi đầu thuận tiện. Tuy nhiên, khi cùng một bộ ca được dùng cho nhiều phiên bản, người thực hiện phải sao chép dữ liệu sang sheet mới, tự tổng hợp trạng thái và tự phân biệt nội dung ca cũ với nội dung đã chỉnh sửa. Khi một ca được sửa sau khi đã chạy, kết quả cũ không còn khớp với nội dung ca, khiến lịch sử kiểm thử mất độ tin cậy. Một case study do TestRail công bố cho thấy doanh nghiệp Photron từng gặp đúng các khó khăn này khi quản lý kiểm thử bằng nhiều tệp Excel và đã chuyển sang công cụ quản lý tập trung [2].

Đề tài "Xây dựng ứng dụng web quản lý ca kiểm thử và theo dõi kết quả kiểm thử hồi quy TestFlow" được lựa chọn để giải quyết vấn đề trên ở quy mô nhóm nhỏ. TestFlow hỗ trợ kiểm thử thủ công: người dùng thực hiện các bước trên phần mềm cần kiểm thử, sau đó ghi nhận kết quả vào TestFlow. Ứng dụng không tự điều khiển trình duyệt và không tự quyết định phần mềm có lỗi hay không. Giá trị của sản phẩm nằm ở việc tái sử dụng ca qua nhiều đợt, bảo toàn lịch sử và tổng hợp tình trạng kiểm thử.

Đề tài phù hợp với học phần Đồ án chuyên ngành Công nghệ phần mềm vì vận dụng đầy đủ các bước của quy trình phát triển phần mềm: phân tích yêu cầu, mô hình hoá UML, thiết kế cơ sở dữ liệu, xây dựng giao diện, lập trình API và kiểm thử. Bản thân nghiệp vụ của đề tài cũng là kiểm thử phần mềm, nên sinh viên vừa xây dựng công cụ vừa áp dụng chính các khái niệm đó để kiểm thử sản phẩm của mình.

## 2. Mục tiêu của đề tài

Mục tiêu tổng quát là xây dựng ứng dụng web TestFlow hỗ trợ lưu ca kiểm thử, tổ chức đợt kiểm thử theo phiên bản và theo dõi kết quả kiểm thử hồi quy; sản phẩm chạy được trên máy cá nhân, có dữ liệu minh hoạ và tài liệu hướng dẫn.

Các mục tiêu cụ thể:

- Hoàn thành sáu nhóm chức năng: tài khoản và phân quyền; dự án và bộ kiểm thử; ca kiểm thử; đợt kiểm thử; kết quả kiểm thử; thống kê và xuất CSV.
- Hỗ trợ hai vai trò Admin và Tester, trong đó quyền được kiểm tra tại backend.
- Bảo toàn lịch sử: sửa hoặc xoá ca gốc không làm thay đổi nội dung các đợt đã thực hiện.
- Chuẩn bị dữ liệu mẫu gồm 2 dự án, tối thiểu 30 ca và 3 đợt kiểm thử.
- Kiểm chứng bằng tối thiểu 30 tình huống kiểm thử ứng dụng và 3 luồng kiểm thử đầu cuối (E2E); đo hiệu năng API danh sách với 1.000 ca và 5 người dùng đồng thời (mục tiêu p95 dưới 1 giây); thử sao lưu và phục hồi cơ sở dữ liệu.

## 3. Nội dung và phạm vi nghiên cứu

Nội dung nghiên cứu gồm: quy trình kiểm thử thủ công và kiểm thử hồi quy; phân tích yêu cầu và mô hình hoá hệ thống; thiết kế cơ sở dữ liệu có bảo toàn lịch sử; cài đặt ứng dụng web ba tầng; kiểm thử chức năng, phân quyền, luồng đầu cuối và hiệu năng.

Đối tượng sử dụng hướng tới là lập trình viên, sinh viên phát triển phần mềm và nhóm kiểm thử nhỏ khoảng 2–5 người đang cần tổ chức dữ liệu kiểm thử theo phiên bản.

Phạm vi bắt buộc gồm sáu nhóm chức năng nêu ở mục tiêu. Ngoài phạm vi: tự động chạy kiểm thử, tích hợp công cụ quản lý lỗi (Jira, GitHub), trí tuệ nhân tạo, đính kèm tệp minh chứng, cộng tác thời gian thực và mô hình nhiều tổ chức. Dữ liệu thử nghiệm do sinh viên tự xây dựng, không dùng dữ liệu của doanh nghiệp.

## 4. Đóng góp của đề tài

- Một ứng dụng web hoàn chỉnh gồm mã nguồn frontend, backend, cơ sở dữ liệu mẫu, tài liệu API và hướng dẫn cài đặt.
- Giải pháp bảo toàn lịch sử kiểm thử bằng bản chụp nội dung ca theo đợt, kết hợp khoá đợt đã đóng và lưu trữ thay vì xoá.
- Bộ kiểm thử tự động gồm 12 unit test, 44 tình huống kiểm thử API trên cơ sở dữ liệu thật và 3 luồng E2E trên trình duyệt, cùng số liệu đo hiệu năng và biên bản thử sao lưu, phục hồi.

## 5. Cấu trúc của báo cáo

Ngoài phần mở đầu, kết luận, tài liệu tham khảo và phụ lục, báo cáo gồm ba chương:

- **Chương 1. Cơ sở lý thuyết và khảo sát bài toán:** khái niệm ca kiểm thử, kiểm thử hồi quy, quy trình quản lý đợt và kết quả; tổng quan công nghệ web sử dụng; khảo sát công cụ liên quan và xác định phạm vi.
- **Chương 2. Phân tích và thiết kế hệ thống:** tác nhân, yêu cầu, Use Case, Activity, kiến trúc, biểu đồ lớp, Sequence, thiết kế cơ sở dữ liệu, API và giao diện.
- **Chương 3. Cài đặt, kiểm thử và đánh giá:** môi trường và tổ chức mã nguồn, cài đặt các nhóm chức năng, dữ liệu mẫu, kết quả kiểm thử, đo hiệu năng, sao lưu phục hồi và đánh giá mức độ hoàn thành.
