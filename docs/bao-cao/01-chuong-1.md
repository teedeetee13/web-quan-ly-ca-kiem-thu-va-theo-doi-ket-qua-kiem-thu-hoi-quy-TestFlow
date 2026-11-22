# Chương 1. Cơ sở lý thuyết và khảo sát bài toán

Chương này trình bày các khái niệm nền tảng của đề tài: kiểm thử phần mềm, ca kiểm thử, kiểm thử hồi quy; quy trình quản lý ca, đợt và kết quả kiểm thử; tổng quan công nghệ web được lựa chọn; khảo sát các công cụ cùng loại để xác định phạm vi; và phương pháp thực hiện.

## 1.1. Kiểm thử phần mềm, ca kiểm thử và kiểm thử hồi quy

### 1.1.1. Kiểm thử phần mềm

Kiểm thử phần mềm là hoạt động thực thi phần mềm theo những cách đã định trước, kể cả những cách sử dụng sai, nhằm phát hiện lỗi trước khi phần mềm đến tay người dùng [6]. Kiểm thử không chứng minh được phần mềm không còn lỗi; nó chỉ giảm khả năng lỗi lọt ra ngoài. Vì vậy, chất lượng kiểm thử phụ thuộc vào việc chọn đúng tình huống cần kiểm tra và thực hiện lặp lại được.

Người viết mã thường chỉ thử "đường thuận lợi", tức là cách sử dụng mà họ đã nghĩ tới khi lập trình. Lỗi lại thường nằm ở những đường không ai thử: nhập sai định dạng, bỏ trống trường bắt buộc, thao tác khi chưa đủ điều kiện. Người kiểm thử đóng vai người dùng, chủ động thử cả những cách dùng sai, nên phát hiện được những lỗi mà người viết mã dễ bỏ sót.

Theo cách thực hiện, kiểm thử chia làm hai loại:

- **Kiểm thử thủ công:** con người làm theo các bước và quan sát kết quả. Phù hợp với chức năng còn thay đổi, với đánh giá giao diện và trải nghiệm, và với nhóm nhỏ chưa có nguồn lực tự động hoá.
- **Kiểm thử tự động:** máy thực hiện các bước bằng mã kiểm thử và tự so sánh kết quả. Phù hợp với chức năng ổn định cần chạy lại nhiều lần, nhưng tốn công viết và bảo trì mã kiểm thử.

TestFlow phục vụ kiểm thử thủ công: người dùng thực hiện các bước trên phần mềm cần kiểm thử và ghi kết quả vào TestFlow. Bản thân TestFlow lại được kiểm thử bằng kiểm thử tự động (Chương 3).

### 1.1.2. Ca kiểm thử

Ca kiểm thử (test case) là mô tả một tình huống kiểm tra đủ rõ để người khác thực hiện lại và cho cùng một cách đánh giá. Trong đề tài, một ca kiểm thử gồm các thành phần ở Bảng 1.1.

*Bảng 1.1. Thành phần của một ca kiểm thử*

| Thành phần | Ý nghĩa | Lý do cần có |
| --- | --- | --- |
| Mã ca | Định danh ngắn, ví dụ TC_LOGIN_02 | Gọi tên nhanh khi trao đổi, tránh nhầm ca |
| Tên ca | Mô tả ngắn điều được kiểm tra | Biết ca dùng để làm gì |
| Tiền điều kiện | Trạng thái cần có trước khi bắt đầu | Hai người thực hiện cùng ca phải xuất phát từ cùng điều kiện |
| Các bước | Thao tác theo thứ tự | Mọi người làm giống nhau |
| Kết quả mong đợi của từng bước | Thước đo đúng hoặc sai | Không có thước đo thì không thể kết luận có lỗi; gắn theo từng bước để biết hỏng ở bước nào |
| Độ ưu tiên | Mức quan trọng: Nghiêm trọng, Cao, Trung bình, Thấp | Khi thiếu thời gian, biết chọn ca nào để chạy trước |

