/**
 * Dựng báo cáo Bài tập lớn (.docx) từ các tệp Markdown trong docs/bao-cao và docs/CHUONG_2_PHAN_TICH_THIET_KE.md.
 * Thể thức theo mẫu của trường: Times New Roman 14, giãn dòng 1.5, lề trên 2 cm, dưới 2 cm, trái 3,5 cm, phải 2 cm.
 * Mục lục, danh mục bảng, danh mục hình là trường (field) của Word, được cập nhật số trang ở bước export-pdf.ps1.
 * Chạy: npm run report  →  HO_SO_NOP/BaoCao_TestFlow.docx
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sizeOf from 'image-size';
import {
  AlignmentType, BorderStyle, Document, Footer, HeadingLevel, ImageRun, LevelFormat, Packer, PageBreak,
  PageNumber, Paragraph, ShadingType, StyleLevel, Table, TableCell, TableOfContents, TableRow, TextRun,
  VerticalAlign, WidthType,
} from 'docx';

const DOCS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(DOCS, '..');
const OUT_DIR = path.join(ROOT, 'HO_SO_NOP');
const FONT = 'Times New Roman';
const MONO = 'Consolas';
const CM = 567; // 1 cm = 567 DXA
const PAGE_W = 11906; // A4
const MARGIN = { top: 2 * CM, bottom: 2 * CM, left: Math.round(3.5 * CM), right: 2 * CM };
const CONTENT_W = PAGE_W - MARGIN.left - MARGIN.right; // ≈ 8789 DXA
const CONTENT_PX = Math.floor((CONTENT_W / 1440) * 96); // chiều rộng ảnh tối đa (px ở 96 dpi)
const MAX_IMG_H = 760;

export const SV = {
  ten: 'Trần Đức Trường',
  mssv: '20233802',
  lop: 'DCCNTT.14.10',
  gvhd: 'ThS. Mai Văn Linh',
  detai: 'XÂY DỰNG ỨNG DỤNG WEB QUẢN LÝ CA KIỂM THỬ VÀ THEO DÕI KẾT QUẢ KIỂM THỬ HỒI QUY TESTFLOW',
};

// ---------------------------------------------------------------- Markdown → docx

function inline(text, base = {}) {
  const runs = [];
  for (const part of text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g)) {
    if (!part) continue;
    if (part.startsWith('**')) runs.push(new TextRun({ ...base, text: part.slice(2, -2), bold: true }));
    else if (part.startsWith('`')) runs.push(new TextRun({ ...base, text: part.slice(1, -1), font: MONO, size: (base.size ?? 28) - 4 }));
    else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) runs.push(new TextRun({ ...base, text: part.slice(1, -1), italics: true }));
    else runs.push(new TextRun({ ...base, text: part }));
  }
  return runs;
}

export const body = (text, opts = {}) =>
  new Paragraph({ children: inline(text), alignment: AlignmentType.JUSTIFIED, indent: { firstLine: CM }, ...opts });

function image(file) {
  const buf = fs.readFileSync(file);
  const { width, height } = sizeOf(buf);
  let w = Math.min(CONTENT_PX, width / (width > 1500 ? 2 : 1));
  let h = (height / width) * w;
  if (h > MAX_IMG_H) {
    h = MAX_IMG_H;
    w = (width / height) * h;
  }
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    keepNext: true,
    spacing: { before: 120, after: 60, line: 240 },
    children: [new ImageRun({ type: 'png', data: buf, transformation: { width: Math.round(w), height: Math.round(h) } })],
  });
}

function codeBlock(lines) {
  return lines.map(
    (l, i) =>
      new Paragraph({
        shading: { type: ShadingType.CLEAR, fill: 'F2F4F7', color: 'auto' },
        spacing: { before: i === 0 ? 120 : 0, after: i === lines.length - 1 ? 160 : 0, line: 240 },
        indent: { left: 200, right: 200 },
        children: [new TextRun({ text: l.length ? l : ' ', font: MONO, size: 19 })],
      }),
  );
}

export function table(rows) {
  const cols = rows[0].length;
  // Độ rộng cột theo độ dài nội dung, có chặn trên và dưới để cột ngắn không quá hẹp.
  const plain = (t) => (t ?? '').replace(/[*`]/g, '').replace(/<br\s*\/?>/g, ' ');
  const weight = Array.from({ length: cols }, (_, c) =>
    Math.min(60, Math.max(6, ...rows.map((r) => plain(r[c]).length))),
  );
  // Cột không được hẹp hơn từ dài nhất trong cột (tránh "TS-01" bị bẻ dòng).
  const minW = Array.from({ length: cols }, (_, c) =>
    Math.max(...rows.map((r) => Math.max(0, ...plain(r[c]).split(/\s+/).map((w) => w.length)))) * 125 + 220,
  );
  const sum = weight.reduce((a, b) => a + b, 0);
  let widths = weight.map((w, c) => Math.max(minW[c], Math.floor((w / sum) * CONTENT_W)));
  const over = widths.reduce((a, b) => a + b, 0) - CONTENT_W;
  if (over > 0) {
    const flex = widths.map((w, c) => Math.max(0, w - minW[c]));
    const flexSum = flex.reduce((a, b) => a + b, 0) || 1;
    widths = widths.map((w, c) => Math.floor(w - (flex[c] / flexSum) * over));
  }
  widths[cols - 1] += CONTENT_W - widths.reduce((a, b) => a + b, 0);
  const border = { style: BorderStyle.SINGLE, size: 4, color: '7F8A99' };
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: widths,
    borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border },
    rows: rows.map(
      (r, ri) =>
        new TableRow({
          tableHeader: ri === 0,
          cantSplit: true,
          children: widths.map(
            (w, c) =>
              new TableCell({
                width: { size: w, type: WidthType.DXA },
                verticalAlign: VerticalAlign.CENTER,
                margins: { top: 40, bottom: 40, left: 80, right: 80 },
                shading: ri === 0 ? { type: ShadingType.CLEAR, fill: 'DCE3EE', color: 'auto' } : undefined,
                children: (r[c] ?? '').trim().split(/<br\s*\/?>/).map(
                  (part) =>
                    new Paragraph({
                      spacing: { before: 0, after: 0, line: 260 },
                      alignment: ri === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
                      children: inline(part.trim(), { size: 24, bold: ri === 0 ? true : undefined }),
                    }),
                ),
              }),
          ),
        }),
    ),
  });
}

/** Chương 2 dùng ảnh PNG thay cho SVG và khối Mermaid, theo số hình ở chú thích. */
function figureFile(caption) {
  const m = /Hình (\d+)\.(\d+)\./.exec(caption);
  return m ? path.join(DOCS, 'diagrams', 'png', `hinh-${m[1]}-${m[2]}.png`) : null;
}

