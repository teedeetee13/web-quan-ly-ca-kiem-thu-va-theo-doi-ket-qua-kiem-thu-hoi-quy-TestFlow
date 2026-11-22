/**
 * Chụp màn hình các giao diện chính cho báo cáo (docs/screenshots).
 * Chạy trên dữ liệu seed sạch: `npm run db:seed` ở backend trước.
 */
import { expect, Page, request, test } from '@playwright/test';
import path from 'node:path';

const OUT = path.resolve(__dirname, '../../docs/screenshots');
const API = process.env.API_URL ?? 'http://localhost:3000/api';
const shot = (page: Page, name: string, fullPage = false) =>
  page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage });

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mật khẩu').fill(password);
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page.getByRole('heading', { name: 'Dự án', exact: true })).toBeVisible();
}

let login02Id: number;

test.beforeAll(async () => {
  const ctx = await request.newContext();
  const { accessToken } = await (
    await ctx.post(`${API}/auth/login`, { data: { email: 'tester@testflow.local', password: 'Tester@123' } })
  ).json();
  const list = await (
    await ctx.get(`${API}/projects/1/cases?search=TC_LOGIN_02`, { headers: { Authorization: `Bearer ${accessToken}` } })
  ).json();
  login02Id = list.items[0].id;
  await ctx.dispose();
});

test('chụp màn hình giao diện', async ({ page }) => {
  await page.goto('/login');
  await shot(page, '01-dang-nhap');

  await login(page, 'admin@testflow.local', 'Admin@123');
  await shot(page, '02-danh-sach-du-an');

  await page.goto('/projects/1');
  await expect(page.locator('.table tbody tr').first()).toBeVisible();
  await shot(page, '03-chi-tiet-du-an');

  await page.goto(`/cases/${login02Id}`);
  await expect(page.getByText('Lịch sử kết quả qua các đợt')).toBeVisible();
  await expect(page.locator('section tbody tr').first()).toBeVisible();
  await shot(page, '04-form-ca-va-lich-su', true);

  await page.goto('/projects/1/cases/new');
  await page.getByRole('button', { name: 'Tạo ca' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await shot(page, '05-kiem-tra-du-lieu');

  await page.goto('/projects/1/runs');
  await expect(page.locator('.table tbody tr')).toHaveCount(3);
  await shot(page, '06-danh-sach-dot');

  await page.goto('/projects/1/runs/new');
  await page.getByLabel('Tên đợt *').fill('Hồi quy trước phát hành 1.3');
  await page.getByLabel('Phiên bản phần mềm *').fill('1.3.0');
  await page.locator('.toolbar select').nth(1).selectOption('CRITICAL');
  await shot(page, '07-tao-dot');

  // Đợt 1.2 đang mở: chọn ca bị chặn để thấy form ghi kết quả.
  await page.goto('/runs/3');
  await page.locator('.run-item', { hasText: 'TC_PAY_01' }).click();
  await expect(page.locator('.run-case h2')).toContainText('thanh toán khi nhận hàng');
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, '08-thuc-hien-dot');

  // Đợt 1.1 đã đóng: ca thụt lùi TC_LOGIN_02.
  await page.goto('/runs/2');
  await page.locator('.run-item', { hasText: 'TC_LOGIN_02' }).click();
  await expect(page.getByText('Đợt đã đóng')).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, '09-dot-da-dong');

  // Đợt 1.1: so với 1.0 có một ca thụt lùi (TC_LOGIN_02) và một ca đã sửa (TC_PAY_04).
  await page.goto('/runs/2/report');
  await expect(page.locator('.compare tbody tr').first()).toBeVisible();
  await shot(page, '10-thong-ke', true);
  await page.locator('.compare').screenshot({ path: path.join(OUT, '10b-so-sanh-dot-truoc.png') });

  await page.goto('/users');
  await expect(page.locator('.table tbody tr')).toHaveCount(3);
  await shot(page, '11-tai-khoan');

  await page.goto('http://localhost:3000/api/docs');
  await expect(page.getByText('TestFlow API')).toBeVisible();
  await shot(page, '12-swagger');
});
