/**
 * Dựng hai văn bản đi kèm hồ sơ nộp từ Markdown, dùng chung thể thức với báo cáo:
 *  - HO_SO_NOP/PhieuTuDanhGia_TestFlow.docx  ← docs/bao-cao/phieu-tu-danh-gia.md
 *  - HO_SO_NOP/TienDoHoanThanh_TestFlow.docx ← docs/TIEN_DO_HOAN_THANH.md
 * Chạy: npm run forms
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AlignmentType, Document, Packer, Paragraph, TextRun } from 'docx';
import { convert, DOC_STYLES, PAGE, pageFooter } from './build-report.mjs';

const DOCS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(DOCS, '..', 'HO_SO_NOP');

const header = [
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [new TextRun({ text: 'TRƯỜNG ĐẠI HỌC CÔNG NGHỆ ĐÔNG Á', bold: true })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: [new TextRun({ text: 'Học phần Đồ án chuyên ngành Công nghệ phần mềm' })] }),
];

async function build(src, name) {
  const children = convert(fs.readFileSync(src, 'utf8'), path.dirname(src), { breakFirstH1: false });
  const doc = new Document({
    ...DOC_STYLES,
    sections: [{ properties: { page: PAGE }, footers: { default: pageFooter() }, children: [...header, ...children] }],
  });
  const file = path.join(OUT, name);
  fs.writeFileSync(file, await Packer.toBuffer(doc));
  console.log('Đã tạo', file);
}

fs.mkdirSync(OUT, { recursive: true });
await build(path.join(DOCS, 'bao-cao', 'phieu-tu-danh-gia.md'), 'PhieuTuDanhGia_TestFlow.docx');
await build(path.join(DOCS, 'TIEN_DO_HOAN_THANH.md'), 'TienDoHoanThanh_TestFlow.docx');
