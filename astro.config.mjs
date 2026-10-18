import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// 江衍 · Digital Space
// Tailwind 只作为实现工具，视觉由 src/styles/global.css 中的 Design Token 决定。
//
// inlineStylesheets：
//   - 默认 'auto'——站点 CSS 产出为 _astro/*.css 哈希文件，可被 nginx 长缓存、跨页复用；
//   - 需要 file:// 离线预览（单文件带走）时，构建前设置 DSH_INLINE_CSS=1 回到 'always'。
export default defineConfig({
  site: 'https://nijingzh.top',
  prefetch: true,
  build: {
    inlineStylesheets: process.env.DSH_INLINE_CSS === '1' ? 'always' : 'auto',
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
