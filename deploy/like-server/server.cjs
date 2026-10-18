/**
 * 访客点赞计数（零依赖 Node，文件持久化）
 *
 * 部署：node server.cjs（默认 127.0.0.1:3001，nginx 反代 /api/like → 这里）
 * 数据：like.json（同目录，可用 DATA_FILE 覆盖）
 * 防刷：同一 IP 默认 2s 冷却（LIKE_COOLDOWN_MS 可调），冷却期内的 POST 只回当前数不加一。
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '127.0.0.1';
const DATA = process.env.DATA_FILE || path.join(__dirname, 'like.json');
const COOLDOWN_MS = Math.max(0, parseInt(process.env.LIKE_COOLDOWN_MS || '2000', 10) || 0);

/** 崩在写一半也不会留下坏文件：先写临时文件再原子替换。 */
const read = () => {
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA, 'utf8'));
    return Number.isFinite(parsed.count) ? parsed.count : 0;
  } catch {
    return 0;
  }
};

const write = (n) => {
  const tmp = `${DATA}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify({ count: n }));
  fs.renameSync(tmp, DATA);
};

/** 最近一次点赞时间（进程内，够用；重启清零不影响业务）。 */
const lastLikeByIp = new Map();

const clientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) return forwarded.split(',')[0].trim();
  const real = req.headers['x-real-ip'];
  if (typeof real === 'string' && real.trim()) return real;
  return req.socket.remoteAddress || 'unknown';
};

const json = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(JSON.stringify(body));
};

const server = http.createServer((req, res) => {
  if (req.url === '/healthz') {
    json(res, 200, { ok: true });
    return;
  }

  if (req.url !== '/api/like') {
    json(res, 404, { error: 'not found' });
    return;
  }

  if (req.method === 'GET') {
    json(res, 200, { count: read() });
    return;
  }

  if (req.method === 'POST') {
    const now = Date.now();
    const ip = clientIp(req);
    const previous = lastLikeByIp.get(ip) || 0;
    if (COOLDOWN_MS > 0 && now - previous < COOLDOWN_MS) {
      json(res, 200, { count: read(), counted: false });
      return;
    }
    lastLikeByIp.set(ip, now);
    const next = read() + 1;
    write(next);
    json(res, 200, { count: next, counted: true });
    return;
  }

  res.setHeader('Allow', 'GET, POST');
  json(res, 405, { error: 'method not allowed' });
});

// 定期清掉过期 IP，避免 Map 无限增长
setInterval(() => {
  const cutoff = Date.now() - Math.max(COOLDOWN_MS, 60_000);
  for (const [ip, ts] of lastLikeByIp) if (ts < cutoff) lastLikeByIp.delete(ip);
}, 60_000).unref();

server.listen(PORT, HOST, () => {
  console.log(`like-server listening on ${HOST}:${PORT} (cooldown ${COOLDOWN_MS}ms)`);
});