Ví dụ ca TC_LOGIN_02 "Đăng nhập bằng mật khẩu sai": tiền điều kiện là có tài khoản thử nghiệm đang hoạt động; bước 1 nhập tên tài khoản hợp lệ, mong đợi ô email nhận giá trị; bước 2 nhập mật khẩu sai, mong đợi ô mật khẩu hiển thị dạng ẩn; bước 3 bấm Đăng nhập, mong đợi không tạo phiên đăng nhập và hiển thị thông báo phù hợp.

Các ca được nhóm theo chức năng thành **bộ kiểm thử** (test suite), ví dụ bộ "Đăng nhập", bộ "Giỏ hàng". Các bộ thuộc một **dự án**, tương ứng với một phần mềm được kiểm thử.

### 1.1.3. Kiểm thử hồi quy

"Hồi quy" (regression) nghĩa là thụt lùi: phần mềm quay về trạng thái tệ hơn trước khi thay đổi. Kiểm thử hồi quy là việc chạy lại các ca kiểm thử đã từng đạt sau mỗi lần phần mềm thay đổi, nhằm phát hiện những chức năng cũ bị hỏng do thay đổi mới [6].

Ví dụ: phiên bản 1.0 của một website bán sách đã kiểm thử đầy đủ. Lập trình viên sửa lỗi mã giảm giá và phát hành bản 1.1, nhưng thay đổi đó đụng vào một hàm kiểm tra phiên dùng chung, khiến chức năng đăng nhập bằng mật khẩu sai hiển thị trang trắng. Nếu chỉ kiểm thử lại phần mã giảm giá, lỗi đăng nhập sẽ lọt ra ngoài. Kiểm thử hồi quy chạy lại cả ca đăng nhập và phát hiện sự thụt lùi này.

Đặc điểm cốt lõi của kiểm thử hồi quy là **cùng một bộ ca được chạy lặp lại qua nhiều phiên bản**. Đây chính là lý do cần một hệ thống quản lý: nếu mỗi ca chỉ chạy một lần, một danh sách giấy là đủ; khi một ca được chạy hàng chục lần qua các phiên bản, cần biết kết quả nào thuộc lần chạy nào và nội dung ca lúc đó ra sao.

Trong thực tế không phải lúc nào cũng đủ thời gian chạy lại toàn bộ ca. Người kiểm thử thường chọn các ca có độ ưu tiên cao và các ca liên quan đến phần vừa thay đổi. Vì vậy hệ thống cần hỗ trợ lọc ca theo bộ và độ ưu tiên khi chọn ca cho một lần chạy.

## 1.2. Quy trình quản lý ca, đợt và kết quả kiểm thử

### 1.2.1. Quy trình tổng quát

Quy trình kiểm thử hồi quy mà TestFlow hỗ trợ gồm các bước:

1. Tạo dự án cho phần mềm cần kiểm thử, tổ chức các bộ kiểm thử theo chức năng.
2. Viết ca kiểm thử với các bước và kết quả mong đợi.
3. Khi có phiên bản mới, tạo một **đợt kiểm thử** (test run) ghi rõ phiên bản, chọn các ca cần chạy lại.
4. Thực hiện từng ca trên phần mềm cần kiểm thử, ghi nhận trạng thái, kết quả thực tế và ghi chú.
5. Xem thống kê đợt để người phụ trách quyết định có phát hành hay không; xuất kết quả ra tệp CSV khi cần báo cáo.
6. Đóng đợt để chốt kết quả. Lần kiểm tra sau tạo đợt mới.

### 1.2.2. Trạng thái kết quả

Mỗi ca trong một đợt có một trong bốn trạng thái (Bảng 1.2).

*Bảng 1.2. Bốn trạng thái kết quả kiểm thử*

