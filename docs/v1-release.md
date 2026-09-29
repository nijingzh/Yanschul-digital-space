江衍 · Digital Space — v1 上线收尾文档
定稿日期：2026-09-29
批准：江衍（「没问题。这个项目上线的 v1 版本就这么敲定了」）
═══════════════════════════════════════════════════

【定稿声明】
v1 版本范围正式敲定：Phase 1–5 全部 + UI 组件库（8 类 + 星芒 Loader + 发丝线 C）
+ 主题系统（明亮 / 夜航）+ 全站背景粒子 + 霞鹜文楷字体。
build 21 页全绿，明暗双主题验收通过。此后任何改动按 v1.x 迭代登记，
不再回改 v1 已定稿项（除非江衍明确裁决推翻）。

一句话定位（沿用交接文档 v23）：
江衍 Digital Space —— 拥有二次元灵魂、现代高级视觉与细腻动效的个人数字空间。
不是技术博客，不是二次元博客，不是模板。

═══════════════════════════════════════════════════
【一、v1 版本范围】
═══════════════════════════════════════════════════

1. 站点结构（build 21 页）
   静态 9：首页 / 文章 / 项目 / 学习 / 生活 / 关于 / 归档 / 标签 / 404
   动态 12：posts × 8 + projects × 3 + rss.xml 1
   演示 1：/ui（组件库 + 发丝线 A/B/C + 粒子小样）

2. 视觉语言
   冷白瓷面：#F7F8FC / #FAF4F8 / #F3EEF8；文字 #1D1D22 / #777780
   粉紫只做「光」（环境光层），不进按钮/链接/标签/大面积色块
   光轴：全站唯一光源 = 星芒装置（右上偏后），高光右上、投影落向左下
   星芒母题 ✦ 全站唯一装饰母题；发丝线 C（外框 --hair-frame 0.28 + 内细线 0.16，去框中框）
   夜航暗玻璃：--color-panel 明 rgba(253,253,255,0.72) / 夜 rgba(22,22,30,0.72)

3. 字体
   正文 + 小字 = 霞鹜文楷（jsdelivr lxgw-wenkai-webfont@1.7.0，unicode-range 分片）
   标题衬线不动；行内代码等宽保留

4. 动效
   Anime.js v4.5.0 页内编排 + View Transitions 只管页间转场
   只动 transform / opacity；shadow 薄；全程 respect prefers-reduced-motion
   星芒微光「浮现—静—飘散」（四芒星 8px / 0.65 峰值 / 700ms 缓入 · 980ms 静 · 420ms 飘散）
   SiteLoader 星芒加载动画：完整加载显示满 2000ms，SPA 导航不弹
   全站背景粒子 StarField：16 颗 ✦（12–24px、opacity 0.35–0.85、fixed z -1、reduce 静止）

5. 数据
   Astro Content Collections 五 collection（feed / project / world / media / now）
   契约沿用 docs/schema-contract.md（latest.title / latest.date 冻结字段）
   读数口径：文章 3 / 分类 4 / 标签 14 / 总字 2.1k / 已住自 SITE_BIRTH=2026-09-23

6. 交互
   ⌘K / Ctrl+K 搜索面板、夜航切换（localStorage + 导航保持）、回顶星芒、阅读进度线

═══════════════════════════════════════════════════
【二、v1 定稿前收尾批（2026-09-28 ～ 09-29）】
═══════════════════════════════════════════════════

1. 夜航暗玻璃 token 化（江衍裁决「暗玻璃」）
   22 文件约 50 处硬编码颜色 → token；--color-panel 夜 rgba(22,22,30,0.72) 实证
   夜航 .display 提亮：#b8aed0 + 渐变层上移（修「我的世界」标题发虚）

2. 主题随 SPA 导航保持（修「点其他界面后变明亮」）
   Base.astro applyTheme() + astro:page-load 重应用
   （ClientRouter 导航清 html[data-theme] 且 module script 不重跑）

3. 「我的世界」区收尾（江衍裁决：选 B、观测台不改动）
   B 弱化错落：.place margin-top 34/8/24px → 12/6/18px；width 29/19/21/24% → 26/22/24/24%
   四栏底框：夜航 .place box-shadow: none（暗背景下接触阴影 = 突兀底框）
   冷纱 band-cool 夜航 rgba(232,230,246,0.5) → rgba(122,110,196,0.22) 暗紫
   观测台 StatsPanel 按裁决全程未动

4. 页脚下方剩余空间修复
   根因：GlowTransition .glow-cool/.glow-warm（absolute + height:110vh）溢出撑高文档 385px
   改 fixed（z-index:-1）后实测 docH = footerBottom，gap: 0

