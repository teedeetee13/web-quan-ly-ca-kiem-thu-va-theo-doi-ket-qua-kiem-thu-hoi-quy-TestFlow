/**
 * Dựng slide báo cáo bảo vệ (16:9, 14 trang) bằng pptxgenjs.
 * Chạy: npm run slides  →  HO_SO_NOP/Slide_TestFlow.pptx
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import sizeOf from 'image-size';
import PptxGenJS from 'pptxgenjs';

const DOCS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(DOCS, '..', 'HO_SO_NOP', 'Slide_TestFlow.pptx');
const IMG = (p) => path.join(DOCS, p);
const perf = JSON.parse(fs.readFileSync(path.join(DOCS, 'ket-qua', 'hieu-nang.json'), 'utf8'));

const C = { navy: '1E3A8A', blue: '2563EB', ink: '1F2937', muted: '6B7280', soft: 'EEF3FF', line: 'D1D9E6',
  pass: '16A34A', fail: 'DC2626', block: 'D97706', todo: '94A3B8', white: 'FFFFFF' };
const FONT = 'Segoe UI';

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 in
pptx.author = 'Trần Đức Trường';
pptx.title = 'TestFlow – Báo cáo Bài tập lớn';

let n = 0;
function slide(title, kicker) {
  const s = pptx.addSlide();
  n++;
  s.background = { color: C.white };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: C.navy } });
  if (kicker) s.addText(kicker.toUpperCase(), { x: 0.6, y: 0.35, w: 10, h: 0.3, fontFace: FONT, fontSize: 12, bold: true, color: C.blue, charSpacing: 1 });
  s.addText(title, { x: 0.6, y: 0.62, w: 12.2, h: 0.75, fontFace: FONT, fontSize: 28, bold: true, color: C.ink });
  s.addText(`${n}`, { x: 12.4, y: 7.0, w: 0.6, h: 0.3, fontFace: FONT, fontSize: 11, color: C.muted, align: 'right' });
  s.addText('TestFlow · Đồ án chuyên ngành CNPM', { x: 0.6, y: 7.0, w: 6, h: 0.3, fontFace: FONT, fontSize: 11, color: C.muted });
  return s;
}

function bullets(s, items, box) {
  s.addText(
    items.map((t) => {
      const [head, ...rest] = t.split(' — ');
      return rest.length
        ? [{ text: head, options: { bold: true, bullet: true, breakLine: false } }, { text: ` — ${rest.join(' — ')}`, options: { breakLine: true } }]
        : [{ text: t, options: { bullet: true, breakLine: true } }];
    }).flat(),
    { fontFace: FONT, fontSize: 18, color: C.ink, valign: 'top', paraSpaceAfter: 10, ...box },
  );
}

/** Ảnh giữ đúng tỉ lệ, căn giữa trong khung. */
function picture(s, file, box, border = false) {
  const { width, height } = sizeOf(fs.readFileSync(file));
  const r = Math.min(box.w / width, box.h / height);
  const w = width * r, h = height * r;
  const x = box.x + (box.w - w) / 2, y = box.y + (box.h - h) / 2;
  s.addImage({ path: file, x, y, w, h });
  if (border) s.addShape(pptx.ShapeType.rect, { x, y, w, h, line: { color: C.line, width: 1 }, fill: { type: 'none' } });
}

function stat(s, x, y, value, label, color = C.navy) {
  s.addShape(pptx.ShapeType.roundRect, { x, y, w: 2.85, h: 1.45, rectRadius: 0.08, fill: { color: C.soft }, line: { color: C.soft } });
  s.addText(value, { x, y: y + 0.12, w: 2.85, h: 0.75, fontFace: FONT, fontSize: 32, bold: true, color, align: 'center' });
  s.addText(label, { x: x + 0.1, y: y + 0.85, w: 2.65, h: 0.5, fontFace: FONT, fontSize: 13, color: C.muted, align: 'center' });
}

