import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// 江衍 · Digital Space
// Tailwind 只作为实现工具，视觉由 src/styles/global.css 中的 Design Token 决定。
export default defineConfig({
  prefetch: true,
  build: {
    // 便于 file:// 离线预览：把 CSS 全部内联进页面
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      // dev 下把 /api/like 指到本地计数服务（node deploy/like-server/server.cjs）
      proxy: {
        '/api/like': 'http://127.0.0.1:3001',
      },
    },
  },
});