5. 明亮主题浅紫遮罩（方案 C，江衍批准）
   --color-space-0 #fdfdff → #f7f5fc（基底降亮 ~2%）
   body 背景顶层加紫纱 rgba(167,152,218,0.045)（再压 ~4.5%）
   合计压亮 ~7%；环境光三层/星芒晕不动（光晕不发灰）；夜航不受影响

   踩坑登记（Astro scoped style）：组件内 [data-theme='night'] 属性选择器会被 Astro
   自动加 cid 导致永远匹配不上（表现为夜航值不生效、dev 重启也没用）；
   解法 = :global([data-theme='night']) .xxx。

═══════════════════════════════════════════════════
【三、验收记录】
═══════════════════════════════════════════════════

· build 21 页全绿（9 静态 + 8 posts + 3 projects + rss + /ui）
· 明亮主题：9–10/10（柔和不刺眼、粉紫光晕不灰、文字清晰）
· 夜航主题：「我的世界」9.5/10（无白光带、光晕融入暗背景、四栏均衡无底框）
· 页脚剩余：宽屏 2560×1440 实测 gap 0（贴底）
· 导航主题保持：点导航后 theme:night 保持
· SiteLoader：2000ms 满时长（临时放大 8s 实测 loader@2s:1 后改回）
· 夜航 computed 实证：.work rgba(22,22,30,0.72)、band-cool rgba(122,110,196,0.22)

═══════════════════════════════════════════════════
【四、红线与冻结（v1 生效）】
═══════════════════════════════════════════════════

· UI 全中文；英文只做小型装饰标签（NOW / WORLD / LATEST 等）
· 冻结文案：六意境代号、玄关 B5 语录「人在决定幸福的时候开始幸福」（勿错写「人生」）、
  B2 i am Yanschul、B3 三按钮名、简介三段式字符不动
· OC 红线：纯文字零角色图；角色（崩铁流萤二创）口径保留但不用 AI 图呈现
· 渐变字只主页「江衍」（SVG 渐变）+ 归档年份字；其余标题 page-title
· 动效只 transform / opacity、respect prefers-reduced-motion；阴影薄
· 观测台 StatsPanel：江衍裁决「选 B，不改动」
· 社交链接：github.com/nijingzh · space.bilibili.com/86719895 ·
  steamcommunity.com/id/nijingzh · x.com/Yanschul · mailto:nijingzh@gmail.com ·
  友链 www.travellings.cn/go
· galaxy 组件 MIT 可用（注明「UI 源自 Uiverse.io」）

═══════════════════════════════════════════════════
【五、遗留项与挂起（不阻塞 v1 上线）】
═══════════════════════════════════════════════════

· VPS 生产部署（deploy/ 五件已就绪：docker-compose 站点+folia+反代 / nginx /
  .env.example / folia-config.example.yml / logrotate）——等 VPS 访问方式
  · M4（生产 /player + UI token 压制）、M8（白名单主题对比帧）部署后验收
· Folia 全屏演出 / 歌单音源（生产环境补验）
· 留言评论（部署后做）
· 个人简介 B6 资料行原文丢失（待江衍补原文）
· 旧空壳目录 D:/IT/project/jiangyan-digital-space（句柄占用删不掉，重启后手动删）
· learning.astro「study 进度可视化」：文件头明文禁止进度条 → 跳过未做，待江衍裁决
· 真实内容上线时间点（占位数据换真值、外链替换）
· P1-5 / P1-6 作废关闭（恢复须先书面定义再立项）

═══════════════════════════════════════════════════
【六、上线清单】
═══════════════════════════════════════════════════

1. 构建：npm run build（Astro 7.3.4 + TS strict + Tailwind 4）
   Node v26.7.0 / npm 10.9.9；产物 dist/ 21 页
2. 部署：deploy/ 目录（docker-compose 站点+folia+反代）
   nginx 含 /player 双重限制、gzip、缓存、HTTPS 模板；音源密钥走 .env
3. 生产域名与 VPS 访问方式：待江衍提供
4. 上线后补验：M4 / M8 / Folia 演出 / 真实内容替换

═══════════════════════════════════════════════════
【七、文档索引】
═══════════════════════════════════════════════════

· docs/v1-release.md（本文档）—— v1 上线收尾与定稿记录
· docs/ai-handoff.md（v24）—— 版本化交接文档（硬约束引用『交接文档 v24』）
· docs/Phase.txt —— Phase 进度总览
· docs/schema-contract.md —— 公共字段冻结契约