// 1. Trang bìa
{
  const s = pptx.addSlide();
  n++;
  s.background = { color: C.navy };
  s.addText('TRƯỜNG ĐẠI HỌC CÔNG NGHỆ ĐÔNG Á · ĐỒ ÁN CHUYÊN NGÀNH CÔNG NGHỆ PHẦN MỀM', { x: 0.7, y: 0.6, w: 12, h: 0.4, fontFace: FONT, fontSize: 13, color: 'BFD0FF', bold: true });
  s.addText('TestFlow', { x: 0.7, y: 1.7, w: 12, h: 1.1, fontFace: FONT, fontSize: 60, bold: true, color: C.white });
  s.addText('Ứng dụng web quản lý ca kiểm thử và theo dõi kết quả kiểm thử hồi quy', { x: 0.7, y: 2.85, w: 11.5, h: 0.9, fontFace: FONT, fontSize: 26, color: 'E0E7FF' });
  s.addText(
    [
      { text: 'Sinh viên: ', options: { color: 'BFD0FF' } }, { text: 'Trần Đức Trường · 20233802 · DCCNTT.14.10', options: { breakLine: true } },
      { text: 'Lớp học phần: ', options: { color: 'BFD0FF' } }, { text: 'N09 · Nhóm 18 (cá nhân)', options: { breakLine: true } },
      { text: 'Giảng viên hướng dẫn: ', options: { color: 'BFD0FF' } }, { text: 'ThS. Mai Văn Linh' },
    ],
    { x: 0.7, y: 4.6, w: 11, h: 1.5, fontFace: FONT, fontSize: 18, color: C.white, paraSpaceAfter: 6 },
  );
  s.addText('Bắc Ninh, 2026', { x: 0.7, y: 6.7, w: 6, h: 0.4, fontFace: FONT, fontSize: 14, color: 'BFD0FF' });
}

// 2. Vấn đề
{
  const s = slide('Sửa chỗ này, hỏng chỗ khác', 'Vấn đề');
  bullets(s, [
    'Kiểm thử hồi quy — chạy lại các ca cũ sau mỗi lần sửa mã để phát hiện chức năng bị "thụt lùi"',
    'Cùng một bộ ca chạy qua nhiều phiên bản — cần biết kết quả nào thuộc lần chạy nào',
    'Bảng tính — sao chép sheet thủ công, sửa ca làm lịch sử cũ sai lệch, ai có tệp cũng sửa được',
    'Thực tế — Photron chuyển từ nhiều tệp Excel sang công cụ quản lý tập trung vì không theo dõi được lịch sử (TestRail case study)',
  ], { x: 0.6, y: 1.6, w: 7.2, h: 5 });
  s.addShape(pptx.ShapeType.roundRect, { x: 8.3, y: 1.7, w: 4.4, h: 4.6, rectRadius: 0.1, fill: { color: C.soft }, line: { color: C.soft } });
  s.addText(
    [
      { text: 'TC_LOGIN_02', options: { bold: true, fontSize: 16, breakLine: true } },
      { text: 'Đăng nhập bằng mật khẩu sai', options: { color: C.muted, fontSize: 14, breakLine: true } },
      { text: ' ', options: { breakLine: true } },
      { text: 'v1.0   Đạt', options: { color: C.pass, bold: true, fontSize: 20, breakLine: true } },
      { text: 'v1.1   Không đạt', options: { color: C.fail, bold: true, fontSize: 20, breakLine: true } },
      { text: '          ↑ thụt lùi sau khi sửa mã giảm giá', options: { color: C.muted, fontSize: 13, breakLine: true } },
      { text: 'v1.2   Đạt', options: { color: C.pass, bold: true, fontSize: 20 } },
    ],
    { x: 8.6, y: 1.9, w: 3.9, h: 4.2, fontFace: FONT, color: C.ink, valign: 'top' },
  );
}

// 3. Mục tiêu và phạm vi
{
  const s = slide('Mục tiêu và phạm vi', 'Đề tài');
  const groups = ['Tài khoản & phân quyền', 'Dự án & bộ kiểm thử', 'Ca kiểm thử', 'Đợt kiểm thử', 'Kết quả kiểm thử', 'Thống kê & xuất CSV'];
  groups.forEach((g, i) => {
    const x = 0.6 + (i % 3) * 4.15, y = 1.65 + Math.floor(i / 3) * 1.15;
    s.addShape(pptx.ShapeType.roundRect, { x, y, w: 3.95, h: 0.95, rectRadius: 0.08, fill: { color: C.soft }, line: { color: C.soft } });
    s.addText(`${i + 1}. ${g}`, { x, y, w: 3.95, h: 0.95, fontFace: FONT, fontSize: 17, bold: true, color: C.navy, align: 'center', valign: 'middle' });
  });
  bullets(s, [
    'Chỉ tiêu — 2 vai trò; 2 dự án, ≥ 30 ca, 3 đợt mẫu; ≥ 30 tình huống kiểm thử; 3 luồng E2E; p95 < 1 giây với 1.000 ca',
    'Hỗ trợ kiểm thử thủ công — người thực hiện các bước, TestFlow ghi nhận và tổng hợp',
    'Ngoài phạm vi — tự động chạy kiểm thử, quản lý lỗi kiểu Jira, đính kèm tệp, nhiều tổ chức',
  ], { x: 0.6, y: 4.2, w: 12.2, h: 2.6 });
}

