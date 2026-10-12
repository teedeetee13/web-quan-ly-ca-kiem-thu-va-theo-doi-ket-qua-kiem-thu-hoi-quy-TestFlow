# KẾ HOẠCH THỰC HIỆN DỰ ÁN BÀI TẬP LỚN

Học phần: Đồ án chuyên ngành CNPM (IT3228)  
Học kỳ: 1    Năm học: 2026-2027

Tên đề tài: Xây dựng ứng dụng web quản lý ca kiểm thử và theo dõi kết quả kiểm thử hồi quy TestFlow  
Lớp học phần: Đồ án chuyên ngành CNPM – N09    Mã nhóm: 18

### Thông tin nhân sự nhóm

| STT | Họ và tên | Mã sinh viên | Vai trò trong nhóm | Nhiệm vụ chính phụ trách |
| --- | --- | --- | --- | --- |
| 1 | Trần Đức Trường | 20233802 | Nhóm trưởng | Phân tích, thiết kế, lập trình, kiểm thử, báo cáo và bảo vệ |

## I. TỔNG QUAN DỰ ÁN

### 1. Lý do thực hiện dự án

Trong các dự án phần mềm nhỏ, ca kiểm thử thường được lưu rời rạc trong bảng tính. Khi sửa lỗi hoặc phát hành phiên bản mới, người thực hiện khó xác định ca nào cần kiểm tra lại, kết quả trước đó ra sao và những ca nào chưa được thực hiện. TestFlow tập trung quản lý ca kiểm thử và lưu kết quả từng đợt kiểm thử hồi quy trên một ứng dụng web.

Người dùng mục tiêu là sinh viên phát triển phần mềm, lập trình viên cá nhân và nhóm QA nhỏ. Sản phẩm hỗ trợ kiểm thử thủ công; người dùng thực hiện các bước trên phần mềm cần kiểm tra rồi nhập kết quả vào TestFlow.

Qua đối chiếu danh sách 107 đề tài cụ thể trong bộ đề tham khảo, chưa có đề tài quản lý ca kiểm thử và kết quả kiểm thử hồi quy. So với đề 49 và 50 về quản lý công việc, dữ liệu cốt lõi của TestFlow là bước kiểm thử, kết quả mong đợi, đợt kiểm thử và lịch sử kết quả; không xây dựng bảng việc hoặc quy trình giao việc tổng quát.

### 2. Mục tiêu dự án theo tiêu chí SMART

**S - Cụ thể:** Xây dựng web app gồm đăng nhập và phân quyền; quản lý dự án; quản lý bộ ca kiểm thử; tạo đợt kiểm thử; ghi nhận kết quả và ghi chú lỗi; thống kê và xuất kết quả CSV. Có mã nguồn, dữ liệu mẫu và hướng dẫn chạy.

**M - Đo lường:** Hoàn thành 6 nhóm chức năng; có 2 vai trò; dữ liệu demo gồm 2 dự án, tối thiểu 30 ca và 3 đợt kiểm thử. Kiểm chứng ít nhất 30 tình huống kiểm thử ứng dụng và 3 luồng đầu cuối; không còn lỗi chặn luồng chính khi nghiệm thu.

**M - Sản phẩm học phần:** Báo cáo cuối cùng từ 40 đến 80 trang nội dung theo bộ đề tham khảo, không tính bìa, phụ lục và tài liệu tham khảo; slide 10 đến 15 trang; phiếu đánh giá mức độ hoàn thành; kịch bản demo và tài liệu cài đặt. Bản kế hoạch này là tài liệu chuẩn bị, không thay thế báo cáo cuối cùng.

**A - Khả thi:** Một sinh viên thực hiện trong 8 tuần, dự kiến 115 giờ, trung bình khoảng 14–15 giờ/tuần. Dùng một backend và một CSDL; ưu tiên chạy trên máy cá nhân. Kế hoạch giả định sinh viên đã có nền tảng lập trình web và SQL; nếu chưa quen TypeScript, giảm tính năng mở rộng và dành thêm thời gian ở tuần 2.

