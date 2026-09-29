# Schema 契约（冻结于 P0 返工批次 R5）

Phase 4 迁移到 Astro Content Collections 时，以下公共字段**沿用字段名与语义**，不得改名：

| 字段 | 类型 | 语义 | 消费方 |
|---|---|---|---|
| `WorldItem.label` | `string` | 场所名（中文） | 首页「我的世界」 |
| `WorldItem.desc` | `string` | 场所一行描述 | 首页「我的世界」 |
| `WorldItem.href` | `string` | 场所入口链接 | 首页「我的世界」 |
| `WorldItem.latest.title` | `string` | 该场所最新条目名 | 首页「我的世界」第三行 |
| `WorldItem.latest.date` | `string` (`YYYY-MM-DD`) | 最新条目日期 | 首页「我的世界」第三行 |
| `FeedItem.kind` | `'文章' \| '项目' \| '记录'` | 条目类型 | 首页「最近更新」 |
| `ProjectItem.title` | `string` | 项目名 | 项目页物件 |
| `ProjectItem.desc` | `string` | 一行描述 | 项目页物件 |
| `ProjectItem.date` | `string` (`YYYY-MM-DD`) | 项目日期 | 项目页物件 |
| `ProjectItem.href` | `string` | 项目入口链接 | 项目页物件 |
| `ProjectItem.stack` | `string[]` | 技术栈（小号文字 + 发丝线分隔，禁 chip） | 项目页物件 |
| `ProjectItem.links` | `{ label: string; href: string }[]` | 外部链接（发丝线入口） | 项目页物件 |

| `FeedItem.title` / `desc` / `date` / `href` | `string` | 标题 / 摘要 / 日期 / 链接 | 首页「最近更新」 |
| `NowItem.period` / `status` / `title` / `desc` / `live` | 见 `src/data/content.ts` | 进行时条目 | 首页「现在进行时」 |
| `MediaNote.kind` / `title` / `meta` | `string` | 在读/在玩/在听 | 首页「最近更新」侧栏 |

> ProjectItem 冻结于 Phase 3 第二批（2026-09-26）。项目页物件与 `feedItems` 中
> `kind='项目'` 的条目同源同值；Phase 4 迁移时字段名一一对应。

迁移时：Content Collections 的 collection schema 字段名与上表一一对应；UI 组件取数处（`src/data/content.ts` 的导入点）替换为 `getCollection()` 查询即可，组件不感知数据来源。

## Phase 4 追加冻结（2026-09-26，任务单 v16 §2.3）

标签 / 分类 / 时间线能力所需新字段，先冻结后迁移，字段名如下（禁改名）：

| 字段 | 类型 | 语义 | 消费方 |
|---|---|---|---|
| `FeedItem.tags` | `string[]` | 标签（`getFeedByTag`） | 数据层 API（暂无渲染位） |
| `FeedItem.category` | `string` | 分类（`getFeedByCategory`；取值与「我的世界」场所同语义） | 数据层 API（暂无渲染位） |
| `ProjectItem.tags` | `string[]` | 项目标签 | 数据层 API（暂无渲染位） |
| `ProjectItem.category` | `string` | 项目分类 | 数据层 API（暂无渲染位） |

手序保真约定（非字段）：各 collection 渲染顺序 = `src/content/<name>/` 文件名序号（`getCollection` 按 id 排序），不引入 order 字段。

时间线能力 = `getTimeline()`（按 `YYYY-MM` 分组，字段复用 `date`，无新字段）。