| Trạng thái | Ý nghĩa | Hướng xử lý |
| --- | --- | --- |
| Chưa chạy | Chưa ai thực hiện ca trong đợt này | Thực hiện ca |
| Đạt | Mọi bước cho kết quả đúng như mong đợi | Không cần xử lý |
| Không đạt | Đã thực hiện và có bước cho kết quả khác mong đợi, tức phần mềm có lỗi | Lập trình viên sửa mã, kiểm thử lại ở đợt sau |
| Bị chặn | Không thực hiện được vì trở ngại bên ngoài: thiếu dữ liệu thử, môi trường hỏng | Gỡ trở ngại rồi thực hiện lại |

Trạng thái Bị chặn phải tách riêng khỏi Không đạt. Nếu gộp lại, lập trình viên sẽ đi tìm một lỗi không tồn tại trong mã nguồn. Với kết quả Không đạt hoặc Bị chặn, người kiểm thử cần mô tả kết quả thực tế hoặc lý do; phần so sánh giữa kết quả mong đợi và kết quả thực tế chính là mô tả lỗi giúp lập trình viên tái hiện vấn đề.

### 1.2.3. Chỉ số thống kê

Hai chỉ số chính của một đợt:

- **Tiến độ** = số ca đã có kết quả (khác Chưa chạy) / tổng số ca trong đợt.
- **Tỷ lệ đạt** = số ca Đạt / (số ca Đạt + số ca Không đạt).

Tỷ lệ đạt không chia cho tổng số ca, vì ca Chưa chạy và Bị chặn chưa cho biết gì về chất lượng phần mềm. Nếu chia cho tổng số ca, một đợt mới chạy 2 ca và cả hai đều đạt sẽ có tỷ lệ đạt 2% trên 100 ca, gây hiểu nhầm là phần mềm rất tệ. Khi mẫu số bằng 0, hệ thống hiển thị "chưa có dữ liệu" thay vì 0%, vì 0% nghĩa là "đã chạy và hỏng hết", khác hẳn với "chưa chạy".

Hai chỉ số trên mới cho biết chất lượng của *một* phiên bản. Bản chất của kiểm thử hồi quy là so sánh *giữa các phiên bản*, nên cần thêm phép **so sánh với đợt liền trước**: một ca đợt trước Đạt mà đợt này Không đạt là ca **thụt lùi**, dấu hiệu thay đổi mới làm hỏng chức năng cũ, cần ưu tiên xử lý; ngược lại, ca đợt trước Không đạt mà đợt này Đạt là ca **đã sửa**, xác nhận lỗi đã được khắc phục. Tỷ lệ đạt có thể tăng dù vẫn xuất hiện ca thụt lùi, vì vậy phép so sánh này không thể thay bằng việc nhìn tỷ lệ đạt.

TestFlow chỉ cung cấp số liệu; quyết định phát hành thuộc về người phụ trách. Ví dụ, một phiên bản vẫn có thể phát hành khi còn một ca Không đạt có độ ưu tiên thấp.

### 1.2.4. Yêu cầu bảo toàn lịch sử

Nội dung ca kiểm thử thay đổi theo thời gian: giao diện phần mềm thay đổi thì các bước phải viết lại. Nếu đợt kiểm thử chỉ lưu tham chiếu tới ca gốc, việc sửa ca gốc sẽ làm thay đổi nội dung của các đợt đã thực hiện: một kết quả "Không đạt ở bước 3" của tháng trước có thể trỏ vào một bước hoàn toàn khác sau khi ca được viết lại. Lịch sử sai kéo theo thống kê sai.

Giải pháp phổ biến là **bản chụp** (snapshot): khi tạo đợt, nội dung ca tại thời điểm đó được sao chép vào đợt. Cách này tương tự hoá đơn bán hàng lưu giá tại thời điểm mua thay vì tham chiếu giá hiện tại. Kết hợp với việc khoá đợt đã đóng và lưu trữ dự án thay vì xoá, bản chụp đảm bảo lịch sử kiểm thử luôn phản ánh đúng những gì đã thực hiện. Đây là yêu cầu thiết kế trọng tâm của đề tài.