**R - Phù hợp:** Bao quát phân tích yêu cầu, Use Case, Activity, Class hoặc kiến trúc, Sequence, thiết kế giao diện và CSDL, cài đặt và kiểm thử. Portfolio thể hiện năng lực full-stack cùng một nghiệp vụ có lịch sử dữ liệu và quy tắc trạng thái rõ ràng.

**T - Thời hạn:** Hoàn thành bản sẵn sàng nộp vào ngày 4 tuần 8; nộp và bảo vệ theo lịch giảng viên. Tuần 1 bắt đầu khi được duyệt đề tài. Hạn chính thức: [Điền ngày theo thông báo học phần]. Nếu lịch học phần ngắn hơn 8 tuần, điều chỉnh WBS trước khi triển khai.

### 3. Phạm vi sản phẩm và giải pháp dự kiến

| Nhóm chức năng bắt buộc | Phạm vi và tiêu chí chấp nhận |
| --- | --- |
| Tài khoản và phân quyền | Đăng nhập, đăng xuất; Admin quản lý tài khoản, Tester thao tác dữ liệu kiểm thử. API từ chối người dùng chưa đăng nhập và thao tác vượt quyền. |
| Dự án và bộ kiểm thử | Tạo, sửa, lưu trữ dự án; nhóm ca theo bộ kiểm thử; kiểm tra tên bắt buộc và quan hệ dữ liệu. |
| Ca kiểm thử | Mã ca, tên, tiền điều kiện, bước thực hiện, kết quả mong đợi, độ ưu tiên; tìm kiếm và lọc. |
| Đợt kiểm thử | Chọn dự án, phiên bản và danh sách ca; lưu bản chụp nội dung ca lúc tạo đợt để bảo toàn lịch sử. |
| Kết quả kiểm thử | Trạng thái Chưa chạy, Đạt, Không đạt, Bị chặn; nhập kết quả thực tế và ghi chú; khóa sửa kết quả khi đóng đợt. |
| Thống kê và xuất CSV | Đếm kết quả theo trạng thái, tiến độ và tỷ lệ đạt; tỷ lệ đạt = Đạt / (Đạt + Không đạt), hiển thị chưa có dữ liệu khi mẫu số bằng 0; xuất CSV theo đợt. |

Công nghệ dự kiến: React + TypeScript + Vite cho giao diện; NestJS cho REST API; PostgreSQL cho dữ liệu; Jest và Playwright để kiểm thử. Kiến trúc: trình duyệt → REST API → CSDL. Thực thể chính: User, Project, TestSuite, TestCase, TestStep, TestRun, RunCase và TestResult.

Chi phí mục tiêu: 0 đồng mua dịch vụ phần mềm/hosting trong giai đoạn học phần, tận dụng máy và kết nối Internet sẵn có. Không yêu cầu tên miền, AI API, SMS, thanh toán hoặc lưu trữ đám mây. Bản demo dùng localhost và video; triển khai online chỉ khi có nguồn lực và điều kiện phù hợp.

Ngoài phạm vi bắt buộc: tự động chạy kiểm thử, tích hợp Jira/GitHub, chatbot AI, tải tệp minh chứng và cộng tác thời gian thực. Chỉ cân nhắc nhập CSV hoặc đính kèm ảnh sau khi các chức năng chính và báo cáo đã hoàn thành.

### 4. Tính thực tế đối với thị trường và doanh nghiệp

Đề tài giải quyết một nhu cầu có thật trong doanh nghiệp phần mềm: tổ chức ca kiểm thử, thực hiện kiểm thử trước phát hành và tổng hợp kết quả để đánh giá chất lượng phiên bản. TestFlow được định hướng là công cụ nội bộ gọn nhẹ cho nhóm phát triển nhỏ đang dùng bảng tính; quy mô mục tiêu đề xuất là 2–5 người dùng, chưa phải nhóm khách hàng đã được khảo sát.

Bằng chứng thị trường: Theo case study do TestRail công bố, Photron từng quản lý kiểm thử các sản phẩm CAD bằng nhiều tệp Excel, gây khó khăn khi theo dõi lịch sử, tiến độ và so sánh kết quả. Doanh nghiệp chuyển sang TestRail để tập trung dữ liệu kiểm thử và báo cáo. Tài liệu Testmo cũng mô tả quy trình ca kiểm thử → đợt kiểm thử → ghi nhận kết quả. Đây là nguồn của nhà cung cấp, cho thấy bài toán và sản phẩm cùng loại tồn tại; không chứng minh TestFlow đã được doanh nghiệp chấp nhận.