// 4. Nghiệp vụ
{
  const s = slide('Quy trình kiểm thử hồi quy', 'Nghiệp vụ');
  const steps = ['Viết ca\n(bước + kết quả mong đợi)', 'Tạo đợt\ncho phiên bản', 'Thực hiện\n& ghi kết quả', 'Thống kê\n& xuất CSV', 'Đóng đợt\n(chốt sổ)'];
  steps.forEach((t, i) => {
    const x = 0.6 + i * 2.5;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.7, w: 2.2, h: 1.2, rectRadius: 0.08, fill: { color: i === 1 ? C.navy : C.soft }, line: { color: C.navy, width: 1 } });
    s.addText(t, { x, y: 1.7, w: 2.2, h: 1.2, fontFace: FONT, fontSize: 15, bold: true, color: i === 1 ? C.white : C.navy, align: 'center', valign: 'middle' });
    if (i < steps.length - 1) s.addText('→', { x: x + 2.2, y: 1.95, w: 0.3, h: 0.7, fontSize: 24, color: C.muted, align: 'center' });
  });
  const st = [['Đạt', C.pass, 'Đúng mọi kết quả mong đợi'], ['Không đạt', C.fail, 'Phần mềm có lỗi – cần mô tả'], ['Bị chặn', C.block, 'Không chạy được – cần lý do'], ['Chưa chạy', C.todo, 'Mặc định khi tạo đợt']];
  st.forEach(([name, color, desc], i) => {
    const y = 3.45 + i * 0.72;
    s.addShape(pptx.ShapeType.ellipse, { x: 0.7, y: y + 0.12, w: 0.3, h: 0.3, fill: { color }, line: { color } });
    s.addText([{ text: `${name}  `, options: { bold: true } }, { text: desc, options: { color: C.muted } }], { x: 1.15, y, w: 5.5, h: 0.55, fontFace: FONT, fontSize: 17, color: C.ink });
  });
  s.addShape(pptx.ShapeType.roundRect, { x: 7.2, y: 3.45, w: 5.5, h: 2.75, rectRadius: 0.08, fill: { color: C.soft }, line: { color: C.soft } });
  s.addText(
    [
      { text: 'Tỷ lệ đạt = Đạt / (Đạt + Không đạt)', options: { bold: true, fontSize: 20, color: C.navy, breakLine: true } },
      { text: ' ', options: { breakLine: true, fontSize: 8 } },
      { text: 'Bị chặn, Chưa chạy chưa nói gì về chất lượng nên không tính.', options: { breakLine: true } },
      { text: 'Mẫu số bằng 0 → "Chưa có dữ liệu", không phải 0%.', options: { breakLine: true } },
      { text: 'TestFlow cung cấp số liệu; người phụ trách quyết định phát hành.' },
    ],
    { x: 7.45, y: 3.6, w: 5.1, h: 2.5, fontFace: FONT, fontSize: 15, color: C.ink, valign: 'top', paraSpaceAfter: 6 },
  );
}