## 1.3. Tổng quan ứng dụng web và công nghệ sử dụng

### 1.3.1. Kiến trúc ứng dụng web ba tầng

TestFlow là ứng dụng web theo kiến trúc ba tầng:

- **Tầng trình bày:** giao diện chạy trong trình duyệt của người dùng.
- **Tầng nghiệp vụ:** máy chủ API nhận yêu cầu, kiểm tra quyền, kiểm tra dữ liệu và áp dụng quy tắc nghiệp vụ.
- **Tầng dữ liệu:** hệ quản trị cơ sở dữ liệu lưu trữ lâu dài.

Trình duyệt không bao giờ truy cập trực tiếp cơ sở dữ liệu. Vì mã chạy trên trình duyệt có thể bị người dùng sửa đổi, mọi quy tắc cần tin cậy, như phân quyền hay "dự án đã lưu trữ chỉ được xem", phải đặt ở tầng nghiệp vụ.

Giao tiếp giữa giao diện và máy chủ theo phong cách **REST**: mỗi tài nguyên có một đường dẫn (ví dụ `/api/projects/1/cases` là các ca của dự án 1), phương thức HTTP thể hiện thao tác (GET đọc, POST tạo, PATCH sửa, DELETE xoá), dữ liệu trao đổi dạng JSON và mã trạng thái HTTP thể hiện kết quả (200/201 thành công, 400 dữ liệu sai, 401 chưa xác thực, 403 không đủ quyền, 404 không tìm thấy, 409 xung đột).

### 1.3.2. Xác thực và bảo mật

Giao thức HTTP không ghi nhớ người đã đăng nhập giữa các yêu cầu. TestFlow dùng **JSON Web Token (JWT)** [10]: sau khi đăng nhập thành công, máy chủ cấp một token chứa mã người dùng và vai trò, có chữ ký bằng khoá bí mật chỉ máy chủ biết. Mỗi yêu cầu sau gửi kèm token trong header `Authorization`. Nội dung token sửa đổi thì chữ ký không còn khớp và yêu cầu bị từ chối.

Cần phân biệt hai khái niệm:

- **Xác thực** (authentication) trả lời câu hỏi "bạn là ai"; thất bại trả mã 401.
- **Phân quyền** (authorization) trả lời câu hỏi "bạn được làm gì"; thất bại trả mã 403.

Mật khẩu không được lưu dạng rõ mà được băm một chiều bằng **bcrypt** [11]. Thuật toán bcrypt cố ý chậm và dùng giá trị muối ngẫu nhiên, nên hai người cùng mật khẩu có giá trị băm khác nhau và việc dò mật khẩu từ dữ liệu bị lộ rất tốn kém.

### 1.3.3. Công nghệ lựa chọn

Bảng 1.3 tóm tắt công nghệ sử dụng, theo nguyên tắc nêu nhu cầu trước rồi mới chọn công cụ.

*Bảng 1.3. Công nghệ sử dụng và lý do lựa chọn*