| Nhu cầu nghiệp vụ | Cách TestFlow đáp ứng |
| --- | --- |
| Tránh bỏ sót ca trước phát hành | Chọn bộ ca cho từng phiên bản; thấy rõ ca chưa chạy, đạt, không đạt và bị chặn. |
| Kiểm tra lại sau khi sửa lỗi | Tạo đợt mới dùng các ca đã có; đối chiếu kết quả giữa những đợt kiểm thử. |
| Tra cứu lịch sử đáng tin cậy | Giữ bản chụp ca theo đợt; sửa ca gốc không làm thay đổi nội dung lịch sử. |
| Tổng hợp tình trạng kiểm thử | Thống kê trạng thái và xuất CSV phục vụ rà soát trước phát hành; quyết định phát hành do người phụ trách đưa ra. |

### Cách kiểm chứng giá trị sử dụng

Tuần 1: tìm trao đổi với ít nhất 1 lập trình viên hoặc tester đang làm dự án để kiểm tra ba nhu cầu: quản lý ca, truy xuất lịch sử và tổng hợp kết quả. Ghi nhận vấn đề, công cụ hiện tại và phản hồi; không giả định họ là khách hàng hoặc cam kết sử dụng.

Tuần 6–7: dùng một ứng dụng có thể chạy được làm đối tượng kiểm thử; xây dựng 20 ca và thực hiện 2 đợt tương ứng 2 phiên bản. Với cùng dữ liệu, đo thời gian tạo đợt, tra cứu ca không đạt và tổng hợp báo cáo trên bảng tính và TestFlow. Ghi số liệu thực đo, kể cả kết quả không cải thiện; không đặt trước phần trăm tiết kiệm.

Tiêu chí bổ sung: hoàn thành luồng nghiệp vụ trên dữ liệu của ứng dụng mẫu, giữ đúng lịch sử và báo cáo chính xác; có biên bản phản hồi nếu tiếp cận được người dùng. Nếu chỉ tự thử nghiệm, ghi rõ giới hạn này và không kết luận đã kiểm chứng nhu cầu tại một doanh nghiệp cụ thể.

Đánh giá: Đủ tính thực tế để giữ làm đồ án và portfolio. Thị trường đã có TestRail, Qase và Testmo; khả năng bán hoặc được doanh nghiệp lựa chọn cần thêm kiểm chứng, độ tin cậy, hỗ trợ vận hành và lợi thế phù hợp. Bản học phần ưu tiên chứng minh một quy trình sử dụng hoàn chỉnh.

Nguồn đối chiếu ngày 12/10/2026:  
<https://www.testrail.com/customers/photron/>  
<https://support.testmo.com/hc/en-us/articles/47544002336653-Test-Runs>

## II. KẾ HOẠCH TRIỂN KHAI VÀ PHÂN CHIA CÔNG VIỆC

T = tuần; N = ngày trong tuần kế hoạch. Các mốc được đổi sang ngày thực tế sau khi duyệt đề tài. SV = sinh viên duy nhất trong nhóm. Giờ ghi trong công việc là ước lượng.

