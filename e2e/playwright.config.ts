import { defineConfig, devices } from '@playwright/test';

/**
 * Chạy khi CSDL, API (cổng 3000) và giao diện (cổng 5173) đang chạy, dữ liệu đã seed.
 *   npm test             3 luồng E2E chính
 *   npm run screenshots  chụp màn hình cho báo cáo vào docs/screenshots
 */
export default defineConfig({
  timeout: 60_000,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:5173',
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'e2e', testMatch: /flows\.spec\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'screenshots', testMatch: /screenshots\.spec\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
});