export function convert(md, mdDir, { breakFirstH1 = true } = {}) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let firstH1 = true;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim() === '---') continue;

    if (line.startsWith('```')) {
      const isMermaid = line.includes('mermaid');
      const code = [];
      while (++i < lines.length && !lines[i].startsWith('```')) code.push(lines[i]);
      if (isMermaid) {
        const cap = lines.slice(i + 1).find((l) => l.trim());
        out.push(image(figureFile(cap)));
      } else out.push(...codeBlock(code));
      continue;
    }
    if (line.startsWith('> ')) continue; // ghi chú làm việc, không đưa vào báo cáo

    const h = /^(#{1,3}) (.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const text = h[2].trim();
      if (level === 1) {
        out.push(new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: breakFirstH1 || !firstH1, children: [new TextRun(text.toUpperCase())] }));
        firstH1 = false;
      } else out.push(new Paragraph({ heading: level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3, children: [new TextRun(text)] }));
      continue;
    }

    const img = /^!\[[^\]]*\]\(([^)]+)\)$/.exec(line.trim());
    if (img) {
      const cap = lines.slice(i + 1).find((l) => l.trim());
      const src = img[1].endsWith('.svg') ? figureFile(cap) : path.resolve(mdDir, img[1]);
      out.push(image(src));
      continue;
    }

    const cap = /^\*((Hình|Bảng) [0-9A-Z]+(?:\.\d+)?\..*)\*$/.exec(line.trim());
    if (cap) {
      const isFig = cap[2] === 'Hình';
      out.push(
        new Paragraph({
          style: isFig ? 'CaptionHinh' : 'CaptionBang',
          keepNext: !isFig,
          children: [new TextRun(cap[1])],
        }),
      );
      continue;
    }

    if (line.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        const cells = lines[i].trim().replace(/^\||\|$/g, '').split('|');
        if (!cells.every((c) => /^\s*:?-+:?\s*$/.test(c))) rows.push(cells);
        i++;
      }
      i--;
      out.push(table(rows), new Paragraph({ spacing: { before: 0, after: 120 }, children: [] }));
      continue;
    }

    const bullet = /^- (.*)$/.exec(line);
    if (bullet) {
      out.push(new Paragraph({ numbering: { reference: 'bullets', level: 0 }, alignment: AlignmentType.JUSTIFIED, children: inline(bullet[1]) }));
      continue;
    }
    const num = /^(\d+)\. (.*)$/.exec(line);
    if (num) {
      out.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, indent: { left: CM, hanging: 400 }, children: inline(`${num[1]}. ${num[2]}`) }));
      continue;
    }
    if (/^\[\d+\]/.test(line)) {
      out.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, indent: { left: 700, hanging: 700 }, children: inline(line) }));
      continue;
    }
    out.push(body(line));
  }
  return out;
}