| STT | Giai đoạn và công việc cụ thể | Người phụ trách | Bắt đầu | Kết thúc | Kết quả đầu ra dự kiến | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | GIAI ĐOẠN 1 KHỞI ĐỘNG |  | T1 N1 | T1 N4 | Đề tài và kế hoạch đề xuất | Chưa làm |
| 1.1 | Đối chiếu đề tài; chốt bài toán, phạm vi và xin duyệt (3 giờ) | SV | T1 N1 | T1 N2 | Tên đề tài; mô tả phạm vi; xác nhận của GV | Chưa làm |
| 1.2 | Lập kế hoạch; xác định đầu ra và tiến độ (2 giờ) | SV | T1 N3 | T1 N4 | Kế hoạch theo mẫu, sẵn sàng nộp duyệt | Đang làm |
| 2 | GIAI ĐOẠN 2 THỰC THI |  | T1 N4 | T6 N3 | Ứng dụng tích hợp và tài liệu thiết kế | Chưa làm |
| 2.1 | Nghiên cứu nghiệp vụ, nhu cầu thực tế; đặc tả yêu cầu (8 giờ) | SV | T1 N4 | T1 N7 | Nguồn thị trường; ghi nhận phản hồi nếu có; yêu cầu, Use Case và tiêu chí chấp nhận | Chưa làm |
| 2.2 | Thiết kế UML, ERD, API và wireframe (8 giờ) | SV | T2 N1 | T2 N5 | Activity, Class/kiến trúc, Sequence; ERD và giao diện chính | Chưa làm |
| 2.3 | Khởi tạo mã nguồn, CSDL, seed và cấu hình chạy (5 giờ) | SV | T2 N6 | T2 N7 | Frontend/backend chạy; migration và dữ liệu mẫu | Chưa làm |
| 2.4 | Cài đặt đăng nhập, phân quyền và kiểm tra đầu vào (8 giờ) | SV | T3 N1 | T3 N5 | API và giao diện đăng nhập; kiểm tra quyền ở backend | Chưa làm |
| 2.5 | Cài đặt dự án, bộ ca, ca kiểm thử và bộ lọc (16 giờ) | SV | T3 N6 | T4 N7 | CRUD và tìm kiếm; ít nhất 30 ca demo | Chưa làm |
| 2.6 | Cài đặt đợt kiểm thử, bản chụp ca và kết quả (16 giờ) | SV | T5 N1 | T5 N7 | Luồng chọn ca → tạo đợt → ghi kết quả → đóng đợt | Chưa làm |
| 2.7 | Cài đặt dashboard, xuất CSV và tích hợp (6 giờ) | SV | T6 N1 | T6 N3 | Thống kê đúng; xuất CSV; 3 đợt demo có dữ liệu | Chưa làm |
| 3 | GIAI ĐOẠN 3 HOÀN THIỆN VÀ KIỂM THỬ |  | T2 N3 | T8 N4 | Ứng dụng, báo cáo và slide sẵn sàng nghiệm thu | Chưa làm |
| 3.1 | Kiểm thử chức năng, quyền, E2E và thử quy trình thực tế (10 giờ) | SV | T6 N4 | T7 N1 | 30 tình huống; 3 E2E; thử 20 ca qua 2 phiên bản; số liệu so sánh với bảng tính | Chưa làm |
| 3.2 | Sửa lỗi, kiểm thử lại; kiểm tra hiệu năng và phục hồi (8 giờ) | SV | T7 N2 | T7 N4 | Không còn lỗi chặn luồng chính; log đo hiệu năng; phục hồi backup thành công | Chưa làm |
| 3.3 | Viết và hoàn thiện báo cáo theo rubric (14 giờ) | SV | T2 N3 | T8 N2 | Báo cáo 40–80 trang nội dung; UML, ảnh giao diện, kiểm thử và tài liệu tham khảo | Chưa làm |
| 3.4 | Thiết kế slide và kịch bản demo (4 giờ) | SV | T8 N3 | T8 N4 | Slide 10–15 trang; kịch bản demo; video dự phòng | Chưa làm |
| 3.5 | Đóng gói, rà soát file nộp và phiếu đánh giá (3 giờ) | SV | T8 N3 | T8 N4 | README; mã nguồn; seed; PDF báo cáo và phiếu đánh giá | Chưa làm |
| 4 | GIAI ĐOẠN 4 NGHIỆM THU |  | T8 N5 | T8 N7 | Nộp đúng hạn và tham gia bảo vệ | Chưa làm |
| 4.1 | Tự tập duyệt demo và vấn đáp (3 giờ) | SV | T8 N5 | T8 N6 | 2 lần diễn tập; trả lời kiến trúc, dữ liệu, công nghệ và hạn chế | Chưa làm |
| 4.2 | Nộp qua Elearning; báo cáo trước giảng viên (1 giờ) | SV | T8 N7 | T8 N7 | Xác nhận nộp; sản phẩm demo; tham gia vấn đáp theo lịch GV | Chưa làm |

