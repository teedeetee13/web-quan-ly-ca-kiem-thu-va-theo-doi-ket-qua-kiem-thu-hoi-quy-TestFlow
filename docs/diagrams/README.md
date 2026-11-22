# Sơ đồ Chương 2

| File | Hình trong Chương 2 |
| --- | --- |
| `bfd.svg` | Hình 2.1. Sơ đồ phân cấp chức năng |
| `usecase_tong_quat.svg` | Hình 2.2. Use Case tổng quát |
| `usecase_tai_khoan.svg` | Hình 2.3. Phân rã Use Case tài khoản |
| `usecase_du_an.svg` | Hình 2.4. Phân rã Use Case dự án và bộ kiểm thử |
| `usecase_ca_kiem_thu.svg` | Hình 2.5. Phân rã Use Case ca kiểm thử |
| `usecase_dot_kiem_thu.svg` | Hình 2.6. Phân rã Use Case đợt kiểm thử, kết quả, thống kê |

- **Chèn vào Word:** Insert → Pictures, chọn file `.svg` (giữ nét khi phóng to).
- **Sửa nội dung:** sửa chữ trong `gen_diagrams.py`, rồi trong thư mục `Testflow` chạy `python docs/diagrams/gen_diagrams.py`. Không sửa trực tiếp file SVG.
- **Sơ đồ phân cấp chức năng:** ô nét đứt là chức năng chưa cài đặt. Khi hoàn thành, đổi `False` thành `True` ở chức năng tương ứng trong `gen_diagrams.py` rồi chạy lại.
- **Hình 2.7–2.13** (Activity, kiến trúc, lớp, Sequence, ERD) viết bằng Mermaid ngay trong `CHUONG_2_PHAN_TICH_THIET_KE.md`. Xem trên GitHub, hoặc dán khối mã vào https://mermaid.live để xuất PNG/SVG.