// 5. Kiến trúc và công nghệ
{
  const s = slide('Kiến trúc ba tầng và công nghệ', 'Thiết kế');
  picture(s, IMG('diagrams/png/hinh-2-8.png'), { x: 0.5, y: 1.45, w: 4.6, h: 5.45 });
  const rows = [
    ['Giao diện', 'React 19 · TypeScript · Vite'],
    ['API', 'NestJS 11 · REST · Swagger'],
    ['Dữ liệu', 'PostgreSQL 18 · Prisma 6'],
    ['Bảo mật', 'JWT · bcrypt · class-validator'],
    ['Kiểm thử', 'Jest · Supertest · Playwright'],
  ];
  s.addTable(
    rows.map(([a, b]) => [
      { text: a, options: { bold: true, color: C.navy, fill: { color: C.soft } } },
      { text: b },
    ]),
    { x: 5.6, y: 1.6, w: 7.1, colW: [1.9, 5.2], fontFace: FONT, fontSize: 17, color: C.ink, border: { type: 'solid', color: C.line, pt: 1 }, rowH: 0.62 },
  );
  bullets(s, [
    'Quy tắc nằm ở backend — trình duyệt không chạm CSDL; ẩn nút chỉ là trải nghiệm',
    'Thứ tự kiểm tra — xác thực (401) → phân quyền (403) → dữ liệu (400) → nghiệp vụ',
    'Một backend, chia module — không microservices: đủ cho quy mô một người, 8 tuần',
  ], { x: 5.6, y: 4.95, w: 7.2, h: 2 });
}

// 6. Use Case
{
  const s = slide('Tác nhân và Use Case', 'Phân tích');
  picture(s, IMG('diagrams/png/hinh-2-2.png'), { x: 0.4, y: 1.4, w: 5.8, h: 5.5 });
  bullets(s, [
    'Tester — dự án, bộ, ca, đợt, ghi kết quả, thống kê',
    'Admin kế thừa Tester — thêm quản lý tài khoản và lưu trữ dự án',
    '20 yêu cầu chức năng, 16 quy tắc nghiệp vụ — truy vết tới API và tình huống kiểm thử',
    'Phân rã 4 nhóm Use Case — «include»: tạo đợt luôn chụp ca; «extend»: xuất CSV từ thống kê',
  ], { x: 6.6, y: 1.7, w: 6.2, h: 5 });
}

// 7. CSDL và bản chụp
{
  const s = slide('Bảo toàn lịch sử bằng bản chụp', 'Thiết kế trọng tâm');
  picture(s, IMG('diagrams/png/hinh-2-13.png'), { x: 0.4, y: 1.35, w: 4.4, h: 5.6 });
  bullets(s, [
    'Bản chụp — tạo đợt thì chép mã, tên, tiền điều kiện, các bước (JSON) sang RunCase; màn hình đợt chỉ đọc bản chụp',
    'Không xoá dây chuyền — xoá ca gốc: RunCase.testCaseId = NULL, kết quả còn nguyên; dự án lưu trữ thay vì xoá',
    'Khoá sau khi chốt — đợt đã đóng từ chối sửa kết quả; kiểm tra lại thì tạo đợt mới',
    'Một giao dịch — đợt + N bản chụp + N kết quả thành công cùng nhau',
    'Lặp dữ liệu có chủ đích — dữ liệu lịch sử như hoá đơn ghi giá lúc mua',
  ], { x: 5.2, y: 1.6, w: 7.6, h: 5.3 });
}

// 8. Màn hình thực hiện đợt
{
  const s = slide('Thực hiện đợt kiểm thử', 'Sản phẩm');
  picture(s, IMG('screenshots/08-thuc-hien-dot.png'), { x: 0.5, y: 1.4, w: 8.6, h: 5.4 }, true);
  bullets(s, [
    'Danh sách ca có chấm trạng thái, lọc theo trạng thái',
    'Các bước đọc từ bản chụp',
    'Không đạt / Bị chặn bắt buộc mô tả',
    'Lưu xong tự chuyển sang ca chưa chạy kế tiếp',
    'Đóng đợt có xác nhận',
  ], { x: 9.4, y: 1.6, w: 3.6, h: 5.2, fontSize: 16 });
}