// ---------------------------------------------------------------- Phần đầu báo cáo

const center = (text, opts = {}) =>
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0, line: 300 }, ...opts.p, children: [new TextRun({ text, ...opts.r })] });

function cover() {
  return [
    center('BỘ GIÁO DỤC VÀ ĐÀO TẠO', { r: { size: 28 } }),
    center('TRƯỜNG ĐẠI HỌC CÔNG NGHỆ ĐÔNG Á', { r: { size: 28, bold: true } }),
    center('––––––––––––––––––––', { p: { spacing: { after: 1400 } } }),
    center('BÁO CÁO BÀI TẬP LỚN', { r: { size: 36, bold: true }, p: { spacing: { after: 200 } } }),
    center('Học phần: Đồ án chuyên ngành Công nghệ phần mềm', { r: { size: 28 }, p: { spacing: { after: 900 } } }),
    center('ĐỀ TÀI', { r: { size: 28, bold: true }, p: { spacing: { after: 200 } } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 1200, line: 360 },
      children: [new TextRun({ text: SV.detai, bold: true, size: 32 })],
    }),
    new Table({
      width: { size: 6800, type: WidthType.DXA },
      columnWidths: [2800, 4000],
      alignment: AlignmentType.CENTER,
      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
      rows: [
        ['Sinh viên thực hiện', SV.ten],
        ['Mã sinh viên', SV.mssv],
        ['Lớp hành chính', SV.lop],
        ['Lớp học phần – Nhóm', 'N09 – Nhóm 18 (cá nhân)'],
        ['Người hướng dẫn', SV.gvhd],
      ].map(
        ([k, v]) =>
          new TableRow({
            children: [
              new TableCell({ width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: `${k}:`, size: 28 })] })] }),
              new TableCell({ width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: v, size: 28, bold: true })] })] }),
            ],
          }),
      ),
    }),
    center('Bắc Ninh, 2026', { r: { size: 28, bold: true }, p: { spacing: { before: 2200 } } }),
  ];
}

const unlistedHeading = (text) =>
  new Paragraph({ style: 'FrontTitle', pageBreakBefore: true, children: [new TextRun(text)] });

function frontMatter() {
  const abbr = [
    ['API', 'Giao diện lập trình ứng dụng (Application Programming Interface)'],
    ['BTL', 'Bài tập lớn'],
    ['CNPM', 'Công nghệ phần mềm'],
    ['CSDL', 'Cơ sở dữ liệu'],
    ['CSV', 'Tệp dữ liệu phân tách bằng dấu phẩy (Comma-Separated Values)'],
    ['DTO', 'Đối tượng truyền dữ liệu (Data Transfer Object)'],
    ['E2E', 'Kiểm thử đầu cuối (End-to-End)'],
    ['ERD', 'Sơ đồ thực thể – liên kết (Entity Relationship Diagram)'],
    ['HTTP', 'Giao thức truyền siêu văn bản (Hypertext Transfer Protocol)'],
    ['JSON', 'Định dạng dữ liệu JavaScript Object Notation'],
    ['JWT', 'JSON Web Token'],
    ['ORM', 'Ánh xạ đối tượng – quan hệ (Object-Relational Mapping)'],
    ['QA', 'Đảm bảo chất lượng (Quality Assurance)'],
    ['REST', 'Kiểu kiến trúc Representational State Transfer'],
    ['UML', 'Ngôn ngữ mô hình hoá thống nhất (Unified Modeling Language)'],
    ['WBS', 'Cấu trúc phân rã công việc (Work Breakdown Structure)'],
    ['XSS', 'Tấn công chèn mã kịch bản (Cross-Site Scripting)'],
  ];
  return [
    unlistedHeading('LỜI CẢM ƠN'),
    body('Em xin chân thành cảm ơn thầy ThS. Mai Văn Linh đã hướng dẫn học phần Đồ án chuyên ngành Công nghệ phần mềm, góp ý cho đề cương và định hướng cho em trong quá trình thực hiện đề tài.'),
    body('Em cũng xin cảm ơn các thầy cô Trường Đại học Công nghệ Đông Á đã trang bị kiến thức về phân tích, thiết kế, lập trình và kiểm thử phần mềm, là nền tảng để em hoàn thành bài tập lớn này.'),
    body('Do thời gian và kinh nghiệm còn hạn chế, báo cáo không tránh khỏi thiếu sót. Em rất mong nhận được ý kiến đóng góp của thầy cô để hoàn thiện sản phẩm và báo cáo.'),
    new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 400 }, children: [new TextRun({ text: 'Bắc Ninh, ngày … tháng … năm 2026', italics: true })] }),
    new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Sinh viên thực hiện', bold: true })] }),
    new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 900 }, children: [new TextRun({ text: SV.ten, bold: true })] }),

    unlistedHeading('MỤC LỤC'),
    new TableOfContents('Mục lục', { hyperlink: true, headingStyleRange: '1-3' }),

    unlistedHeading('DANH MỤC CÁC TỪ VIẾT TẮT'),
    table([['Từ viết tắt', 'Diễn giải'], ...abbr]),

    unlistedHeading('DANH MỤC CÁC BẢNG'),
    new TableOfContents('Danh mục bảng', { hyperlink: true, stylesWithLevels: [new StyleLevel('CaptionBang', 1)] }),

    unlistedHeading('DANH MỤC CÁC HÌNH VẼ'),
    new TableOfContents('Danh mục hình', { hyperlink: true, stylesWithLevels: [new StyleLevel('CaptionHinh', 1)] }),
  ];
}

