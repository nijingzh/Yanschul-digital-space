// 视觉快照：用本地 Chrome 无头模式截 3 个视口 × 明暗两套 × 首页/文章页。
//
// 用法：
//   npm run preview -- --port 4322        # 先起生产预览
//   npm run visual                        # 输出到 visual/
//
// 也支持连已有的 Chrome（省得脚本自己拉进程）：
//   CDP_URL=http://127.0.0.1:9222 npm run visual
//
// 说明：只负责截图和收集控制台错误，不做像素 diff；把 visual/ 里的图提交前人工对照，
// 或以后接 pixelmatch 再升级成自动回归。
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=')[1] : fallback;
};

const BASE = arg('url', process.env.PREVIEW_URL || 'http://127.0.0.1:4322');
const OUT = path.resolve(arg('out', 'visual'));
const EXT_CDP = process.env.CDP_URL;
const CHROME =
  process.env.CHROME_PATH ||
  ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((p) =>
    fs.existsSync(p),
  );

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 900, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
];
const PAGES = [
  { name: 'home', path: '/' },
  { name: 'article', path: '/posts/ai-made-this-site' },
];
const THEMES = ['day', 'night'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      } else if (msg.method) this.events.push(msg);
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  errors() {
    return this.events
      .filter((e) => e.method === 'Runtime.exceptionThrown' || (e.method === 'Log.entryAdded' && e.params.entry.level === 'error'))
      .map((e) =>
        e.method === 'Log.entryAdded' ? e.params.entry.text : e.params.exceptionDetails?.exception?.description || 'exception',
      );
  }
}

async function waitForCdp(url, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(`${url}/json/version`);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await sleep(300);
  }
  throw new Error(`CDP not reachable at ${url}`);
}

async function pageTarget(endpoint) {
  const list = await (await fetch(`${endpoint}/json/list`)).json();
  const page = list.find((t) => t.type === 'page' && !t.url.startsWith('devtools://'));
  if (!page) throw new Error('no page target');
  return page.webSocketDebuggerUrl;
}

async function main() {
  if (!EXT_CDP && !CHROME) throw new Error('找不到 Chrome/Edge，设置 CHROME_PATH 或 CDP_URL');
  let child = null;
  let endpoint = EXT_CDP?.replace(/\/$/, '');

  if (!endpoint) {
    endpoint = 'http://127.0.0.1:9333';
    child = spawn(
      CHROME,
      [
        '--headless=new',
        '--no-sandbox',
        '--remote-debugging-port=9333',
        `--user-data-dir=${path.join(path.dirname(OUT), '.visual-chrome')}`,
        '--no-first-run',
        '--hide-scrollbars',
        'about:blank',
      ],
      { stdio: 'ignore' },
    );
    await waitForCdp(endpoint);
  }

  const ws = new WebSocket(await pageTarget(endpoint));
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  const cdp = new CDP(ws);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable');

  fs.mkdirSync(OUT, { recursive: true });
  const report = [];
  let failures = 0;

  for (const page of PAGES) {
    for (const vp of VIEWPORTS) {
      for (const theme of THEMES) {
        await cdp.send('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: vp.width < 500 ? 2 : 1,
          mobile: vp.width < 500,
        });
        // 先落地一次以写入主题，再刷新，保证首屏就是目标主题
        await cdp.send('Page.navigate', { url: BASE + page.path });
        await sleep(2200);
        await cdp.send('Runtime.evaluate', {
          expression: `localStorage.setItem('jy-theme', '${theme}')`,
        });
        cdp.events.length = 0;
        await cdp.send('Page.reload', { ignoreCache: false });
        await sleep(2600);
        const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
        const file = path.join(OUT, `${page.name}-${vp.name}-${theme}.png`);
        fs.writeFileSync(file, Buffer.from(data, 'base64'));
        const errors = cdp.errors();
        if (errors.length) failures += 1;
        report.push({ page: page.name, viewport: vp.name, theme, file: path.relative(process.cwd(), file), errors });
        console.log(`${page.name}/${vp.name}/${theme} -> ${file}${errors.length ? `  [${errors.length} console errors]` : ''}`);
      }
    }
  }

  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify({ base: BASE, generatedAt: new Date().toISOString(), report }, null, 2));
  ws.close();
  if (child) child.kill();
  if (failures) {
    console.error(`\n${failures} 组截图带控制台错误，见 ${path.join(OUT, 'index.json')}`);
    process.exitCode = 1;
  }
}

await main();
