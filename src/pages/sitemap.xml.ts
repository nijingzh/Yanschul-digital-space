// /sitemap.xml —— 零依赖手写端点（静态页 + feed 文章 + 项目详情）。
// 站点根地址来自 astro.config.mjs 的 site，构建/预览环境自动跟随。
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const STATIC_PATHS = ['/', '/about', '/articles', '/projects', '/learning', '/life', '/archive', '/tags', '/ui'];

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] ?? c);

export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL('https://nijingzh.top')).toString().replace(/\/$/, '');
  const [feed, projects] = await Promise.all([getCollection('feed'), getCollection('project')]);

  const rows: Array<{ loc: string; lastmod?: string }> = [
    ...STATIC_PATHS.map((path) => ({ loc: `${base}${path === '/' ? '/' : path}` })),
    ...feed.map((entry) => ({
      loc: `${base}/posts/${entry.id.replace(/^\d+-/, '')}`,
      lastmod: entry.data.date,
    })),
    ...projects.map((entry) => ({
      loc: `${base}/projects/${entry.id.replace(/^\d+-/, '')}`,
      lastmod: entry.data.date,
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows
  .map(
    (row) =>
      `  <url><loc>${escapeXml(row.loc)}</loc>${row.lastmod ? `<lastmod>${row.lastmod}</lastmod>` : ''}</url>`
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
