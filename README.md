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

**服务端密钥**——只给服务器上的服务读，前端碰不到。这里之前写过一个 `NCL_COOKIE` 环境变量，是错的，Folia 和网易 API 都不认这个名字，已经删掉。真实情况是这样：

歌曲只能听 30 来秒，是网易对**未登录**的限制，不是哪个配置没填。解法两条：

1. **Folia 里扫码登录**（主路径）。打开你的 Folia 页面，找网易云扫码登录入口，用网易云 App 扫一下。登录态存在服务端，Folia 里听什么都是全曲。
2. **nginx 注入 Cookie**（想让主站的生活页播放器也全曲时用）。加在 **81 端口 Folia 的 `/api/` 反代**里（443 主站的 `/api/like` 不用动）：

```nginx
proxy_set_header Cookie "MUSIC_U=你的; __csrf=你的";
```

注意：如果 `/api/` 反代还没剥前缀，播放器会报 `Cannot GET /api/...`，需要在同一个 location 里加一行 `rewrite ^/api/(.*)$ /$1 break;`（网易 API 的路由是 `/song/url`，不是 `/api/song/url`）。

Cookie 从哪拿：浏览器登录 music.163.com，F12 → Network → 随便一个请求，把 Request Headers 里的 Cookie 整行抄下来。这行东西等同你的网易账号密码，只放在服务器的 nginx 配置里——不进 git、不进前端、别发给任何人。哪天觉得不对劲，改个密码它就作废了。

## 点赞计数服务

页眉那个「✦ 计数」点赞按钮，数字存在一个小服务里，部署站点时要顺手把它跑起来，否则按钮一直显示「—」。

```bash
cd deploy/like-server
nohup node server.cjs > /var/log/like-server.log 2>&1 &
```

然后主站 nginx 的 server 块里加三行，`nginx -t && nginx -s reload`：

```nginx
location /api/like {
  proxy_pass http://127.0.0.1:3001;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;   # 点赞按 IP 冷却要靠它
}
```

自测 `curl https://nijingzh.top/api/like`，返回 `{"count":N}` 就通了。数据存在 `like-server/like.json`，想清零删掉它重启就行。

**想让它一直活着（开机自启 + 崩了自动重启）**——别用 `nohup`，用 systemd。仓库里有一键脚本，它会自己把仓库路径和 node 路径写进 unit：

```bash
sudo bash deploy/like-server/install.sh
```

脚本会完成 `enable --now` 并打印状态和自测结果。手动装也可以（模板 `deploy/like-server/like-server.service`，装之前改 `WorkingDirectory` 和 `ExecStart` 两处路径）：

```bash
# 0. 先杀掉 nohup 起的旧进程（否则端口被占）
pkill -f "node server.cjs"

# 1. 改模板里两个路径（WorkingDirectory 指到你放 like-server 的目录；
#    ExecStart 的 node 用 which node 查出来的绝对路径），然后装上
sudo cp deploy/like-server/like-server.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now like-server

# 2. 确认
sudo systemctl status like-server     # active (running) 就成了
curl http://127.0.0.1:3001/api/like
```

机器重启它自己起来，进程挂了 3 秒内自动拉起。日志用 `journalctl -u like-server -f` 看。

## 还没做完

- 留言和评论，等部署上线之后再弄
- Folia 的全屏演出模式，生产环境还没验收
- 站上文章是占位内容，得慢慢换成真的
- 一些想法记在 `docs/` 里了，实现日期未定

## 致谢

`/ui` 页面的 galaxy 按钮来自 [Uiverse.io](https://uiverse.io)（MIT）。字体是霞鹜文楷，lxgw 提供。


