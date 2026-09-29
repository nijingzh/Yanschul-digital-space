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
  },
});
