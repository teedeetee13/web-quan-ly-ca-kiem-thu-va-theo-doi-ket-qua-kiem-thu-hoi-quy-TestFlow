# BÁO CÁO TIẾN ĐỘ HOÀN THÀNH ĐỀ TÀI

**Đề tài:** Xây dựng ứng dụng web quản lý ca kiểm thử và theo dõi kết quả kiểm thử hồi quy TestFlow

**Sinh viên:** Trần Đức Trường · MSSV 20233802 · Lớp DCCNTT.14.10 · Lớp học phần N09, Nhóm 18 (cá nhân)

**Giảng viên hướng dẫn:** ThS. Mai Văn Linh · **Ngày lập:** 20/11/2026

## 1. Tóm tắt

Toàn bộ phạm vi chức năng và kiểm thử theo kế hoạch đã hoàn thành sớm hơn lịch (kế hoạch: cuối tuần 7). Sáu nhóm chức năng hoạt động, bổ sung thêm phép so sánh mỗi đợt với đợt trước để tự động chỉ ra ca thụt lùi; có 44 tình huống kiểm thử API, 12 unit test và 3 luồng E2E đều đạt; đã đo hiệu năng và thử sao lưu, phục hồi CSDL. Báo cáo 77 trang (60 trang nội dung), slide 14 trang và phiếu tự đánh giá đã có bản hoàn chỉnh.

Các việc còn lại đều là việc sinh viên phải tự thực hiện: quay video demo dự phòng, diễn tập bảo vệ, xác nhận mã đề và quy tắc đặt tên tệp, ký phiếu, nộp hồ sơ. Đánh giá với người dùng bên ngoài chưa thực hiện và được ghi rõ là hạn chế trong báo cáo.

*Bảng 1. Tổng quan sản phẩm*

| Hạng mục | Số liệu |
| --- | --- |
| Nhóm chức năng | 6/6 |
| Màn hình giao diện | 10 |
| API REST | 30, có tài liệu Swagger |
| Bảng CSDL | 8, một migration |
| Mã nguồn | khoảng 6.500 dòng (backend 1.946, frontend 2.797, kiểm thử 782, CSDL và seed 682, script 305) |
| Dữ liệu mẫu | 3 tài khoản, 2 dự án, 7 bộ, 34 ca, 47 bước, 3 đợt |
| Kiểm thử tự động | 12 unit test, 44 tình huống API, 3 luồng E2E: tất cả đạt |
| Hiệu năng | p95 = 33 ms (mục tiêu < 1.000 ms), 1.000 ca, 5 người dùng đồng thời |
| Sao lưu, phục hồi | Thử thành công, dữ liệu khớp mã băm SHA-256 |

## 2. Tiến độ theo WBS

*Bảng 2. Trạng thái các công việc trong WBS*

| STT | Công việc | Kế hoạch | Trạng thái | Kết quả, minh chứng |
| --- | --- | --- | --- | --- |
| 1.1 | Chốt bài toán, phạm vi, xin duyệt | T1 | Hoàn thành | Đề cương; đề tài được triển khai sau bảo vệ đề cương |
| 1.2 | Lập kế hoạch | T1 | Hoàn thành | Kế hoạch dự án (`docs/KE_HOACH_DU_AN.md`) |
| 2.1 | Nghiên cứu nghiệp vụ, đặc tả yêu cầu | T1 | Hoàn thành | Chương 1; Chương 2 mục 2.1, 2.2 |
| 2.2 | Thiết kế UML, ERD, API, giao diện | T2 | Hoàn thành | Chương 2: 13 hình, 14 bảng |
| 2.3 | Khởi tạo mã nguồn, CSDL, seed | T2 | Hoàn thành | `backend/prisma`, `scripts/dev-db.mjs` |
| 2.4 | Đăng nhập, phân quyền, kiểm tra đầu vào | T3 | Hoàn thành 28/10 | Commit tuần 3 trên GitHub; TS-01…TS-15 |
| 2.5 | Dự án, bộ, ca kiểm thử, bộ lọc | T3–T4 | Hoàn thành 28/10 | TS-16…TS-26; 34 ca mẫu |
| 2.6 | Đợt kiểm thử, bản chụp, kết quả | T5 | Hoàn thành 16/11 | `backend/src/runs`; TS-27…TS-36, TS-39…TS-43 |
| 2.7 | Thống kê, xuất CSV, tích hợp | T6 | Hoàn thành 16/11 | TS-33, TS-37, TS-38; 3 đợt demo |
| 2.7+ | So sánh với đợt trước (thụt lùi, đã sửa) – bổ sung ngoài kế hoạch | – | Hoàn thành 20/11 | `compareRuns`; TS-44; 2 unit test |
| 3.1 | Kiểm thử chức năng, quyền, E2E | T6–T7 | Hoàn thành 20/11 (chạy lại toàn bộ) | `docs/ket-qua/kiem-thu-tu-dong.txt`, `e2e-playwright.txt` |
| 3.1 | Thử quy trình thực tế, so sánh với bảng tính | T6–T7 | **Chưa thực hiện** | Phiếu đo đã chuẩn bị (Phụ lục C báo cáo) |
| 3.2 | Sửa lỗi, đo hiệu năng, thử phục hồi | T7 | Hoàn thành 16/11 | `docs/ket-qua/hieu-nang.json`, `sao-luu-phuc-hoi.txt` |
| 3.3 | Viết báo cáo 40–80 trang | T2–T8 | Hoàn thành bản đầy đủ | `HO_SO_NOP/BaoCao_TestFlow.pdf` |
| 3.4 | Slide 10–15 trang, kịch bản demo, video dự phòng | T8 | Slide, kịch bản: hoàn thành. Video: **chưa** | `HO_SO_NOP/Slide_TestFlow.pdf`, `docs/KICH_BAN_DEMO.md` |
| 3.5 | Đóng gói, README, phiếu đánh giá | T8 | Hoàn thành, chờ ký | `README.md`, `HO_SO_NOP/PhieuTuDanhGia_TestFlow.docx` |
| 4.1 | Diễn tập demo và vấn đáp (2 lần) | T8 | **Chưa thực hiện** | Dùng `docs/KICH_BAN_DEMO.md` |
| 4.2 | Nộp Elearning, báo cáo trước GV | T8 | **Chưa thực hiện** | Theo thông báo của GV |

