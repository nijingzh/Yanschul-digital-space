/**
 * 访客点赞计数（零依赖 Node，文件持久化）
 * 部署：node server.js（127.0.0.1:3001，nginx 反代 /api/like → 这里）
 * 数据：like.json（同目录，自动创建）
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || '3001', 10);
const DATA = process.env.DATA_FILE || path.join(__dirname, 'like.json');

const read = () => {
  try {
    return JSON.parse(fs.readFileSync(DATA, 'utf8')).count || 0;
  } catch (e) {
    return 0;
  }
};

const write = (n) => {
  fs.writeFileSync(DATA, JSON.stringify({ count: n }));
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/api/like' && req.method === 'GET') {
    res.end(JSON.stringify({ count: read() }));
    return;
  }

  if (req.url === '/api/like' && req.method === 'POST') {
    const n = read() + 1;
    write(n);
    res.end(JSON.stringify({ count: n }));
    return;
  }

  if (req.url === '/healthz') {
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('like-server listening on 127.0.0.1:' + PORT);
});
