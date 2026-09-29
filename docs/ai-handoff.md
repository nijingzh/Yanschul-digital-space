江衍个人数字空间 ｜ AI 交接上下文 v25（v1 上线定稿 · 2026-09-29）
v25 更新（2026-09-29，v1.x 迭代批「主页翻页式滚动 + 刷新回顶」；裁决链：「先A,只做主页」→「换 mandatory」→「四个区块…我的世界最顶端分割点是对的，01 02的分割点也这么区分。主页和页脚可以不用吸附」→「01的区块顶部可以定在这一条状态栏上面吗」→「刷新界面应该返回首页主页最顶端」→「01和02间可以增加点间隙，吸附到第二区块时能看到第三区块」→「我要的是01屏内见不到02」）：
【翻页式滚动】方案 A · CSS scroll-snap 只主页（index.astro 样式随主页打包，其他页 snap:none 天然不吸附）：scroll-snap-type: y mandatory + scroll-padding-top: 60px（SiteHeader fixed 高）。分割点三个 = 01 屏顶在跑马灯条上沿（.marquee）、02/03 眉标贴 nav（.content-square .section-eyebrow / .world .section-eyebrow）。主页首屏与页脚不作翻页目标但须合法停位（mandatory 下非法停留会被强制拉到 01/03）= .hero scroll-snap-align:start + scroll-margin-top:-60px（停位精确 0）+ .site-footer scroll-snap-align:end（落底 3846）。
【屏内规则】01 屏内见不到 02：.latest padding-top: max(5rem, calc(100vh - 932px))（02 眉标恰好推出 100vh 外、随窗口高度自适应；1266/1440 双视口实测 02 眉标 y=1266/1440 = 视口底零像素露出）；02 停位见 03（02 屏 996px，1266 视口露 210px、1440 露 384px）。
【区块间隙】主页 .section/.content-square padding-block: clamp(5rem,13vh,9.5rem)→clamp(2rem,4vh,3rem)（01→02 间隙 296→224px 后随 vh 公式自适应；02→03 48px）；LatestSection 收紧：feed-link padding 1.15→0.5rem、feed-main gap 0.35→0.25rem、latest-grid gap 3.5→2rem（02 屏 1040→996px，8 条完整不挤）。
【刷新回顶】Base.astro head inline：history.scrollRestoration='manual' + scrollTo(0,0) + window load 二次归零——浏览器的滚动恢复发生在脚本之前，只做前两步实测仍停原位（2244），load 兜底后 navType=reload 双次实测回 0。
【同批 v1 收尾延续】删主页语录浮条 quote-chip 整块（关于页 B5 同句未动、删否待裁决）；明主题紫纱 0.045→0.07→0.09（两次「再深一点」）；hero .hero-grid min-height: calc(76vh-5rem) 删除（首屏留白 307→20px）+ 恢复双栏 grid-template-columns: minmax(0,1.27fr) minmax(0,1fr)（v23 列定义丢失致 .hero-stage 掉到 .hero-copy 下方）。
【坑·mandatory 停位合法性】停位 = 元素顶 − scroll-padding；为负（-60）即不可达 → 该位置非法 → 被强制拉走（首屏拉 01/03 的根因），scroll-margin-top 负值抵消可救；snap area > snapport（超高区块）区内自由停靠、area < snapport 强制精确对齐；agent-browser open/reload 会记忆滚动位置（2244 假象两轮误判），真刷新验证必须断言 navType:'reload'。
【验收】build 21 页；分割点停位 1344/2244/3419 精确落位；1266/1440 双视口 01 屏零露出 02、02 屏见 03；真刷新（navType reload ×2）回顶 0；/articles /projects /about snap:none 不变。
v24 更新（2026-09-29，v1 上线收尾批；江衍敲定「这个项目上线的 v1 版本就这么敲定了」，收尾文档 = docs/v1-release.md）：
【主题收尾五项】①夜航暗玻璃 token 化（22 文件 ~50 处硬编码→token、--color-panel 夜 rgba(22,22,30,0.72)、.display 夜航提亮 #b8aed0）②主题随 SPA 导航保持（Base.astro applyTheme + astro:page-load 重应用，修「点其他界面变明亮」）③「我的世界」收尾（江衍裁决：选 B、观测台不动）：错落收敛 margin-top 34/8/24→12/6/18px、width 29/19/21/24→26/22/24/24%；夜航 .place box-shadow:none 除底框；band-cool 夜航 rgba(232,230,246,0.5)→rgba(122,110,196,0.22) ④页脚下方剩余修复（根因 GlowTransition .glow-cool/.glow-warm absolute+height:110vh 溢出撑文档 385px→改 fixed z-index:-1，实测 docH=footerBottom gap:0）⑤明亮主题浅紫遮罩方案 C（江衍批准）：--color-space-0 #fdfdff→#f7f5fc + body 渐变顶层紫纱 rgba(167,152,218,0.045) 合计压亮 ~7%、光晕不发灰、夜航零影响。
【Astro scoped style 坑】组件内 [data-theme='night'] 属性选择器被 Astro 自动加 cid 致永不匹配（夜航值不生效、重启 dev 也无效），解法 :global([data-theme='night']) .xxx。
【验收】build 21 页全绿；明主题 9–10/10、夜航「我的世界」9.5/10、页脚 gap 0、导航后 theme:night 保持、band-cool/glow 夜航 computed 实证暗紫。
v23 更新（2026-09-28，大改批 P1–P3，方案经江衍「照做」批准）：
【P1 视觉骨架】首页三幕重排（Hero 语录浮条 / 跑马灯+不对称双栏广场：LatestSection 3fr + NotesFlow 痕迹流 2fr / WorldSection 杂志网格 29-19-21%+hover 微升）；星海三层视差（c/d/e 层 --parallax 0.045/0.022/0.01，rAF 滚动 translate）+ 流星随机（8–14s 一条，217° 光轴方向）；排版系统定稿（--text-display/h1/h2/h3/body/mono 字阶 + .prose 中文细则 + 代码块 + 脚注）；articles 编辑部式（大编号 01/02 衬线 1.9rem + hover 摘要提亮）；life 时间轴切片（竖线+✦节点，覆盖原「错落交替缩进」基准，偏离待复审）。
【P2 交互】⌘K/Ctrl+K SearchPalette（全站模糊搜索/键盘导航/玻璃面板，index 构建时注入）+ 导航「搜索 ⌘K」按钮；夜航模式（data-theme=night token 暗面 #14141b + 光域冷紫霓虹版 + localStorage）；回顶星芒按钮（>20% 出现）+ 阅读进度线（scaleX）。
【P3 功能】/archive 归档（年月时间线+渐变年字）+ /tags 标签云（字号随篇数）+ /rss.xml（手写零依赖端点）+ footer 工具链接行（归档/标签/RSS，导航红线未动）。
【功能断言全过】build 9 页；marquee/3 星层/语录浮条/痕迹流 3/搜索开合 7 条+命中/夜航 rgb(20,20,27)/回顶/进度全 OK；重叠检测仅 1 处=header 悬浮层与正文几何交叠（设计内 PASS）；8 页截图 vision 巡检无重叠错位字体冲突；year-no 渐变 computed 实证生效。
【冲突登记】learning.astro 文件头明文「禁止卡片网格、禁止进度条/百分比」→ 方案「study 进度可视化」跳过未做，待江衍裁决；TOC 因无文章详情模板跳过。
v21 更新（2026-09-28，美术自由发挥批）：学 Sumi（减法/单一重音/纸墨质感/大气光）+ Kanade（流动形态/纸张抬起/暖粉彩），手法融进冷白瓷面语言零形态抄袭：①星芒 bloom 双层（内晕 520px + 外晕 1100px @0.14 错相 1.5s，Sumi 光学）②波浪发丝线（SVG 缓波 1px/rgba(29,29,34,0.26)/240px 平铺，Kanade 流动形态 × 发丝线语法——hero 底 + 页脚上 2 处）③纸张抬起（.pressable:hover 双层柔化阴影 -6px 14px 28px @0.18）④浮雕光三层（白高光 0.95 + 接触 0.07 + 紫底光 rgba(214,208,242,0.25)）⑤重音纪律确立（灰紫 #9B8AA8 每页 ≤3 处）。此前对比度批（v20.4）：星芒 12→20 颗 18-24px 深色可辨、发丝线 0.08→0.16、暗角 0.18/62%、大字渐变尾 #9B8AA8、金句「过去/未来」灰紫重音、星芒钉首屏（absolute 100vh 滚动不跟随）。
v20.3 更新（2026-09-27，任务单 v17.2 雾瓷）：五层全落（global.css 纯 CSS、零结构/零新增色/零新母题）——L1 环境光场（body 背景换多层径向：主光右上 900px 冷紫 0.55 + 暖息左下 700px 0.45 + 基底 #F7F8FC token 未动、background-attachment: fixed 登记）；L2 暗角（body::after fixed、closest-corner 径向 rgba(29,29,34,0.045)→透明 70%）；L3 微肌理（html::after 24px 点阵 1px/0.025/multiply、与 Hero .dot-grid 同源）；L4 字面光（实色大字 text-shadow 0 1px 0 rgba(255,255,255,0.9) + 0 2px 8px rgba(29,29,34,0.05)；渐变字 clip 特性取 drop-shadow 等效两层——登记技术等效）；L5 星芒呼吸晕（body::before 右上 520px、0.32→0.38/8s alternate、reduce 恒 0.32）。验收：G4 改前后 6+6 对比图、G5 中心 vs 四角差 4.6%（规格 4.5%±1% 带心；暗角净贡献 8.0L/角、中心 0）、G6 reduce 恒 0.32 静止、G7 六页 DOM 全 SAME、C7 回归全过（冷纱 0.4/暖白 0.7/母题唯一/远景 on）。同批：页眉遮挡修复（.is-scrolled 55% 半透明玻璃→实底 var(--color-space-0)，修下层内容透字叠导航；冷纱光温层保留）——H1 图。
v20.2 更新（2026-09-27，任务单 v17.1 收口）：①G1 补证=「截图未滚全/reveal 未触发」情况（中段真实存在：letter h322/quote h51/foot h116 全 op1；滚全重拍 G1 长图 + B4/B5/B6 特写）；垂直节奏实测 96/40/88/64/96 全对（末档 foot→footer 48→96 已修 .entrance padding-bottom: 96px）②G2 深色工具条闭环=「dev 工具/浏览器插件悬浮 UI」分支（DOM 断言：MiniPlayer 透明 static、全页无深色条元素；不进 build 产物）③**三裁决入档**：气泡位置=环下居中（规格偏离已裁决认可）+ 无尾巴（B5 对话框才带尾巴）；页尾统计=维持等宽小字行（$ 文章 —— · … · 已住 N 天），不换玻璃面板；「认识我」=锚点滚动 #letter（scroll-margin-top 96px、smooth/auto(reduce)、滚动后导航「关于」激活态不变）④另两裁决登记：浮字时序维持 hover 即浮；移动端菜单不配代号。实数追加：锚点 scroll-margin-top 96px、滚动 smooth/auto；G3 实测 letter-top: 96 / scrollBehavior smooth / reduce auto / 激活态不变。
v20.1 更新（2026-09-27，任务单修订 A2.5）：导航意境代号 hover 浮字——六枚映射（首页=数字大厅/文章=书房/项目=工坊/学习=自习室/生活=客厅/关于=玄关，白名单追加）；规格 10px/300/0.18em/#777780、绝对定位项下 8px 居中、y6→0+op 0→1/240ms ease-out 移出即消、只 transform/opacity；红线不破（文字/顺序/激活态/wordmark/状态点/入场时序全未动，浮字不参与入场）；reduce 与移动端 display:none；实测 nav computed height 前后差 0（27.02→27.02）、六项 hover 逐个截图 F7b1–6、浮字读数 10px/300 六枚文案全对。
v20 更新（2026-09-27，任务单 v17 修订版执行）：①关于页整页重做「玄关」（B1–B7 全规格）：B1 底渐变 135° 三段 + 左下暖晕 420px@0.5（新登记豁免）+ 18 个 8px 级几何装饰（dot/line/cross/tri @20-35%、20s 漂移、reduce 静止）；B2 圆环 320px/1.5px/@25% + 环内暖光 0.55 + 「江衍」56/700 + i am Yanschul 12px/0.18em 斜体 + 右侧发丝气泡 +「关于」72px/700 三段渐变 #1D1D22→#9B8AA8→#C9A8B8 左上重叠；B3 三胶囊 44px/999px/玻璃 0.72 + 星芒图标 18px + hover 磁吸辉光 0.16/y-3px；B4 自述信 560px/17/400/2.0/28px 段距/4px 灰粉 bullet/首段 20/700/text-wrap pretty；B5 语录对话框发丝框 + 右下小尾巴；B6 资料三胶囊（❄/◎/☾）+ 页尾统计语法行（「——」占位、已住真实 tick）；B7 节奏 96/40/88/64/96、配图残留 0、无出血发丝线、幽灵数字不复用（已随回滚删）、导航零改动。C1–C8 全绿（C1 对称差 0px、C2 出血 0、C3 孤字实测=图标假象正文干净、C4 配图 0、C5 圆环 cx720 正中、C6 装饰 18、C7/C8 零回归不破）。A 部分（图标/渐变/终端拟态/挂件/hover/统计面板）此前 v17 批已落、标签计数 `#标签 ——` 口径核对合规。
v19 更新（2026-09-27，江衍裁决批；【已回滚 2026-09-27「返回上一版」】关于页/项目卡片两项重设计全部还原至 v18 状态，本段仅作记录）：①裁决落实=eyebrow 与 h1 现比保留、about 段落间距统一、页脚行距放宽（footer-bottom gap 1.2→2rem + line-height 2）②关于页重设计（「档案页」编辑式排版，文案/旁注/红线不动）：大数字 05 水印（clamp 5.5-9.5rem @0.055）+ 门牌横条（江衍 700/3.05rem 大衬线 + 右列 mark/门牌句右对齐）+ 档案条（发丝线三栏 grid、标签 mono 上值衬线下、移动端 4.4em/1fr 行内对齐）+ 自述编辑栏（「我是江衍。」升大导语 2.05rem、段距统一 2.2rem、行高 1.95、收尾句发丝线上轻排）③项目卡片重设计（新裁决覆盖 v2「stack hover 展开 7rem」冻结值）：删 stack-detail 竖展开列表、stack 单行常驻（0.58rem）、卡片加编号 01-04（右上角 mono 0.62rem 数字语言）、内部 gap 0.55→0.42rem；vision 双审：about「高水平、杂志感明显」、卡片「比展开式干净得多」。
v18 更新（2026-09-27，江衍直接签发「精修 Digital Space」单）：①SPACE 坐标系统统一（5 页 eyebrow 升级 SPACE 0N / NAME：01 NOTES / 02 WORKS / 03 LIFE / 04 STUDY / 05 ABOUT；与 Hero 右缘「Space · 00」读数呼应；首页室内分区 01/NOW 等编号保留不动）②数字日期语言（显示层统一点分「2026.09.27」，4 处；契约数据口径 YYYY-MM-DD 不动）③移动端实证修三处（about 资料行三项宽度 137/92/91 不齐 → 720px 下三行堆叠 + 4.4em/1fr 标签值基线对齐，实测 375,375,375/dt 基线 0,0,0；projects work-foot margin-top 0.25→0.9rem 修 stack/date 拥挤；hero-grid 移动端 gap 3→2.3rem）④六页 375px 长图排查（M-375-* 与 M2-375-* 时戳 0218/0224）。任务单大项按「符合方向即保留」处置：入场三拍层级、VT 转场、hover/scroll 克制、玻璃 ≤3/屏、点阵克制、人物图片不动（§十八）。挂起主观项：eyebrow 与 h1 字号比例、about 段落间距统一、页脚行距（vision 提出未实证，等裁决）。
v17 更新（2026-09-26，任务单 v17 · 界面美化 A 骨架）：①松绑四条按「方式自由、强度限制」执行（渐变解禁限光域=大标题 120° #1D1D22→#777780 渐变字 + 页眉 140px 冷纱 rgba(232,230,246,0.4)→透明；圆角一律 ≤14px 仅对象容器/圆形物件例外；动效仍只 transform/opacity；禁令清单不破）②星芒语法图标六枚（SparkIcon.astro，1.5px/18px/墨 65%→hover 100%+y−2px+2°/700ms；落位导航+Hero 入口+各页标题；禁外部图标库）③0/1 码脉（hover 入口末尾闪 0→1（80ms 换字）、点击闪码复用 transition-flash）④hover 组合拳（底线生长 40%→100%/700ms、按压 translateY 1px+−2px 5px 10px @0.12、focus-visible 矩形描边+0.16 辉光）⑤字重三档 700/500/300（display+hero-title/note+work+entry/lead）⑥终端拟态（$ play ▶ ———— 0:00 / 1:47 播放条、[1–N/N] 真实计数、旁注 ~）⑦统计面板（首页 03 区玻璃孤件 rgba(253,253,255,0.72)+14px：$ 行 +「——」占位 4 行 + 已住天数 tick（SITE_BIRTH 实时）+ #标签 —— 计数语法）⑧痕迹挂件（右下 rgba(232,230,246,0.16) 光晕+「人在决定幸福的时候开始幸福。」；30s 轮播/换字动效预留；移动端隐藏）⑨F1-F6 全过 + reduce 全降级（mote/flash/shadowDrift/VT 全 none；星芒 breathe=M6 既定静止态例外）+ hero 双栏 591.359px 464.625px 零回归。踩坑：patch fuzzy 曾把 Hero 样式插进 @media 毁双栏（新纪律：精确锚点+patch 后即验布局）；agent-browser hover/mouse move 不派发 mouseover/pointermove（JS 交互用 dispatchEvent 验证、CSS :hover 用 hover 命令）；reduce 模拟=`agent-browser set media reduced-motion`。文案新增待过语气：「/ space status」行标签（$ 文章/分类/标签/总字数/已住）、「$ play ▶ ———— 0:00 / 1:47」、「[1–N/N]」、「人在决定幸福的时候开始幸福。」。
v16 更新（2026-09-26，任务单 v16）：Phase 4 数据体系 = Astro Content Collections 迁移完成——src/content.config.ts（feed/project/world/media/now 五 collection，字段与契约一一对应）+ src/content/** 20 条 md（文件名序号=手序）+ src/data/content.ts 改查询层（getFeedItems/getProjectItems/getWorldItems/getMediaNotes/getNowItems + 新能力 getFeedByTag/getFeedByCategory/getTimeline），8 组件改 await 取数；同源保持（feed kind='项目' = project 首条映射注入）；标签/分类新字段先冻结后迁移（FeedItem.tags/category、ProjectItem.tags/category 入契约「Phase 4 追加冻结」）；**零视觉变化实证**：迁移前后六页 main 全文本 + latest 断言逐字节零差异（含同日期排序比较器等价修复）；踩坑两条：YAML href:# 不引号=注释、YAML 日期自动转 Date→dateStr 归一（UTC）；Astro 7 dev 单实例锁（旧 dev 未死、HMR 空 store）→ astro dev stop 重启解。Phase 5 高级交互 = VT 转场（spaceOut 380ms blur6/scale.996 → spaceIn 420ms，VT 只管页间、页内归 Anime.js is-settled、reduce 静止实测 animation none）+ 互动四件（星芒光标视差 ±6px lerp0.06 实测 translate(6.36,-1.77)、星芒连点 3 次彩蛋浮字实测 visible:true、深夜留灯 23:00–05:00 特殊状态（非时段零影响）、回访 tick visibilitychange 读数重跳 380ms）+ 星芒 hover 微亮（0.92→1、只 opacity）；三拍未退化、hover 冻结实测 1/0.75×6 + −3px、P1-5/P1-6 未动、粒子未新增。Folia/VPS/真实内容等排除项一律未动（deploy/ 维持现状）。文案新增 2 条待过语气（彩蛋「……你还在啊。灯给你留着。」/深夜「这么晚了。灯给你留着。」）。
v15 更新（2026-09-26，任务单 v8）：任务 A Hero 远景线稿层（定版图已过审）落地 = public/assets/hero-shadow.webp（247KB，源 png 3.4MB 转 webp 后删除）+ Hero.astro 远景层（「住在这的人的影子」，三层景深远层位 z-index:-1：环境光/内容之下、星芒最上不变；人物压右侧 ~58% 容器、mask 左缘 0%→55% 渐隐到 0 保文字区干净；透明度 0.13；img saturate(0) 收干色偏）+ 微动效（只 transform/opacity）：视差下沉微速差 0.12（scroll 300→translateY(36px) 实测）、极缓漂移 scale 1→1.03 20s alternate（1.029→1.027 两时刻实测在动）、滚过 Hero 淡出（opacity 实测 0）；入场第 1 拍仅透明度渐入 0/900（不参与 2/3 拍）；reduced-motion 静止帧（animation none + img op 1 实测）；灰态 saturate(0) 兼容；冻结飘瓣保留静止。H1（左干净/右羽化融入/右 40%）vision 三项全过；H2 四读数全绿；H3 灰阶协调 ✓；H4 对角采样四角 sat:0 纯灰阶（远景无第二光源）+ 目测确认唯一光源星芒（粉晕为星芒光晕落在远景上，光轴成立）。任务 B Folia 生产部署照旧阻塞（等 VPS 访问，§7.1）；M4/M8 挂起；M5/M7 回归全绿；E 六区视口图重拍（19:14）。v7 任务 A（门牌位补验）存档确认：R1a/R1b/R1c（20260926-1702）+ DOM 实证 plate-block:0/img:0/oc 引用:0。
v14 更新（2026-09-26，任务单 v7 + §9 收口）：任务 A 门牌位补验收口 = §9 裁决执行（不定义「原创/二创」、纯文字路线走到底、角色位永远纯文字/痕迹、不引入任何角色图）——about.astro plate-block 图槽 + TODO、life.astro 4×trace-block 图槽 + TODO + ratio 样式全部移除（dormant 不保留、/assets/oc/ 命名空间 src 与新 dist 均零残留），门牌位最终形态 = 纯文字（自述 + 资料行模糊写法）；复审截图角色立绘来源查明 = 旧构建产物 dist/（plate-block HTML 仍在旧产物）+ 浏览器缓存，已 rm -rf dist 重建消除；R1a/R1b/R1c 三张重拍（时间戳 20260926-1702，DOM 实证 plate-block:0 / img:0 / oc 引用:0 / wordmark「江衍 YANSCHUL · DIGITAL SPACE」）。任务 B Folia 生产部署 = 配置就绪态（无 VPS 访问方式，按 §7.3 等江衍提供 SSH/面板）：deploy/ 五件（docker-compose 站点+folia+反代含 env_file/日志轮转/expose 不裸露、nginx 含 /player 与 /player/stage 与 /player/admin 双重限制/gzip/缓存/HTTPS 模板、.env.example 音源密钥隔离、folia-config.example.yml 主题白名单口径（键名待官方文档校准）、logrotate.d/folia-site）；M4（生产 /player + UI token 压制）与 M8（白名单主题对比帧）等 VPS 部署后验收。M5/M7 回归全绿（dev 占位零报错、演出退回后 hover 0.85 正常）；E 六区视口图重拍（17:04）。§7.1 疑问关闭（§9.4）；仍挂：真实内容上线时间点、VPS 访问方式。
v13 更新（2026-09-26，任务单 v6 + §11/§12/§12A/§12B）：设计语言 v2 生效——北极星「冷白之上的活空间」，口号「0为过去，1即未来。」+ YANSCHUL 三处落位（页眉 wordmark / 页脚署名 / 关于页门牌）；A 全局装置 = 旁注组件 Sidenote（文章/生活/关于各用一处+）、建站计时 SITE_BIRTH=2026-09-23（自然日差+本地时区滚动，实测「这间屋子住了 3 天 15 时」，数字 tick 380ms）、纪念日灰态（09-18/09-30/12-13/清明每年年初更新，运行时 body.memorial-day + token 收干灰阶 + 星芒收白光 + CSS ×3/JS 静止终态 + 口号下灰态小字）；B 互动升级 = 光标微辉光（ambient --gx/--gy ±12px 惯性 0.06 lerp、移动端禁用）、磁吸（.magnetic 组合变量 --mx/--my ≤3px + --lift 与 hover/入场互不压制）、数字 tick、转场 0/1 闪码（160ms、VT 事件驱动、reduced-motion 隐藏）、Hero 光尘 18 颗（2px、opacity 0.06–0.12、固定排布，唯一允许粒子形态）；C 分区图谱 = 首页数字大厅/文章书房（旁注+磁吸）/项目工坊（tilt 0.8°/−0.6°、冷纱偏紫 rgba(230,227,249,0.45)、技术栈 hover 展开 7rem/700ms、meta 等宽）/生活客厅（旁注+听歌舞台）/学习自习室（发丝线刻度 8px×1px，禁进度条）/关于门牌（Yanschul+旁注密集+资料行占位）；D §3D 长图空白根因查明 = 滚全后 reveal 0/15 hidden（非 bug），系分区留白+≤0.16 极淡光晕在缩略长图的视觉损失（§6「长图仅参考」自洽）；Folia 集成 = 生活页听歌舞台 16:9（静止态=歌名+一行歌词、点击注入 iframe 懒加载、overlay 搬 body 保演出置顶不垫内容层、关=移除 iframe 释放）、首页兴趣位「听歌舞台 →」入口（div.place 防 a 嵌套）、全站迷你播放态（mediaNotes 在听同源、假数据、不参与入场编排）、deploy/ 编排（docker-compose 站点+folia+反代、nginx /player 与 /player/stage，不进 src）；V1–V6/M1–M9 验收证据齐（M4/M8 生产验收等 Folia 部署）。
v12 更新（2026-09-26 江衍裁决）：**OC 素材图片方案整体否决**（「全删了吧 否决这个添加图片的oc方案 太丑了」）——已删 public/assets/oc/ 全部成图（standee.png + traces 3 张 webp）、docs/oc/ 五件填写单、docs/oc-image-prompts.md 提示词母本（现 docs/ 只剩交接/Phase/schema 契约）；about.astro 门牌位与 life.astro 四槽换图全数回滚、恢复占位原样（角色红线注释与 TODO 一并复原）；v9–v11 的换图执行与口径裁决（半身构图、N1–N3 定案）随方案作废。角色 = 崩铁流萤（二创）口径保留，但**不再用 AI 生成图**呈现，后续呈现方式待新裁决。
v11 更新（2026-09-26）：痕迹切片 3/4 已换图上线（sketchbook / pages / draft → /assets/oc/traces/*.webp，PNG→WebP q92；life.astro 占位块 → img，只换图不动结构，新增 img.trace-block { display:block; object-fit:cover } 一行防变形 = N2 口径定案）；standee_2dbc55 与已落盘 standee.png 像素级一致（rms 0.0），立绘不动；backpack 张暂缓换图：成图书脊 ≥3 本 vs 文案「两本书」图文打架（Q5 物件不能说谎），待重跑/改文案/接受三选一裁决；N3 实况 = 成图走 on chair（椅子完整入画），待确认定案。
v10 更新（2026-09-26）：立绘采用图择优改选（江衍授权 AI 择优）= 第五张 image_22468f.png（切面叶片发饰 + 四叶草胸针 + 青绿挑染三项规格补齐，取代 v9 登记的第四张）；同名覆盖 standee.png 即完成换图（912×1216 = 3:4，补边 40px×2 零裁切已复验）；其余 v9 裁决不变（半身口径、额带保留、N1 销案）。
v9 更新（江衍 2026-09-26 裁决 A）：立绘口径变更 = 「全身立绘」→「**半身构图**」（采用成图 = Aurora 无参考纯提示词产出、用户选定）；额带随图保留、发饰「六芒切面发光」不再追（星芒母题软化为自然叶片）；standee.png 已落盘 public/assets/oc/standee.png（912×1216 = 3:4，源图 832×1216 左右各补 40px 适配、零裁切、无接缝已验）；N1 定案 = 容器 .plate-block 3:4 不动、图侧补边适配（「只换图不动结构」已执行：about.astro 门牌位占位块 → img）；N2/N3 仍挂母本 §5.2；4 张痕迹切片待跑（docs/oc/ 中文填写单）；NAI 参考系统故障实录 = 氛围转移与人物参考一用即 400（参考系统禁混用 + 服务端 encode-director 故障），故成图全程无参考纯提示词（docs/oc/standee.md v1.7）。
v8 更新（江衍 2026-09-26 指定）：立绘角色口径变更 = 崩坏：星穹铁道·流萤（Firefly，二创），替换「原创 OC」（两张例图即流萤同人图）；提示词规格 docs/oc-image-prompts.md 推进 v1.3（§1 / §6.6 ① 加角色名与 Danbooru 角色标签 firefly \(honkai: star rail\)、honkai: star rail），docs/oc/standee.md 同步；痕迹切片 4 张无人物不受影响；角色使用规则不变（完整立绘唯一出场位 = 关于页门牌位、不进导航、不重复出现）。
v7 更新：OC 素材 AI 提示词规格 docs/oc-image-prompts.md v1.2 落地（Q1–Q7 裁决收口）：跑图工具 = NovelAI（江衍侧落地）；立绘落盘 public/assets/oc/standee.png、画幅 2:3（1024×1536 口径，NovelAI 落地 832×1216）；切片 4 物件词改「写到一半的手稿」（图文同一件事）；立绘正文补灰格纹百褶裙 + 白过膝袜 + 发梢青绿挑染（四叶草为可选小细节，不细到袜口）；受光统一粉紫、不允许微暖（素材一暖 = 两个光源，破光轴）；NovelAI 参数版（Vibe Transfer 0.5–0.8 / Info 4–6、Steps 28–35、Euler Ancestral、CFG 5–6、UC Preset Low Quality + Beta）与 5 张 Danbooru 标签式提示词已入该文档；例图（pixiv 145959183 / 149895205）只作人物形象参考、只进 Vibe Transfer 不进仓库；新挂 N1–N3 待裁决（门牌位 2:3 裁决 vs 容器 3:4 vs NAI 832×1216 口径差、切片分辨率 vs 槽位比例、on chair vs 桌面一角）。
v6 更新：Phase 3 第三批（收尾批）交付 = 学习页（在读/在学的桌面）+ 关于页（门牌与自我陈述，门牌位=完整立绘唯一位置、占位待素材）+ 入场序列 contact sheet 关键帧表（6 帧）+ E×6 页长图；五页全部落地。登记基准更新：FeedItem 7 条倒序同源（第三批新增外语 1 条，待确认）；其余基准沿用（冷纱 0.4/羽化 12%/88%、暖白 0.7 不加暖、错落 24/10px、hover −3px+0.75+700ms、P1-4 辉光 0.16 线性、R4 时序 A 案）。
v5 更新：R1–R5 复审通过（hover 回归修复认定为恢复既定基准），Phase 3 放行；裁决 §13：P1-5 / P1-6 作废关闭（定义缺失，禁止臆造、不再排期，恢复须先书面定义再立项），Hero 的 data-readout / data-settle 属入场时序机制维持现状；Phase 3 第一批 = 文章页（书房）+ P1-4 滚动辉光过渡。
v4 更新：返工项 R1–R5 已执行交付（待复审）；登记 R3 采样读数、R4 时序基准、schema 契约落地、本轮疑问。
v3 更新：首页 P0 修复已执行并评审（有条件通过）；新增返工项 R1–R4、已裁决问题、协作规范。

一句话定位
江衍 Digital Space —— 拥有二次元灵魂、现代高级视觉与细腻动效的个人数字空间。
不是技术博客，不是二次元博客，不是模板。

硬性约束
UI 全中文；英文只做小型装饰标签（NOW / WORLD / LATEST 等）
冷白世界：#F7F8FC / #FAF4F8 / #F3EEF8；文字 #1D1D22 / #777780
粉紫只是「光」不是主题色：仅限环境光层，禁止进入按钮、链接、标签、大面积色块
光轴硬约束：全站唯一光源 = 星芒装置（右上偏后）；高光在元素右上，投影一律落向左下；发光（emission）不受向量规则约束，但环/晕必须中性色或极低透明度环境光
禁止：模板博客、SaaS 感、卡片堆、Tailwind 默认组件感、高饱和二次元、贴纸装饰、粒子、炫技动画、过度玻璃、厚重阴影、暖粉、硬边色块
第一阶段不加入任何女朋友/情侣元素（「我们」模块后期独立加入，信息架构留槽位但不渲染）
内容与 UI 分离：Astro Content Collections 同构条目 schema（Phase 4 落地，公共字段先冻结）
技术栈：Astro + TypeScript + Tailwind + Anime.js（View Transitions 管页面转场，Anime.js 管页内编排）；不整体 React 化
动效原则：用户感觉网站是活的，而不是在表演动画
设计方法论（已确立）
1.空间先于页面，三条物理规则：恒定光轴 / 隐性地平线（元素要「落」在空间里）/ 三层景深（远环境光、中内容、近悬浮物件与空镜），视差只在层间有微小速度差
2.内容默认无容器，只有「物件」才有容器；玻璃每屏最多 2–3 处
3.分区靠「光温」区分（技术区偏冷紫、生活区偏暖白），不靠卡片；光温靠「冷纱 / 无纱」表达，不靠拉开近似色相
4.全站唯一装饰母题 = 星芒装置；替代手段只有留白、光晕、发丝线
5.验收标准：用户是否感觉「进入了一个地方」
二次元方向
三载体：空气与光（日系背景美术语法，禁粒子）/ 空镜（无人场景物件切片）/ 演出与语气（入场编排、半拍停顿、有性格的中文文案）
「居住证明是痕迹」：在读/在玩/在看、此刻状态、最近动态 = 有人住的证据；痕迹时间戳必须可信
IP 路线 = 空镜/空间美术 IP
角色路线（已拍板）
角色 = 纯文字/痕迹路线（§9 收口：不定义「原创/二创」，角色位永远纯文字/痕迹、不引入任何角色图、无图槽位预留）
造型：水彩高调、留白、无厚阴影；发饰与星芒装置同源（六芒切面发光叶片）
配色纪律：饰品绿压至低饱和偏灰；受光色统一为粉紫环境光；暖调仅限生活区光温
交付物：1 张完整出场立绘 + 3–5 张空镜痕迹切片（速写本、书包、翻飞的页、未完成的草稿）
使用规则：完整立绘全站唯一位置 = 关于页门牌位；其余位置只用痕迹切片或纯文字语气；角色不进导航、不做常驻悬浮、不重复出现
主次：视觉主载体 = 空间与空镜（角色是空镜里的主角）；表现主载体 = 演出与语气
动效规范（全站硬性）
每页入场编排三拍，禁止退化为 fadeIn：光先亮（环境光/辉光升档、色温先冷后归位）→ 内容落下（y 16–24px + 透明度，stagger 60–90ms，末尾极轻 settle）→ 导航与右缘读数最后稳定（必须是全序列最后一件事）
工具分工：Anime.js 管页内编排，挂 astro:page-load；View Transitions 只管页面间转场，两者不抢同一段动画
环境光层动画只用 transform / opacity；prefers-reduced-motion 降级为静止终态
工程现状（关键落点）
src/lib/motion.ts：enterSpace（三拍编排）、revealGroups（成组 stagger + settle）
src/styles/global.css：光轴变量（--light-axis / --shadow-x: -14px / --shadow-y: 30px）、接触阴影 token、.cool-veil 冷色纱、玻璃反光 inset -1px 1px（高光右上）
src/layouts/Base.astro：环境光层（含冷纱，第 1 拍色温先冷后归位）
src/components/sections/WorldSection.astro：02 横向光温地带（本轮重做）
src/data/content.ts：WorldItem.latest { title, date }，字段名已冻结
Hero.astro 已挂 data-readout（右缘读数）/ data-settle 标记 —— 属入场时序机制（已在用），不算 P1-5 遗留物，维持现状不清理不扩展（裁决 §13）
docs/schema-contract.md：公共字段契约已冻结（latest.title / latest.date 等），Phase 4 迁移字段名一一对应
Content Collections 未引入（Phase 4）
开发服务：astro dev --port 4321 --host；预览 http://172.18.0.1:4321/（localhost 可能被 sing-box TUN 拦截）；vite 报 504 Outdated Optimize Dep 时删 node_modules/.vite 重启
当前进度
开发由 AI「Hermes」执行；MiMo 担任产品设计 + UI/UX + 架构评审
Phase 1 设计系统 ✅；Phase 2 首页高保真 ✅
首页 P0 修复：P0-1 星芒即光源 ✅；P0-2 光温地带 ✅；P0-3 母题收敛 ✅（R1 眉标正圆已清理）
返工 R1–R5 已复审通过（hover 回归修复认定为「恢复既定基准」）；Phase 3 已放行，第一批 = 文章页 + P1-4 滚动辉光过渡
首页结构：Hero（江衍 + 星芒装置 + 01/02/03 发丝线入口）→ 01 现在·进行时 → 02 我的世界（横向光温地带）→ 03 最近更新（含「最近记录」侧栏）→ 页脚
P1-4 并入 Phase 3 第一批；P1-5 / P1-6 已作废（定义缺失，裁决 §13）
返工项 R1–R5（已复审通过 ✅）
R1 眉标正圆 ✅：正圆来源 = ghost-num 描边数字的 0，已整删（样式 + 三处引用）；眉标改「编号 / 英文标签 + 发丝线」（与 Hero 01/02/03 语法一致）；三类搜索清零后余项归类：border-radius: 50% 余 3 处功能指示器（live ring ×2、空间在线点 ×1）、SVG circle 余 2 处星芒发光体（豁免）、轨道描边余 1 处 :focus-visible a11y 焦点描边；导航激活圆点已改 8×1px 发丝线短横
R2 地带羽化 ✅：mask transparent → 18% / 82% → transparent，无硬边（200% 原图自证）；带体 alpha 0.7 = rgba(253,253,255,0.7)；光温改冷纱 / 无纱（冷纱 rgba(232,230,246,0.5)，交界 600px、移动 200px）；移动端左右羽化；hover 冷纱退场 + 暖纱 rgba(250,244,248,0.55) 升起，700ms
R3 采样读数 ✅：hover 前 左 8% #F3F2FA（冷紫）/ 右 8% #FCFBFE（暖白），方向正确未反；hover 第 2 场所中远离处（左端）暖化至 #FAF7FA（+7R/+5G）——整片光温变化挂在光层上
R4 入场顺序 ✅（裁决选 A，光不动）：导航锁死 1250ms 起 / 500ms、右缘读数 1350ms 起 / 450ms，晚于冷纱消散 1200ms；其余时序基准不变（内容 350ms 起、stagger 75ms、settle 2px）
R5 附带 ✅：live ring 改中性 #777780，外溢柔光 rgba(232,230,246,0.16)（≤0.16 合规）；schema 契约落地 docs/schema-contract.md；WorldItem.latest 日期现状已是 8–9 月档（9-12 / 8-28 / 9-18 / 9-20）与 feedItems 一致，未见 2026-03
复审材料（2026-09-26 提交）：A/B/E 截图按验收问题拍齐；R3 采样复测 hover 前 左8% #F2F1FA（冷紫）/ 右8% #FCFBFE（暖白）、hover 中远离处（左端10%）#F9F6FA，暖化 +7R/+5G 与登记一致、方向未反；同日修复实现回归——入场动画 inline 终态（opacity/transform）压制 CSS hover 退让/上浮（0.75 / −3px 不生效），修复 = motion.ts 三处动画 .then() 打 is-settled 标记并清 inline，global.css 进场门控改 :not(.is-settled)，基准值未动
Phase 3 第一批交付（2026-09-26）：文章页（书房）= 眉标「01 / NOTES + 发丝线」+ 发丝线列表（条目错落 24px/移动 10px 交替缩进、hover −3px + 0.75 + 700ms、接触阴影沿用冻结值）、页面级冷纱 rgba(232,230,246,0.4) 上下羽化 12%/88%（对角采样 #F3F3FA / #F1EDF7），数据与首页 feedItems 同源同值；P1-4 滚动辉光 = GlowTransition 组件（冷/暖晕 rgba(232,230,246,0.16)/rgba(250,244,248,0.16) 峰值 0.16 合规，滚动驱动 opacity=1−t/t，冷端 cool=0.91/warm=0.09 → 暖端 cool=0/warm=1，reduced-motion 恒静止 0.5/0.5），零布局高度不挪间距；S3 入场后 hover 实测 0.75 / −3px 生效（is-settled 机制，§6 要求的证据）
Phase 3 第二批交付（2026-09-26，第一批同日复审通过）：项目页（桌面）= 物件容器 rgba(253,253,255,0.72) + 发丝边界 + 接触阴影、错落 24px 交替缩进、宽度 44%/40%（差 10%）、技术栈发丝线小字禁 chip、链接发丝线入口（细线 40%→100% 生长）、冷纱 0.4 沿用（对角 #F2F1FA / #F3EEF7）、projectItems 与 feedItems kind='项目' 运行时同源；生活页（空镜与痕迹）= 暖白无纱层 rgba(253,253,255,0.7)（02 暖侧同语言，对角 #FCFCFE / #FDFBFD 明显区别冷紫）、4 个空镜占位（浅块 rgba(255,255,255,0.38) + 文案 + 时间戳，槽位 /assets/oc/traces/ + TODO）、此刻状态、在读/在玩/在听（mediaNotes 同源）、最近动态（feedItems 生活向同源）；schema 契约追加 ProjectItem 冻结字段；feedItems 重排倒序并新增 2 条生活向（与 worldItems latest 同名同值）落实单一 FeedItem 源裁决；P3/L3 入场后 hover 实测 0.75 / −3px 生效
Phase 3 第三批交付（2026-09-26，第二批同日复审通过）：学习页 learning.astro（在读/在学的桌面）= 在读书物件（MediaNote 在读项同源，容器同项目物件语法）+ 网安/外语/业余开发三方向发丝线列表（FeedItem 同源、交替缩进 24px/10px、禁卡片网格/进度条）、冷纱 0.4（对角 #F2F1FA / #F3EEF7）、T3 hover 实测 0.75/−3px；关于页 about.astro（门牌与自我陈述）= 门牌位（立绘占位块 rgba(255,255,255,0.38) 3:4 + 名字 + 门牌句，槽位 /assets/oc/ TODO 禁写死文件名、完整立绘全站唯一位置）+ 第一人称自我陈述（草稿待江衍终审）、暖白无纱 0.7（对角 #FCFCFE / #FDFBFD）、门牌位挂 data-enter 为第 2 拍 stagger 末位（DOM 顺序末位 = 理论 575ms，导航 1250/读数 1350 仍全序列最后）、A3 hover 实测 −3px；content.ts 新增外语学习向 FeedItem（'记录' 2026-09-10 /learning）FeedItem 6→7 条倒序（待确认）；收尾附加项 = 入场序列 contact sheet 关键帧表（6 帧：光亮→内容→导航稳定→终态，导航晚于内容 ✓；webm 录屏因自带 ffmpeg 编码器不足两次失败，以关键帧表替代）+ E×6 页滚全长图 + docs 推进 v6
已裁决问题（勿重开）
1.live 节点发光环不违例：emission 不套光轴向量；环用中性色，外溢柔光可带环境光色温（≤0.16）；彩色发光环 = 粉紫进标签 = 违例
2.latest 字段冻结为 latest.title / latest.date，Phase 4 迁移沿用
3.移动端光温感知弱：不拉色值，用冷纱/无纱 + 渐变收窄 200px；移动端主信号是错落节奏
4.微调基准值（后续沿用）：错落 24px（移动 10px）、场所宽度差 ≤15%、hover −3px + 0.75 + 700ms、渐变交界 600px、接触阴影 -3px 8px 16px -10px @0.1（hover -5px 12px 22px @0.16）
5.示例数据日期必须与「最近更新」时间线一致（当前档位 8–9 月）
6.02 地带与 03 之间空档由 P1-4 滚动辉光过渡，不挪间距解决
7.入场时序基准（R4 裁决选 A）：导航锁死 1250ms 起 / 500ms、右缘读数 1350ms 起 / 450ms；冷纱消散保持 1200ms；导航稳定必须是全序列最后一件事
Phase 3 计划（已开工；第一批 = 文章页 + P1-4，顺序不变：文章 → 项目 → 生活 → 学习 → 关于）
顺序：文章 → 项目 → 生活 → 学习 → 关于
各页空间身份：文章 = 书房（列表用发丝线延续 Hero 语法）；项目 = 做过的东西摊在桌面；生活 = 空镜与痕迹（角色只以痕迹切片出现，预留 3–5 个空镜位）；学习 = 在读/在学的桌面；关于 = 门牌与自我陈述（角色完整出场唯一位置，配合入场编排）
每页收尾必须过入场编排三拍
协作规范（长期有效）
1.交付格式：改动文件清单（文件 + 一句话改动）/ 编号截图（按验收问题命名）/ 主观微调实数值 / 未动清单 / 疑问挂起
2.三条纪律：不越界改其他区块；微调值必须标实数；有疑问不自行改方向，写在交付末尾等裁决
3.复审方式：截图点按「验收问题」设计（A = 是不是地带、B = 光温是不是整片、E = 母题是不是只剩一个），不逐像素比对
待决问题
1.角色 OC 美术产出 —— 已收口（§9）：不定义「原创/二创」，纯文字路线走到底——角色位永远以纯文字/痕迹呈现，不引入任何角色图；/assets/oc/ 槽位与 TODO 全部移除（命名空间已清，src 与 dist 零残留 2026-09-26 验证）；门牌位最终形态 = 纯文字（自述 + 资料行模糊写法）
2.「空间在线」状态点（border-radius: 50%）算功能指示器还是装饰圆 —— 暂按 live ring 同规则保留；若判违例改方形小点
3.「latest 日期 2026-03」与代码实际不符（代码为 8–9 月档）—— 待确认所指版本
4.:focus-visible 可访问性焦点描边保留（矩形 outline，非装饰圆）—— 待确认认可