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

`deploy/` 里有 docker-compose（站点 + Folia 音乐播放器 + nginx 反代）和 nginx 配置。

配置分两层，都走 `.env`，都被 `.gitignore` 挡着，不会进仓库：

**构建时配置**（项目根目录建 `.env`）——`PUBLIC_` 开头的会打进前端产物，所以它们不是秘密，只是不想写死在代码里：

```bash
PUBLIC_FOLIA_BASE=https://nijingzh.top:81   # Folia 地址，改域名时只动这一行
PUBLIC_FOLIA_STAGE_PATH=/player/stage
PUBLIC_FOLIA_PLAYLIST_ID=593219640          # 网易云歌单 ID，空了播放器不工作
```

不建 `.env` 也能 build，代码里有默认值（之前踩过坑：默认值留空，拉下来构建出来的站播放器直接不响，查了半天）。想换歌单或换域名，改完重新 `npm run build` 就行。

**服务端密钥**（`deploy/.env`）——这些才是真正敏感的，只给服务器上的容器读，前端碰不到：

```bash
NCL_COOKIE="MUSIC_U=xxx; __csrf=yyy"   # 网易云登录 Cookie，解全曲试听（见下）
```

`NCL_COOKIE` 说两句。不带登录态的时候网易接口只吐 30 来秒的试听片段，歌听一半就跳；带上你自己的登录 Cookie 就是全曲。拿法：浏览器登录 music.163.com，F12 → Network → 随便点个请求，把 Request Headers 里那行 Cookie 整条抄下来贴进去。

这行 Cookie 等同你的网易账号密码，别发给任何人，包括别贴到聊天窗口里让 AI 帮你看——自己填就好。它只活在服务器的 `.env` 里，git 看不到它。哪天觉得不对劲，网页上退出登录或者改个密码，这条就作废了。

## 还没做完

- 留言和评论，等部署上线之后再弄
- Folia 的全屏演出模式，生产环境还没验收
- 站上文章是占位内容，得慢慢换成真的
- 一些想法记在 `docs/` 里了，实现日期未定

## 致谢

`/ui` 页面的 galaxy 按钮来自 [Uiverse.io](https://uiverse.io)（MIT）。字体是霞鹜文楷，lxgw 提供。


