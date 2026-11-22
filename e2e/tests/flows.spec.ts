/**
 * Ba luồng E2E trọng tâm theo đề cương mục 3.4:
 *   E2E-01 đăng nhập và tạo ca
 *   E2E-02 tạo đợt, ghi kết quả, sửa ca gốc mà lịch sử đợt không đổi
 *   E2E-03 đóng đợt, xem thống kê và xuất CSV
 * Mỗi lần chạy tạo một dự án riêng qua API nên không đụng dữ liệu demo.
 */
import { expect, Page, request, test } from '@playwright/test';
import fs from 'node:fs';

const stamp = Date.now().toString(36).toUpperCase();
const CODE = `E2E_${stamp}`;
const API = process.env.API_URL ?? 'http://localhost:3000/api';
let projectId: number;
let projectName: string;

async function loginUI(page: Page, email = 'tester@testflow.local', password = 'Tester@123') {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mật khẩu').fill(password);
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
}

/** Dòng ca trong danh sách bên trái của màn hình thực hiện đợt, khớp đúng mã ca. */
const runItem = (page: Page, code: string) =>
  page.locator('.run-item').filter({ has: page.locator('.mono', { hasText: new RegExp(`^${code}$`) }) });

async function loginOK(page: Page) {
  await loginUI(page);
  await expect(page.getByRole('heading', { name: 'Dự án', exact: true })).toBeVisible();
}

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  const ctx = await request.newContext();
  const login = await ctx.post(`${API}/auth/login`, {
    data: { email: 'tester@testflow.local', password: 'Tester@123' },
  });
  const { accessToken } = await login.json();
  const headers = { Authorization: `Bearer ${accessToken}` };
  projectName = `Playwright ${stamp}`;
  projectId = (await (await ctx.post(`${API}/projects`, { headers, data: { name: projectName } })).json()).id;
  const suite = await (await ctx.post(`${API}/projects/${projectId}/suites`, { headers, data: { name: 'Đăng nhập' } })).json();
  // Thêm 2 ca sẵn có để đợt có nhiều hơn một ca.
  for (const code of [`${CODE}_A`, `${CODE}_B`]) {
    await ctx.post(`${API}/projects/${projectId}/cases`, {
      headers,
      data: { code, title: `Ca nền ${code}`, suiteId: suite.id, steps: [{ action: 'Mở trang', expected: 'Trang hiển thị' }] },
    });
  }
  await ctx.dispose();
});

test('E2E-01 đăng nhập sai bị từ chối; đăng nhập đúng và tạo ca kiểm thử', async ({ page }) => {
  await loginUI(page, 'tester@testflow.local', 'sai-mat-khau1');
  await expect(page.getByRole('alert')).toContainText('Email hoặc mật khẩu không đúng');

  await loginOK(page);
  await page.goto(`/projects/${projectId}`);
  await page.getByRole('button', { name: '+ Ca kiểm thử' }).click();

  // Gửi form trống: backend trả danh sách lỗi tiếng Việt.
  await page.getByRole('button', { name: 'Tạo ca' }).click();
  await expect(page.getByRole('alert')).toContainText('Tên ca kiểm thử là bắt buộc');

  await page.getByLabel('Mã ca *').fill(CODE.toLowerCase());
  await page.getByLabel('Bộ kiểm thử *').selectOption({ label: 'Đăng nhập' });
  await page.getByLabel('Độ ưu tiên').selectOption('HIGH');
  await page.getByLabel('Tên ca kiểm thử *').fill('Đăng nhập bằng mật khẩu sai');
  await page.getByPlaceholder('Thao tác').first().fill('Nhập mật khẩu sai, bấm Đăng nhập');
  await page.getByPlaceholder('Kết quả mong đợi').first().fill('Báo lỗi, không tạo phiên');
  await page.getByRole('button', { name: '+ Thêm bước' }).click();
  await page.getByPlaceholder('Thao tác').nth(1).fill('Quan sát ô mật khẩu');
  await page.getByPlaceholder('Kết quả mong đợi').nth(1).fill('Ô mật khẩu được xoá trắng');
  await page.getByRole('button', { name: 'Tạo ca' }).click();

  await expect(page.getByRole('heading', { name: 'Sửa ca kiểm thử' })).toBeVisible();
  await expect(page.getByLabel('Mã ca *')).toHaveValue(CODE); // tự viết hoa
});