Tổng khối lượng dự kiến: 115 giờ. Giai đoạn 1: 5 giờ; giai đoạn 2: 67 giờ; giai đoạn 3: 39 giờ; giai đoạn 4: 4 giờ. Đây là khối lượng làm việc, không bao gồm thời gian chờ giảng viên phản hồi.

Yêu cầu phi chức năng: mật khẩu được băm; API kiểm tra quyền và dữ liệu đầu vào; danh sách có phân trang; không đưa mật khẩu hoặc cấu hình bí mật vào mã nguồn. Mục tiêu đo trên máy demo: p95 thời gian phản hồi API danh sách dưới 1 giây, với 1.000 ca kiểm thử và 5 người dùng đồng thời; ghi rõ cấu hình máy và điều kiện đo.

Trường hợp kiểm thử trọng tâm: truy cập vượt quyền; tạo ca thiếu trường; lưu kết quả không hợp lệ; sửa ca gốc sau khi tạo đợt; sửa kết quả của đợt đã đóng; thống kê khi chưa có kết quả; xuất CSV có dấu tiếng Việt; lưu trữ dự án mà vẫn giữ được lịch sử.

## III. CÁC MỐC KIỂM TRA TIẾN ĐỘ QUAN TRỌNG

| Mốc | Thời điểm | Điều kiện kiểm tra |
| --- | --- | --- |
| 1 | Cuối tuần 1 | Giảng viên duyệt đề tài 108 và kế hoạch; thống nhất phạm vi, lịch nộp và yêu cầu hồ sơ. |
| 2 | Cuối tuần 4 | Tối thiểu 50% chức năng: đăng nhập/phân quyền, dự án/bộ ca, ca kiểm thử hoạt động; có UML, ERD, bản thảo phân tích và thiết kế. |
| 3 | Cuối tuần 6 | 6 nhóm chức năng đã tích hợp; thực hiện được luồng hồi quy đầy đủ; chuyển trọng tâm sang kiểm thử và hoàn thiện tài liệu. |
| 4 | Ngày 4 tuần 8 | Đóng băng phạm vi; đủ ứng dụng, báo cáo, slide, phiếu đánh giá và bản demo dự phòng; dành khoảng 3 ngày dự phòng. |
| 5 | Theo thông báo GV | Nộp hồ sơ lên Elearning đúng hạn, kiểm tra xác nhận nộp và tham gia vấn đáp. |

## IV. QUẢN LÝ RỦI RO

| Tình huống rủi ro | Ảnh hưởng | Giải pháp phòng ngừa và xử lý |
| --- | --- | --- |
| Một người bị ốm hoặc thiếu thời gian | Cao | Theo dõi giờ làm mỗi tuần; hoàn tất trước hạn 3 ngày; cắt phần mở rộng trước; báo GV khi ảnh hưởng mốc bắt buộc. |
| Đề mở chưa được duyệt hoặc bị cho là gần đề quản lý công việc | Cao | Trình bày rõ đối tượng TestCase, TestRun và lịch sử kết quả; xin duyệt trước khi lập trình; điều chỉnh theo phản hồi GV. |
| Máy hỏng, mất mã nguồn hoặc CSDL | Cao | Commit sau mỗi buổi; sao lưu mã nguồn và tài liệu vào nơi thứ hai; backup CSDL hằng tuần và thử phục hồi ở tuần 7. |
| Framework mới làm chậm tiến độ | Vừa | Thực hiện mẫu đăng nhập và CRUD nhỏ ở tuần 2; dùng REST và cấu trúc module đơn giản; không thêm microservices. |
| Sửa ca kiểm thử làm thay đổi lịch sử đợt cũ | Cao | Lưu bản chụp ca khi tạo đợt, dùng giao dịch khi tạo đợt và kết quả; kiểm thử sửa ca gốc và khóa đợt. |
| Mất mạng hoặc môi trường demo lỗi | Vừa | Chuẩn bị bản localhost, seed và backup đã kiểm chứng; có video demo; tập chạy lại từ README trước bảo vệ. |
| Thiếu báo cáo, phiếu đánh giá hoặc bỏ vấn đáp | Cao | Dùng checklist hồ sơ từ tuần 7; xác nhận quy định phiếu cho nhóm 1 người với GV; theo dõi lịch nộp và vấn đáp. |