| Nhu cầu | Công nghệ | Lý do lựa chọn |
| --- | --- | --- |
| Ngôn ngữ chung cho giao diện và máy chủ | TypeScript 5.7 | Kiểm tra kiểu khi viết mã, phát hiện sớm lỗi sai tên trường; một ngôn ngữ cho cả hai phía phù hợp với dự án một người |
| Giao diện thay đổi theo dữ liệu | React 19 [3] | Tự cập nhật giao diện khi dữ liệu đổi (thêm bước, lọc ca); hệ sinh thái lớn |
| Công cụ phát triển giao diện | Vite 6 [7] | Khởi động nhanh, tự tải lại khi sửa mã; chuyển tiếp `/api` sang máy chủ để tránh lỗi CORS |
| Máy chủ API có cấu trúc rõ | NestJS 11 [4] | Chia module theo chức năng; có sẵn Guard (phân quyền), Pipe (kiểm tra dữ liệu), cơ chế tiêm phụ thuộc giúp kiểm thử dễ |
| Lưu dữ liệu quan hệ, có ràng buộc và giao dịch | PostgreSQL 18 [5] | Hỗ trợ khoá ngoại, ràng buộc duy nhất, giao dịch và kiểu JSON để lưu bản chụp các bước; giấy phép mã nguồn mở |
| Truy cập CSDL an toàn kiểu | Prisma 6 [8] | Mô tả lược đồ ở một tệp duy nhất, sinh mã truy vấn có kiểm tra kiểu và quản lý migration |
| Chạy CSDL không cần cài đặt | embedded-postgres | Mang theo PostgreSQL thật trong dự án; phù hợp mục tiêu chi phí 0 đồng và máy không có Docker |
| Xác thực, bảo vệ mật khẩu | JWT, bcrypt | Chuẩn phổ biến, không cần lưu phiên ở máy chủ |
| Kiểm tra dữ liệu đầu vào | class-validator | Khai báo quy tắc ngay trên lớp DTO, thông báo lỗi tiếng Việt |
| Kiểm thử tự động | Jest, Supertest, Playwright [9] | Unit test, kiểm thử API trên CSDL thật và kiểm thử đầu cuối trên trình duyệt |
| Tài liệu API | Swagger (OpenAPI) | Sinh tài liệu từ mã nguồn, thử gọi API trực tiếp |

Các công cụ cụ thể có thể thay thế (ví dụ Vue thay React, Spring Boot thay NestJS); điều bắt buộc là các thành phần kiến trúc: giao diện, máy chủ chứa quy tắc nghiệp vụ, cơ sở dữ liệu quan hệ. Đề tài dùng một máy chủ duy nhất, không triển khai microservices, vì quy mô một người trong tám tuần không cần đến độ phức tạp đó.

## 1.4. Khảo sát công cụ liên quan và xác định phạm vi

### 1.4.1. Quản lý kiểm thử bằng bảng tính

Bảng tính (Excel, Google Sheets) là cách phổ biến ở nhóm nhỏ: mỗi dòng một ca, mỗi phiên bản một sheet. Cách này dễ bắt đầu nhưng bộc lộ hạn chế khi số ca, số phiên bản và số người tăng lên (Bảng 1.4).

*Bảng 1.4. So sánh bảng tính và TestFlow*

| Nhu cầu | Bảng tính | TestFlow |
| --- | --- | --- |
| Ca có nhiều bước có thứ tự | Nhồi vào một ô hoặc gộp nhiều dòng | Bước là dữ liệu riêng, sắp xếp được |
| Mã ca không trùng | Không có cơ chế chặn | Ràng buộc duy nhất trong dự án |
| Lịch sử qua nhiều phiên bản | Sao chép sheet thủ công | Mỗi đợt tự lưu bản chụp |
| Sửa ca không làm hỏng lịch sử | Sửa sheet gốc làm các bản sao lệch nhau | Bản chụp giữ nguyên |
| Nhiều người cùng làm | Gửi tệp qua lại, khó biết bản mới nhất | Một nơi dùng chung |
| Ai được làm gì | Ai có tệp đều sửa được | Đăng nhập, phân quyền tại máy chủ |
| Thống kê | Tự viết công thức, dễ sai | Tính sẵn theo công thức thống nhất |

Bảng tính không sai, và với khoảng hai mươi ca thì vẫn đủ dùng. Công cụ chuyên dụng phát huy tác dụng khi kiểm thử được lặp lại qua nhiều phiên bản.

### 1.4.2. Công cụ quản lý kiểm thử chuyên dụng