## 3. Các mốc kiểm tra

*Bảng 3. Trạng thái các mốc*

| Mốc | Thời điểm | Điều kiện | Trạng thái |
| --- | --- | --- | --- |
| 1 | Cuối tuần 1 | Duyệt đề tài và kế hoạch | Đạt |
| 2 | Cuối tuần 4 | ≥ 50% chức năng; UML, ERD, bản thảo phân tích thiết kế | Đạt (báo cáo tiến độ tuần 3 ngày 28/10, Chương 2 ngày 06/11) |
| 3 | Cuối tuần 6 | 6 nhóm chức năng tích hợp; luồng hồi quy đầy đủ | Đạt sớm (16/11) |
| 4 | Ngày 4 tuần 8 | Đủ ứng dụng, báo cáo, slide, phiếu, demo dự phòng | Gần đạt: còn video demo |
| 5 | Theo thông báo GV | Nộp hồ sơ, vấn đáp | Chưa đến hạn |

## 4. Danh mục hồ sơ nộp

*Bảng 4. Hồ sơ nộp và trạng thái*

| Hồ sơ | Tệp | Trạng thái |
| --- | --- | --- |
| Báo cáo BTL (PDF và Word) | `HO_SO_NOP/BaoCao_TestFlow.pdf`, `.docx` | Sẵn sàng; cần điền ngày ở Lời cảm ơn và đổi tên tệp theo quy tắc |
| Slide báo cáo | `HO_SO_NOP/Slide_TestFlow.pptx`, `.pdf` | Sẵn sàng |
| Phiếu tự đánh giá mức độ hoàn thành | `HO_SO_NOP/PhieuTuDanhGia_TestFlow.docx`, `.pdf` | Cần sinh viên điền điểm tự đánh giá và ký |
| Báo cáo tiến độ hoàn thành | `HO_SO_NOP/TienDoHoanThanh_TestFlow.docx`, `.pdf` | Sẵn sàng |
| Mã nguồn, CSDL mẫu | Kho GitHub; `backend/prisma/seed.ts` | Cần commit và đẩy phiên bản cuối |
| Hướng dẫn cài đặt, chạy | `HUONG_DAN_CHAY.md`, Phụ lục A báo cáo | Sẵn sàng |
| Tài liệu kiểm thử | Bảng 3.6, 3.7 báo cáo; `docs/ket-qua/` | Sẵn sàng |
| Tài liệu ôn tập bảo vệ | `docs/on-tap/` | Sẵn sàng |
| Kịch bản demo và câu hỏi vấn đáp | `docs/KICH_BAN_DEMO.md` | Sẵn sàng |
| Video demo dự phòng 3–5 phút | – | **Sinh viên tự quay** |

## 5. Việc còn lại trước khi nộp

1. Xác nhận với giảng viên mã đề chính thức và quy tắc đặt tên tệp (kế hoạch ghi: mã đề_MSSV-Tên SV_Bài thi), rồi đổi tên tệp PDF báo cáo.
2. Điền ngày ở trang Lời cảm ơn; điền điểm tự đánh giá và ký phiếu tự đánh giá; xác nhận với GV yêu cầu phiếu cho nhóm 1 người.
3. Quay video demo 3–5 phút theo `docs/KICH_BAN_DEMO.md` (chạy `npm run db:seed` trước khi quay).
4. Diễn tập demo và vấn đáp 2 lần.
5. Commit và đẩy phiên bản cuối lên GitHub.
6. (Tuỳ chọn, nếu còn thời gian) Nhờ một lập trình viên hoặc tester dùng thử, ghi phản hồi và số liệu theo Phụ lục C; khi đó cập nhật mục 3.5 của báo cáo.