## V. TIÊU CHÍ ĐÁNH GIÁ ĐÓNG GÓP

Nhóm có 1 sinh viên, chịu trách nhiệm toàn bộ công việc. Tỷ lệ đóng góp dự kiến là 100%; mức độ hoàn thành được xác định bằng sản phẩm, lịch sử mã nguồn, kết quả kiểm thử và hồ sơ nộp. Không thực hiện đánh giá chéo giữa các thành viên.

| Tiêu chí tự đánh giá | Trọng số | Minh chứng hoàn thành |
| --- | --- | --- |
| Phân tích và thiết kế | 20% | Đặc tả; Use Case và mô tả; Activity; Class/kiến trúc; Sequence; giao diện và ERD nhất quán. |
| Cài đặt chức năng | 40% | 6 nhóm chức năng hoạt động; dữ liệu mẫu; phân quyền backend; bảo toàn lịch sử; hướng dẫn chạy. |
| Kiểm thử và chất lượng | 20% | Ít nhất 30 tình huống; 3 E2E; kiểm tra hiệu năng; backup phục hồi; không còn lỗi chặn luồng chính. |
| Báo cáo và bàn giao | 15% | Báo cáo 40–80 trang nội dung; slide; phiếu đánh giá; mã nguồn và README; xác nhận nộp đúng hạn. |
| Chuẩn bị bảo vệ | 5% | 2 lần tập duyệt; giải thích UML, công nghệ, luồng dữ liệu, hạn chế và hướng phát triển. |

Mức A (90–100%): Hoàn thành đủ đầu ra, đúng hạn, minh chứng rõ. Mức B (70–89%): Hoàn thành phần lớn đầu ra, còn thiếu sót nhỏ. Mức C (50–69%): Thiếu đầu ra quan trọng hoặc cần sửa nhiều. Mức D (dưới 50%): Chưa hoàn thành phần cốt lõi.

Các trọng số trên dùng tự theo dõi tiến độ; điểm học phần thực hiện theo thang chấm và quy định của giảng viên, không mặc định lấy điểm nhóm nhân tỷ lệ tự đánh giá.

### Hồ sơ bàn giao và giá trị portfolio

Hồ sơ học phần: báo cáo PDF theo quy tắc mã đề_MSSV-Tên SV_Bài thi; slide báo cáo; phiếu đánh giá theo yêu cầu GV; mã nguồn, CSDL mẫu, hướng dẫn chạy và tài liệu kiểm thử. Xác nhận mã đề chính thức và yêu cầu ký/scan phiếu cho nhóm 1 người trước khi nộp.

Portfolio: README mô tả vấn đề, phạm vi, kiến trúc và cách chạy; ảnh chụp 4 màn hình chính; video demo 3–5 phút; dữ liệu mẫu; tài liệu API; kết quả kiểm thử thực tế. Điểm nhấn kỹ thuật là bản chụp ca theo đợt, phân quyền API và quy tắc đóng đợt. Demo đề xuất: tạo ca → tạo đợt → ghi Không đạt → sửa ca gốc → chứng minh lịch sử đợt cũ vẫn giữ nguyên → xem thống kê và xuất CSV.

### Tài liệu căn cứ

1. Mẫu kế hoạch thực hiện dự án (bài tập lớn) do sinh viên cung cấp.  
2. Bộ đề tham khảo 2025–2026 môn Đồ án chuyên ngành CNPM, IT3228, mã bộ đề 04, trang 1–5.  
3. Tài liệu React và TypeScript: <https://react.dev/learn/typescript>  
4. Hướng dẫn Vite: <https://vite.dev/guide/>  
5. Hướng dẫn NestJS: <https://docs.nestjs.com/first-steps>  
6. Giấy phép PostgreSQL: <https://www.postgresql.org/about/licence/>  
Các tài liệu công nghệ được đối chiếu ngày 12/10/2026.
