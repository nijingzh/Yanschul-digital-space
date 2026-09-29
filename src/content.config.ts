/**
 * Astro Content Collections（Phase 4 · 任务单 v16 §2）
 *
 * 字段名与 docs/schema-contract.md 冻结契约一一对应，禁止改名。
 * 新增字段（标签/分类能力）已冻结登记：FeedItem.tags / FeedItem.category、
 * ProjectItem.tags / ProjectItem.category（见契约「Phase 4 追加冻结」）。
 * 手序保真：各 collection 以文件名序号（01-/02-/…）为渲染顺序（getCollection 按 id 排序）。
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * 日期字段口径 = YYYY-MM-DD 字符串（契约冻结）。
 * YAML 会把 2026-08-15 自动解析为 Date，这里归一回字符串（UTC 取值防时区偏移）。
 */
const dateStr = z.union([z.string(), z.date()]).transform((v) =>
  v instanceof Date
    ? `${v.getUTCFullYear()}-${String(v.getUTCMonth() + 1).padStart(2, '0')}-${String(v.getUTCDate()).padStart(2, '0')}`
    : v
);

/** 最近更新 / 文章页条目（kind='项目' 条目由 project collection 首条注入，保持同源） */
const feed = defineCollection({
  loader: glob({ pattern: '**/*.md', base: new URL('./content/feed', import.meta.url) }),
  schema: z.object({
    kind: z.enum(['文章', '项目', '记录']),
    title: z.string(),
    desc: z.string(),
    date: dateStr,
    href: z.string(),
    tags: z.array(z.string()).default([]),
    category: z.string(),
  }),
});

/** 项目物件（冻结字段 title/desc/date/href/stack/links；文件名序号 = 桌面手序） */
const project = defineCollection({
  loader: glob({ pattern: '**/*.md', base: new URL('./content/project', import.meta.url) }),
  schema: z.object({
    title: z.string(),
    desc: z.string(),
    date: dateStr,
    href: z.string(),
    stack: z.array(z.string()),
    links: z.array(z.object({ label: z.string(), href: z.string() })),
    tags: z.array(z.string()).default([]),
    category: z.string(),
  }),
});

/** 我的世界场所（冻结字段 label/desc/href/latest.title/latest.date） */
const world = defineCollection({
  loader: glob({ pattern: '**/*.md', base: new URL('./content/world', import.meta.url) }),
  schema: z.object({
    label: z.string(),
    desc: z.string(),
    href: z.string(),
    latest: z.object({ title: z.string(), date: dateStr }),
  }),
});

/** 最近记录（MediaNote.kind/title/meta） */
const media = defineCollection({
  loader: glob({ pattern: '**/*.md', base: new URL('./content/media', import.meta.url) }),
  schema: z.object({
    kind: z.string(),
    title: z.string(),
    meta: z.string(),
  }),
});

/** 现在进行时（NowItem.period/status/title/desc/live） */
const now = defineCollection({
  loader: glob({ pattern: '**/*.md', base: new URL('./content/now', import.meta.url) }),
  schema: z.object({
    period: z.string(),
    status: z.string(),
    title: z.string(),
    desc: z.string(),
    live: z.boolean().optional(),
  }),
});

export const collections = { feed, project, world, media, now };
