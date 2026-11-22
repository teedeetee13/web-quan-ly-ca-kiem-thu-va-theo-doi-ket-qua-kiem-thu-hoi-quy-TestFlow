# Tài liệu TestFlow

| Cần gì | Mở tệp |
| --- | --- |
| **Hồ sơ nộp** (báo cáo, slide, phiếu tự đánh giá, tiến độ: Word/PowerPoint/PDF) | [../HO_SO_NOP](../HO_SO_NOP) |
| **Hướng dẫn sử dụng** cho người dùng, kèm ví dụ thực tế từ đầu đến cuối | [HUONG_DAN_SU_DUNG.md](HUONG_DAN_SU_DUNG.md) |
| Đưa lên Internet (Netlify + Render + Neon, miễn phí) | [TRIEN_KHAI.md](TRIEN_KHAI.md) |
| Nội dung báo cáo dạng Markdown (nguồn để dựng file Word) | [bao-cao/](bao-cao) và [CHUONG_2_PHAN_TICH_THIET_KE.md](CHUONG_2_PHAN_TICH_THIET_KE.md) |
| Tiến độ hoàn thành và danh mục hồ sơ | [TIEN_DO_HOAN_THANH.md](TIEN_DO_HOAN_THANH.md) |
| Kịch bản demo 5 phút và câu hỏi vấn đáp | [KICH_BAN_DEMO.md](KICH_BAN_DEMO.md) |
| Kế hoạch dự án ban đầu (WBS, mốc, rủi ro) | [KE_HOACH_DU_AN.md](KE_HOACH_DU_AN.md) |
| Minh chứng: nhật ký kiểm thử, số liệu hiệu năng, sao lưu phục hồi, CSV mẫu | [ket-qua/](ket-qua) |
| Sơ đồ (SVG, PNG) và ảnh giao diện | [diagrams/](diagrams), [screenshots/](screenshots) |
| Ôn tập trước bảo vệ: bản chất đề tài, hiểu mã nguồn | [on-tap/](on-tap) |
| Tài liệu cũ giữ làm minh chứng quá trình (báo cáo tuần 3) | [luu-tru/](luu-tru) |

**Dựng lại toàn bộ hồ sơ nộp** sau khi sửa nội dung Markdown (cần Microsoft Word và PowerPoint):

```bash
cd docs/build
npm install
npm run all
```
