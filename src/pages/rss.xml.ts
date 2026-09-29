// RSS —— v23 P3（手写端点，零依赖）
import type { APIRoute } from 'astro';
import { getFeedItems } from '../data/content';

export const GET: APIRoute = async ({ site }) => {
  const items = await getFeedItems();
  const base = site ? site.toString() : 'http://localhost:4321';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>江衍 · Digital Space</title>
    <link>${base}</link>
    <description>一个持续生长的数字空间——技术、学习、生活，以及一切正在发生的事。</description>
    <language>zh-CN</language>
    ${items
      .map(
        (it) => `<item>
      <title>${it.title}</title>
      <link>${base}${it.href}</link>
      <description>${it.desc}</description>
      <pubDate>${new Date(it.date).toUTCString()}</pubDate>
    </item>`
      )
      .join('\n    ')}
  </channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
