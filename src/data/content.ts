/**
 * 内容数据层（Phase 4：Astro Content Collections 查询层）
 *
 * 内容层与 UI 展示层分离 —— 数据存 src/content/**（Content Collections），
 * 本文件是唯一取数口：UI 组件从这里取（await getXxx()），不感知数据来源。
 * 契约：字段名与 docs/schema-contract.md 冻结契约一一对应，禁止改名。
 * 同源保证：feedItems 中 kind='项目' 的条目 = project collection 首条映射（改一处全同步）。
 */
import { getCollection } from 'astro:content';

export interface NavItem {
  href: string;
  label: string;
}

/**
 * 站点常量（裁决 §11）
 * 建站基准日期 = 2026-09-23，YYYY-MM-DD 与 schema 日期口径一致。
 * 建站计时「这间屋子住了 X 天 X 时」由此实时计算：X 天为自然日差，X 时按本地时区滚动。
 * 边界裁定：示例/痕迹数据中早于建站日的日期合法保留（「搬进来之前的日子」）。
 */
export const SITE_BIRTH = '2026-09-23';

/** 口号（设计语言 v2 定稿） */
export const SLOGAN = '0为过去，1即未来。';
export const SLOGAN_NOTE = '0 是留下的痕迹，1 是正在发生的事。';

/**
 * 纪念日灰色模式日期（MM-DD，运行时判断）
 * 清明按当年节气填具体日期 —— 每年年初更新（必做维护项）。
 */
export const MEMORIAL_DATES: string[] = [
  '09-18',
  '09-30',
  '12-13',
  '04-04', // 清明（2026 年 4 月 4 日；每年年初更新为当年节气日期）
];

/** 今日是否纪念日（本地时区 MM-DD） */
export function isMemorialDay(date: Date = new Date()): boolean {
  const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return MEMORIAL_DATES.includes(mmdd);
}

export interface NowItem {
  period: string;
  status: string;
  title: string;
  desc: string;
  live?: boolean;
}

export interface WorldItem {
  label: string;
  desc: string;
  href: string;
  /** 最新条目（冻结字段：latest.title / latest.date） */
  latest: {
    title: string;
    date: string;
  };
}

export interface FeedItem {
  kind: '文章' | '项目' | '记录';
  title: string;
  desc: string;
  date: string;
  href: string;
  /** 标签（Phase 4 追加冻结：标签能力） */
  tags: string[];
  /** 分类（Phase 4 追加冻结：分类能力；取值与「我的世界」场所同语义） */
  category: string;
  /** 阅读时长·分钟（v23.8 派生字段：正文字符数/400，项目注入条目=1） */
  minutes?: number;
}

export interface MediaNote {
  kind: string;
  title: string;
  meta: string;
}

/** 项目物件的外部链接（发丝线入口） */
export interface ProjectLink {
  label: string;
  href: string;
}

/** 项目物件（冻结字段 title/desc/date/href/stack/links；tags/category 为 Phase 4 追加冻结） */
export interface ProjectItem {
  /** 详情页 slug（v23.8 派生字段：文件名去序号） */
  slug?: string;
  title: string;
  desc: string;
  date: string;
  href: string;
  stack: string[];
  links: ProjectLink[];
  tags: string[];
  category: string;
}

/** 时间线条目（Phase 4 时间线能力：按 YYYY-MM 分组，组内倒序） */
export interface TimelineGroup {
  month: string;
  items: FeedItem[];
}

export const siteNav: NavItem[] = [
  { href: '/', label: '首页' },
  { href: '/articles', label: '文章' },
  { href: '/projects', label: '项目' },
  { href: '/learning', label: '学习' },
  { href: '/life', label: '生活' },
  { href: '/about', label: '关于' },
];

export const statusChips: string[] = [
  '网络安全 · 学习中',
  'Arch Linux · KDE Plasma',
  '本站 · 第一阶段建设中',
];

/** 项目物件（桌面手序 = content/project/ 文件名序号；与 feedItems kind='项目' 首条同源） */
export async function getProjectItems(): Promise<ProjectItem[]> {
  const entries = await getCollection('project');
  return entries.map((entry) => ({
    ...entry.data,
    slug: entry.id.replace(/^\d+-/, ''),
  }));
}

/** 最近更新 —— 单一 FeedItem 源（首页 = 最新 N 条，文章页 = 全量倒序） */
export async function getFeedItems(): Promise<FeedItem[]> {
  const [feedEntries, projects] = await Promise.all([
    getCollection('feed'),
    getProjectItems(),
  ]);
  const rows: FeedItem[] = feedEntries.map((entry) => ({
    ...entry.data,
    minutes: Math.max(1, Math.round(((entry.body || '').replace(/\s/g, '').length) / 400)),
  }));
  // kind='项目' 条目与 projectItems[0] 同源同值（运行时引用，改一处全同步）
  const source = projects[0];
  if (source) {
    rows.push({
      kind: '项目',
      title: source.title,
      desc: source.desc,
      date: source.date,
      href: source.href,
      tags: source.tags,
      category: source.category,
      minutes: 1,
    });
  }
  // 倒序（同日期保持源顺序：比较器等价返回 0 + 稳定排序；项目注入条目排其日期位）
  return rows.sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1));
}

/** 我的世界 —— 首页第三视觉区（手序 = content/world/ 文件名序号） */
export async function getWorldItems(): Promise<WorldItem[]> {
  const entries = await getCollection('world');
  return entries.map((entry) => ({ ...entry.data }));
}

/** 最近记录 —— 让空间「有人住」（手序 = content/media/ 文件名序号） */
export async function getMediaNotes(): Promise<MediaNote[]> {
  const entries = await getCollection('media');
  return entries.map((entry) => ({ ...entry.data }));
}

/** 现在进行时 —— 首页第二视觉区（手序 = content/now/ 文件名序号） */
export async function getNowItems(): Promise<NowItem[]> {
  const entries = await getCollection('now');
  return entries.map((entry) => ({ ...entry.data }));
}

/** 标签能力：按标签取 feed 条目（倒序） */
export async function getFeedByTag(tag: string): Promise<FeedItem[]> {
  const items = await getFeedItems();
  return items.filter((item) => item.tags.includes(tag));
}

/** 分类能力：按分类取 feed 条目（倒序） */
export async function getFeedByCategory(category: string): Promise<FeedItem[]> {
  const items = await getFeedItems();
  return items.filter((item) => item.category === category);
}

/** 时间线能力：按 YYYY-MM 分组（新→旧，组内倒序） */
export async function getTimeline(): Promise<TimelineGroup[]> {
  const items = await getFeedItems();
  const groups: TimelineGroup[] = [];
  for (const item of items) {
    const month = item.date.slice(0, 7);
    const group = groups.find((g) => g.month === month);
    if (group) {
      group.items.push(item);
    } else {
      groups.push({ month, items: [item] });
    }
  }
  return groups;
}