Trên thị trường đã có các công cụ quản lý kiểm thử như TestRail, Testmo và Qase. Tài liệu của Testmo mô tả quy trình ca kiểm thử, đợt kiểm thử và ghi nhận kết quả [12], tương đồng với quy trình ở mục 1.2. Các công cụ này mạnh và nhiều chức năng (tích hợp CI, quản lý lỗi, báo cáo nâng cao) nhưng phần lớn là dịch vụ trả phí và có độ phức tạp vượt nhu cầu của nhóm 2–5 người.

TestFlow không nhằm cạnh tranh với các sản phẩm thương mại. Đề tài xây dựng một phiên bản tối giản, tập trung vào luồng cốt lõi và bài toán bảo toàn lịch sử, để chứng minh một quy trình sử dụng hoàn chỉnh. Các nguồn khảo sát là tài liệu do nhà cung cấp công bố, cho thấy bài toán và sản phẩm cùng loại tồn tại trên thực tế, nhưng không chứng minh TestFlow đã được doanh nghiệp chấp nhận.

### 1.4.3. Phạm vi của đề tài

Từ khảo sát, phạm vi được xác định như sau:

- **Trong phạm vi:** tài khoản và phân quyền hai vai trò; dự án và bộ kiểm thử; ca kiểm thử có bước; đợt kiểm thử có bản chụp; ghi kết quả bốn trạng thái và đóng đợt; thống kê và xuất CSV.
- **Ngoài phạm vi:** tự động chạy kiểm thử, quản lý lỗi kiểu Jira, đính kèm tệp minh chứng, cộng tác thời gian thực, phân quyền theo từng dự án, mô hình nhiều tổ chức, trí tuệ nhân tạo.
- **Ranh giới trách nhiệm:** TestFlow ghi nhận và tổng hợp; con người thực hiện kiểm thử và ra quyết định phát hành.

## 1.5. Phương pháp thực hiện

- **Nghiên cứu tài liệu:** mẫu học phần, quy trình quản lý kiểm thử, tài liệu chính thức của các công nghệ. Nhận định về công cụ khác đều có nguồn trích dẫn.
- **Mô hình hoá:** mô tả tác nhân, luồng nghiệp vụ và dữ liệu bằng UML và ERD; đối chiếu yêu cầu với sơ đồ, giao diện và mã nguồn thông qua bảng truy vết.
- **Phát triển lặp theo kế hoạch WBS:** mỗi tuần hoàn thành một nhóm chức năng theo thứ tự phụ thuộc (đăng nhập → dự án → ca → đợt → thống kê), kiểm thử ngay sau khi cài đặt.
- **Thực nghiệm:** kiểm thử tự động ở ba mức (unit, API, E2E), đo hiệu năng bằng kịch bản tải và thử sao lưu, phục hồi trên dữ liệu thật. Toàn bộ thực nghiệm do sinh viên tự thực hiện trên máy cá nhân; báo cáo nêu rõ điều kiện và giới hạn của phép đo.

## Kết luận chương 1

Chương 1 đã xác định các khái niệm cốt lõi của đề tài: ca kiểm thử gồm các bước có kết quả mong đợi; kiểm thử hồi quy là chạy lại ca qua nhiều phiên bản; một đợt kiểm thử ghi nhận kết quả bốn trạng thái và được thống kê theo công thức tỷ lệ đạt loại trừ ca chưa chạy, bị chặn. Yêu cầu quan trọng nhất là bảo toàn lịch sử, giải quyết bằng bản chụp nội dung ca khi tạo đợt. Chương cũng lý giải lựa chọn kiến trúc ba tầng và các công nghệ TypeScript, React, NestJS, PostgreSQL, Prisma, đồng thời xác định phạm vi dựa trên khảo sát bảng tính và công cụ chuyên dụng. Đây là cơ sở để đặc tả yêu cầu và thiết kế hệ thống ở Chương 2.