test('E2E-02 tạo đợt, ghi kết quả; sửa ca gốc không làm đổi bản chụp trong đợt', async ({ page }) => {
  await loginOK(page);
  await page.goto(`/projects/${projectId}/runs`);
  await page.getByRole('link', { name: '+ Đợt kiểm thử' }).click();
  await page.getByLabel('Tên đợt *').fill('Hồi quy E2E');
  await page.getByLabel('Phiên bản phần mềm *').fill('2.0.0');
  await expect(page.getByRole('button', { name: 'Tạo đợt với 3 ca' })).toBeVisible();
  await page.getByRole('button', { name: 'Tạo đợt với 3 ca' }).click();

  await expect(page.getByRole('heading', { name: /Hồi quy E2E/ })).toBeVisible();
  await expect(page.getByText('Tiến độ 0/3')).toBeVisible();

  // Chọn ca vừa tạo ở E2E-01: bản chụp có 2 bước.
  await runItem(page, CODE).click();
  await expect(page.locator('.steps-table tbody tr')).toHaveCount(2);

  // Không đạt mà bỏ trống mô tả → bị từ chối (BR14).
  await page.locator('.status-option', { hasText: 'Không đạt' }).click();
  await page.getByRole('button', { name: 'Lưu kết quả' }).click();
  await expect(page.getByRole('alert')).toContainText('cần mô tả kết quả thực tế hoặc ghi chú');
  await page.getByLabel('Kết quả thực tế *').fill('Trang trắng, không có thông báo lỗi');
  await page.getByRole('button', { name: 'Lưu kết quả' }).click();
  await expect(page.getByText('Tiến độ 1/3')).toBeVisible();

  // Ghi Đạt cho ca kế tiếp (trang tự chuyển sang ca chưa chạy).
  await page.locator('.status-option', { hasText: /^Đạt$/ }).click();
  await page.getByRole('button', { name: 'Lưu kết quả' }).click();
  await expect(page.getByText('Tiến độ 2/3')).toBeVisible();

  // Sửa ca gốc: thêm bước thứ 3.
  await runItem(page, CODE).click();
  await page.getByRole('link', { name: 'Xem ca gốc hiện tại' }).click();
  await page.getByRole('button', { name: '+ Thêm bước' }).click();
  await page.getByPlaceholder('Thao tác').nth(2).fill('Bước bổ sung sau đợt');
  await page.getByPlaceholder('Kết quả mong đợi').nth(2).fill('Kết quả bổ sung');
  await page.getByRole('button', { name: 'Lưu thay đổi' }).click();
  await expect(page.getByText('Đã lưu thay đổi.')).toBeVisible();

  // Lịch sử của ca: đợt chạy với 2 bước, ca hiện có 3 bước.
  const row = page.locator('tr', { hasText: 'Hồi quy E2E' });
  await expect(row).toContainText('Không đạt');
  await expect(row).toContainText('(hiện 3)');

  // Quay lại đợt: bản chụp vẫn 2 bước.
  await row.getByRole('link', { name: 'Hồi quy E2E' }).click();
  await expect(page.locator('.steps-table tbody tr')).toHaveCount(2);
});

test('E2E-03 đóng đợt, kết quả bị khoá; xem thống kê và xuất CSV tiếng Việt', async ({ page }) => {
  await loginOK(page);
  await page.goto(`/projects/${projectId}/runs`);
  await page.getByRole('row', { name: /Hồi quy E2E/ }).click();

  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Đóng đợt' }).click();
  await expect(page.getByText('Đợt đã đóng: kết quả được chốt')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Lưu kết quả' })).toHaveCount(0);
  await expect(page.locator('.result-form textarea').first()).toBeDisabled();

  await page.getByRole('link', { name: 'Thống kê & CSV' }).click();
  const passRate = page.locator('.tile', { hasText: 'Tỷ lệ đạt' });
  await expect(passRate).toContainText('50.0%'); // 1 Đạt / (1 Đạt + 1 Không đạt)
  await expect(page.locator('.tile', { hasText: 'Tiến độ' })).toContainText('2/3');
  await expect(page.getByText('Đây là đợt đầu tiên của dự án')).toBeVisible();
  await expect(page.locator('tr', { hasText: CODE })).toContainText('Trang trắng');

  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Xuất CSV' }).click()]);
  expect(dl.suggestedFilename()).toMatch(/^testflow-dot-\d+-v2\.0\.0\.csv$/);
  const text = fs.readFileSync(await dl.path(), 'utf8');
  expect(text.charCodeAt(0)).toBe(0xfeff);
  expect(text).toContain(`"${projectName}"`);
  expect(text).toContain('"Không đạt","Trang trắng, không có thông báo lỗi"');
  expect(text).toContain('"Trạng thái đợt","Đã đóng"');
});