// ---------------------------------------------------------------- Lắp ráp

const heading = (size, extra = {}) => ({
  run: { font: FONT, size, bold: true, color: '000000', ...extra.run },
  paragraph: { spacing: { before: 240, after: 120, line: 360 }, keepNext: true, keepLines: true, ...extra.paragraph },
});

export const DOC_STYLES = {
  styles: {
    default: {
      document: { run: { font: FONT, size: 28 }, paragraph: { spacing: { line: 360, before: 0, after: 120 } } },
      heading1: heading(32, { paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 0, after: 360, line: 360 } } }),
      heading2: heading(28),
      heading3: heading(28, { run: { italics: true } }),
    },
    paragraphStyles: [
      { id: 'CaptionHinh', name: 'CaptionHinh', basedOn: 'Normal', quickFormat: true,
        run: { font: FONT, size: 26, italics: true }, paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 60, after: 240, line: 300 } } },
      { id: 'CaptionBang', name: 'CaptionBang', basedOn: 'Normal', quickFormat: true,
        run: { font: FONT, size: 26, bold: true }, paragraph: { alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 120, after: 80, line: 300 } } },
      { id: 'FrontTitle', name: 'FrontTitle', basedOn: 'Normal',
        run: { font: FONT, size: 32, bold: true }, paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 0, after: 360 } } },
    ],
  },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{ level: 0, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: CM + 300, hanging: 300 } } } }],
      },
    ],
  },
};

export const PAGE = { size: { width: PAGE_W, height: 16838 }, margin: MARGIN };
export const pageFooter = () =>
  new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], size: 26 })] })] });

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {

const parts = [
  path.join(DOCS, 'bao-cao', '00-mo-dau.md'),
  path.join(DOCS, 'bao-cao', '01-chuong-1.md'),
  path.join(DOCS, 'CHUONG_2_PHAN_TICH_THIET_KE.md'),
  path.join(DOCS, 'bao-cao', '03-chuong-3.md'),
  path.join(DOCS, 'bao-cao', '04-ket-luan.md'),
  path.join(DOCS, 'bao-cao', '05-tai-lieu-tham-khao.md'),
  path.join(DOCS, 'bao-cao', '06-phu-luc.md'),
];
const content = parts.flatMap((f) => convert(fs.readFileSync(f, 'utf8'), path.dirname(f)));

const doc = new Document({
  creator: SV.ten,
  title: 'Báo cáo BTL TestFlow',
  description: SV.detai,
  ...DOC_STYLES,
  sections: [
    {
      properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: MARGIN } },
      children: cover(),
    },
    {
      properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: MARGIN, pageNumbers: { start: 1 } } },
      footers: {
        default: new Footer({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], size: 26 })] })],
        }),
      },
      children: [...frontMatter(), ...content],
    },
  ],
});

fs.mkdirSync(OUT_DIR, { recursive: true });
const out = path.join(OUT_DIR, 'BaoCao_TestFlow.docx');
fs.writeFileSync(out, await Packer.toBuffer(doc));
console.log('Đã tạo', out);
}