// 9. Lịch sử và thống kê
{
  const s = slide('Theo dõi hồi quy qua các phiên bản', 'Sản phẩm');
  picture(s, IMG('screenshots/06-danh-sach-dot.png'), { x: 0.5, y: 1.45, w: 6.1, h: 3.8 }, true);
  picture(s, IMG('screenshots/10b-so-sanh-dot-truoc.png'), { x: 6.8, y: 1.45, w: 6.1, h: 3.8 }, true);
  s.addText('Danh sách đợt: 90,5% → 95,5% → đang chạy bản 1.2', { x: 0.5, y: 5.35, w: 6.1, h: 0.4, fontFace: FONT, fontSize: 14, color: C.muted, align: 'center' });
  s.addText('So với đợt trước: tự chỉ ra ca thụt lùi, ca đã sửa', { x: 6.8, y: 5.35, w: 6.1, h: 0.4, fontFace: FONT, fontSize: 14, color: C.muted, align: 'center' });
  bullets(s, [
    'Tỷ lệ đạt tăng 90,5% → 95,5% nhưng vẫn có ca thụt lùi — chỉ nhìn tỷ lệ đạt sẽ bỏ sót TC_LOGIN_02',
    'Lịch sử từng ca — "3 bước (hiện 4)": đợt cũ chạy bản chụp 3 bước dù ca đã được viết thêm',
  ], { x: 0.6, y: 5.85, w: 12.2, h: 1.1, fontSize: 16 });
}

// 10. Bảo mật
{
  const s = slide('Bảo mật và phân quyền', 'Cài đặt');
  const chain = [['JwtAuthGuard', '401', 'Chữ ký, hạn token;\nđọc lại người dùng'], ['RolesGuard', '403', '@Roles(ADMIN)'], ['ValidationPipe', '400', 'DTO, chặn trường lạ'], ['Service', '400/409', 'Quy tắc nghiệp vụ'], ['Exception Filter', '409/404', 'Lỗi ràng buộc CSDL']];
  chain.forEach(([name, code, desc], i) => {
    const x = 0.6 + i * 2.5;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.7, w: 2.25, h: 1.9, rectRadius: 0.08, fill: { color: C.soft }, line: { color: C.navy, width: 1 } });
    s.addText([{ text: name, options: { bold: true, breakLine: true } }, { text: code, options: { color: C.fail, bold: true, fontSize: 20, breakLine: true } }, { text: desc, options: { color: C.muted, fontSize: 12 } }],
      { x, y: 1.75, w: 2.25, h: 1.8, fontFace: FONT, fontSize: 15, color: C.ink, align: 'center', valign: 'middle' });
  });
  bullets(s, [
    'Mật khẩu — băm bcrypt 10 vòng, API không bao giờ trả passwordHash',
    'Khoá tài khoản có hiệu lực ngay — guard đọc lại CSDL mỗi yêu cầu, không chờ token 8 giờ hết hạn (TS-14)',
    'Sai email hay sai mật khẩu cùng một thông báo — không lộ email nào tồn tại',
    'Admin không tự khoá, tự hạ quyền — hệ thống luôn còn người quản trị',
  ], { x: 0.6, y: 4.0, w: 12.2, h: 2.9 });
}

// 11. Kiểm thử
{
  const s = slide('Kiểm thử tự động ba mức', 'Chất lượng');
  stat(s, 0.6, 1.65, '12/12', 'Unit test (Jest)');
  stat(s, 3.65, 1.65, '44/44', 'Tình huống API trên CSDL thật', C.pass);
  stat(s, 6.7, 1.65, '3/3', 'Luồng E2E (Playwright)', C.pass);
  stat(s, 9.75, 1.65, '34 / 3', 'Ca mẫu / đợt mẫu');
  bullets(s, [
    'Đủ 8 tình huống trọng tâm của kế hoạch — vượt quyền, thiếu trường, kết quả sai, sửa ca gốc sau khi tạo đợt, sửa đợt đã đóng, thống kê rỗng, CSV tiếng Việt, lưu trữ giữ lịch sử',
    'E2E-02 chứng minh bản chụp trên trình duyệt thật — ghi Không đạt → sửa ca gốc thêm bước → đợt vẫn hiện số bước cũ',
    'Tự tạo và tự dọn dữ liệu — chạy lại bao nhiêu lần cũng được: chính là đợt hồi quy cho TestFlow',
  ], { x: 0.6, y: 3.45, w: 12.2, h: 3.4 });
}

