/**
 * Xuất mọi sơ đồ Chương 2 thành PNG (độ phân giải x2) vào docs/diagrams/png để chèn vào báo cáo Word.
 *  - 6 sơ đồ SVG (phân cấp chức năng, Use Case) từ docs/diagrams
 *  - 7 sơ đồ Mermaid lấy từ docs/CHUONG_2_PHAN_TICH_THIET_KE.md, đặt tên theo số hình ngay sau khối mã
 * Chạy: npm run diagrams
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DOCS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(DOCS, 'diagrams', 'png');
fs.mkdirSync(OUT, { recursive: true });

const SVGS = {
  'hinh-2-1': 'bfd.svg',
  'hinh-2-2': 'usecase_tong_quat.svg',
  'hinh-2-3': 'usecase_tai_khoan.svg',
  'hinh-2-4': 'usecase_du_an.svg',
  'hinh-2-5': 'usecase_ca_kiem_thu.svg',
  'hinh-2-6': 'usecase_dot_kiem_thu.svg',
};

const md = fs.readFileSync(path.join(DOCS, 'CHUONG_2_PHAN_TICH_THIET_KE.md'), 'utf8').replace(/\r\n/g, '\n');
const mermaid = [...md.matchAll(/```mermaid\n([\s\S]*?)```\s*\n\*Hình 2\.(\d+)\./g)].map((m) => ({
  name: `hinh-2-${m[2]}`,
  code: m[1],
}));

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1400, height: 1000 } });

for (const [name, file] of Object.entries(SVGS)) {
  const svg = fs.readFileSync(path.join(DOCS, 'diagrams', file), 'utf8');
  await page.setContent(`<body style="margin:0;background:#fff">${svg}</body>`);
  await page.locator('svg').first().screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log('SVG     ', name, '←', file);
}

await page.setContent(`<!doctype html><meta charset="utf-8"><body style="margin:0;background:#fff">
  <div id="c" style="display:inline-block;padding:16px;background:#fff"></div>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: false, theme: 'neutral', fontFamily: 'Arial, sans-serif',
      flowchart: { htmlLabels: true }, sequence: { useMaxWidth: false }, er: { useMaxWidth: false } });
    window.draw = async (code) => {
      const { svg } = await mermaid.render('m' + Math.random().toString(36).slice(2), code);
      document.getElementById('c').innerHTML = svg;
    };
    window.ready = true;
  </script>`);
await page.waitForFunction(() => window.ready === true);
for (const { name, code } of mermaid) {
  await page.evaluate((c) => window.draw(c), code);
  await page.locator('#c').screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log('Mermaid ', name);
}
await browser.close();
console.log(`Xong: ${Object.keys(SVGS).length + mermaid.length} ảnh trong ${OUT}`);
