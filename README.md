# 江衍 · Digital Space

我vivecoding的个人数字空间。放文章、项目、学习记录、生活碎片，顺手塞了些没什么实际用处但自己喜欢的小玩意。

口号是「0 为过去，1 即未来。」想 slogan 那天定下来的，一直没换。

## RUN

```bash
npm install
npm run dev
```

开发端口 4321。`npm run build` 出产物到 `dist/`，`npm run preview` 看构建后的效果。

## 技术栈

Astro 7 + TypeScript（strict）+ Tailwind 4 + Anime.js v4。

没引 React 或 Vue。这站大部分内容是静态的，再挂个 UI 框架感觉没必要，Astro 默认零 JS 刚好。动效归 Anime.js 管，只动 transform 和 opacity，开了 `prefers-reduced-motion` 就全部老实静止。

正文和小字用霞鹜文楷（[LxgwWenkai](https://github.com/lxgw/LxgwWenkai)，OFL 协议），走 jsdelivr 的 unicode-range 分片加载，整包字库对中文站太重了。标题是衬线，代码等宽。

## 结构

```
src/
  components/   组件。StarField 是全站背景星芒，SiteLoader 是进站动画，
                WorldSection 是首页「我的世界」，StatsPanel 是那块观测台
  content/      内容在这，markdown，走 Astro Content Collections
  layouts/      Base
  lib/          motion.ts，入场编排和滚动动效
  pages/        路由
  styles/       global.css，所有颜色和间距的 token 都在这
public/
deploy/         docker-compose + nginx 模板，部署用
docs/           交接文档、Phase 记录、schema 契约、v1 收尾
```

改样式之前建议先翻一遍 `global.css` 的 token。颜色别写死，粉紫色只准待在环境光层，按钮和链接不许碰；装饰母题只有星芒一个；分隔线用发丝线。这些都是定过的设计约束，之前图省事硬编码了五十多处颜色，后来整批返工清了一遍，挺痛苦的。

## 部署

`deploy/` 里有 docker-compose（站点 + Folia 音乐播放器 + nginx 反代）和 nginx 配置。环境变量照着 `deploy/.env.example` 建一个 `.env` 填值，别提交进仓库。

## 还没做完

- 留言和评论，等部署上线之后再弄
- Folia 的全屏演出模式，生产环境还没验收
- 站上文章是占位内容，得慢慢换成真的
- 一些想法记在 `docs/` 里了，实现日期未定

## 致谢

`/ui` 页面的 galaxy 按钮来自 [Uiverse.io](https://uiverse.io)（MIT）。字体是霞鹜文楷，lxgw 提供。