// 12. Hiệu năng và sao lưu
{
  const s = slide('Hiệu năng và sao lưu – phục hồi', 'Chất lượng');
  const p = perf.listCasesApi;
  stat(s, 0.6, 1.65, `${p.p95} ms`, 'p95 API danh sách (mục tiêu < 1.000 ms)', C.pass);
  stat(s, 3.65, 1.65, `${p.p50} ms`, 'p50');
  stat(s, 6.7, 1.65, `${p.requests.toLocaleString('vi-VN')}`, `yêu cầu / 30 s, ${p.errors} lỗi`);
  stat(s, 9.75, 1.65, 'Khớp', 'Phục hồi CSDL: mã băm trùng', C.pass);
  bullets(s, [
    `Điều kiện đo — ${perf.setup.cases.toLocaleString('vi-VN')} ca, ${perf.setup.steps.toLocaleString('vi-VN')} bước, ${perf.setup.concurrentUsers} người dùng đồng thời, 5 loại truy vấn; Core i5-12500H, 16 GB RAM`,
    `Tạo đợt 1.000 ca trong một giao dịch — ${Math.round(perf.extra.createRunWith1000CasesMs)} ms`,
    'Sao lưu logic JSON + SHA-256 — giả lập xoá 1 đợt và 5 ca → phục hồi → đủ 8 bảng, đăng nhập và tạo dữ liệu mới bình thường',
    'Giới hạn — đo trên một máy, chưa tính độ trễ mạng',
  ], { x: 0.6, y: 3.45, w: 12.2, h: 3.4 });
}

// 13. Đánh giá
{
  const s = slide('Đánh giá so với mục tiêu', 'Kết quả');
  const rows = [
    ['6 nhóm chức năng', 'Đạt'], ['2 vai trò, phân quyền backend', 'Đạt'], ['Bảo toàn lịch sử', 'Đạt'], ['Dữ liệu mẫu 2 dự án, 34 ca, 3 đợt', 'Đạt'],
    ['≥ 30 tình huống, 3 E2E', 'Đạt (44 + 3)'], ['p95 < 1 giây', 'Đạt (33 ms)'], ['Sao lưu – phục hồi', 'Đạt'], ['Đánh giá với người dùng thật, so sánh bảng tính', 'Chưa thực hiện'],
  ];
  s.addTable(
    [[{ text: 'Mục tiêu', options: { bold: true, fill: { color: C.navy }, color: C.white } }, { text: 'Kết quả', options: { bold: true, fill: { color: C.navy }, color: C.white } }],
      ...rows.map(([a, b]) => [{ text: a }, { text: b, options: { bold: true, color: b.startsWith('Đạt') ? C.pass : C.block } }])],
    { x: 0.6, y: 1.55, w: 7.3, colW: [5.1, 2.2], fontFace: FONT, fontSize: 15, color: C.ink, border: { type: 'solid', color: C.line, pt: 1 }, rowH: 0.5 },
  );
  s.addText('Hạn chế', { x: 8.3, y: 1.55, w: 4.5, h: 0.45, fontFace: FONT, fontSize: 18, bold: true, color: C.navy });
  bullets(s, [
    'Chưa có phản hồi người dùng bên ngoài',
    'Hai vai trò dùng chung dữ liệu',
    'Chỉ lưu kết quả hiện hành trong một đợt',
    'Token ở localStorage, chưa thu hồi phiên',
    'Mới chạy trên localhost',
  ], { x: 8.3, y: 2.05, w: 4.6, h: 4.6, fontSize: 16 });
}

// 14. Kết luận
{
  const s = slide('Kết luận và hướng phát triển', 'Tổng kết');
  bullets(s, [
    'Sản phẩm hoàn chỉnh — 10 màn hình, 30 API, 8 bảng, tài liệu Swagger, hướng dẫn cài đặt',
    'Điểm nhấn kỹ thuật — bản chụp theo đợt, so sánh tự động với đợt trước, khoá đợt đã đóng, phân quyền tại API',
    'Minh chứng chất lượng — 44 + 12 + 3 kiểm thử tự động đạt, p95 33 ms, phục hồi CSDL thành công',
    'Hướng phát triển — đánh giá với người dùng thật; nhập CSV; phân quyền theo dự án; liên kết GitHub Issues/Jira; cookie httpOnly; triển khai trực tuyến',
  ], { x: 0.6, y: 1.6, w: 12.2, h: 3.9 });
  s.addText('Em xin cảm ơn thầy đã lắng nghe!', { x: 0.6, y: 5.7, w: 12.2, h: 0.8, fontFace: FONT, fontSize: 28, bold: true, color: C.navy, align: 'center' });
}

await pptx.writeFile({ fileName: OUT });
console.log(`Đã tạo ${OUT} (${n} trang)`);
