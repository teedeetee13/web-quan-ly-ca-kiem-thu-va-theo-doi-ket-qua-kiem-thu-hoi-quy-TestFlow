import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Gọi /api/* sẽ được chuyển tới backend NestJS, tránh lỗi CORS khi phát triển.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3000' },
  },
});
