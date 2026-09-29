/**
 * 江衍 · Digital Space — Motion System（Anime.js v4）
 *
 * 动效原则：让空间感觉活着，而不是让动画被注意到。
 * 全部动效尊重 prefers-reduced-motion。
 */
import { animate, createTimeline, stagger } from 'animejs';

type El = HTMLElement;

const rand = (min: number, max: number): number => min + Math.random() * (max - min);
const clamp = (min: number, max: number, value: number): number =>
  Math.min(max, Math.max(min, value));

const canAnimate = (): boolean =>
  typeof window !== 'undefined' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  // 纪念日灰色模式：JS 入场动效走静止终态（裁决 §4A.5「×3 或静止终态」）
  !document.body.classList.contains('memorial-day');

const isFinePointer = (): boolean =>
  typeof window !== 'undefined' && !window.matchMedia('(pointer: coarse)').matches;

const nodes = (selector: string, root: ParentNode = document): El[] =>
  Array.from(root.querySelectorAll<El>(selector));

const first = (selector: string, root: ParentNode = document): El | null =>
  root.querySelector<El>(selector);

/** 入场动画终态：打完成标记并清 inline，交还 CSS（hover 等交互规则才接管得了） */
const releaseInline = (els: El[]): void => {
  for (const el of els) {
    el.classList.add('is-settled');
    el.style.removeProperty('opacity');
    el.style.removeProperty('transform');
  }
};

/** 页面进入：空间展开 —— 环境光亮起 → 导航 → 内容上浮 → 角色落座 */
export function enterSpace(): void {
  if (!canAnimate()) return;

  const tl = createTimeline({ defaults: { ease: 'out(3)' } });

  // 第 1 拍（0–600ms）：光先亮 —— 环境光与星芒辉光从暗一档升到正常，色温先冷后归位
  tl.add('.ambient-blob', {
    opacity: [0, 1],
    scale: [0.9, 1],
    duration: 900,
    delay: stagger(90),
  }, 0)
    .add('.cool-veil', { opacity: [0.5, 0], duration: 1200, ease: 'out(2)' }, 0)
    .add('[data-enter-char]', {
      opacity: [0, 1],
      scale: [0.96, 1],
      duration: 800,
      ease: 'out(2)',
    }, 120)

    // 第 2 拍（延迟半拍起）：内容落下，末尾极轻 settle
    .add('[data-enter]', {
      opacity: [0, 1],
      y: [22, 0],
      duration: 850,
      delay: stagger(75),
    }, 350)
    .add('[data-settle]', { y: [2, 0], duration: 300, ease: 'out(2)' }, 820)

    // 第 3 拍（最后）：导航与右缘读数从微位移锁死到位 —— 必须晚于冷纱消散（1200ms）
    .add('.site-header', { opacity: [0, 1], y: [-12, 0], duration: 500 }, 1250)
    .add('[data-readout]', { opacity: [0, 1], x: [10, 0], duration: 450 }, 1350)
    .then(() => releaseInline(nodes('[data-enter], [data-settle], [data-enter-char], .site-header, .ambient-blob')));
}

/** 滚动入场（成组）：stagger 依次落下，末尾极轻 settle —— 接入全站入场编排 */
export function revealGroups(): void {
  const groups = nodes('[data-reveal-group]');
  if (!groups.length) return;

  if (!canAnimate()) {
    groups.forEach((group) => {
      nodes('[data-reveal-item]', group).forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    });
    return;
  }

  for (const group of groups) {
    const items = nodes('[data-reveal-item]', group);
    if (!items.length) continue;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.disconnect();
        const tl = createTimeline({ defaults: { ease: 'out(3)' } });
        tl.add(items, {
          opacity: [0, 1],
          y: [20, 0],
          duration: 850,
          delay: stagger(75),
        }, 0).add(group, { y: [2, 0], duration: 300, ease: 'out(2)' }, 520)
          .then(() => releaseInline([...items, group as El]));
        break;
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });

    observer.observe(group);
  }
}

/** 滚动渐进出现：柔和、一次性 */
export function revealOnScroll(): void {
  const targets = nodes('[data-reveal]');
  if (!targets.length) return;

  if (!canAnimate()) {
    targets.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        animate(entry.target as El, {
          opacity: [0, 1],
          y: [22, 0],
          duration: 950,
          ease: 'out(3)',
        }).then(() => releaseInline([entry.target as El]));
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
  );

  targets.forEach((el) => observer.observe(el));
}

/* VT 页面生命周期（v17 修）：每次 initSpace 卸上页全局 listener 再重绑。
   根因：View Transitions 导航后 initSpace 重跑、document/window listener 叠加
   （一次 hover 生成 N 枚星芒）。AbortSignal 统一管理全局监听。 */
let pageAbort: AbortController | null = null;
let pageSignal: AbortSignal | undefined;

/** 指针视差：不同深度的元素轻微错位（仅精确指针设备） */
export function spaceParallax(root: ParentNode = document): void {
  if (!canAnimate() || !isFinePointer()) return;
  const layers = nodes('[data-depth]', root);
  if (!layers.length) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  const tick = (): void => {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;
    for (const layer of layers) {
      const depth = Number(layer.dataset.depth ?? 0);
      layer.style.transform = `translate3d(${currentX * depth}px, ${currentY * depth}px, 0)`;
    }
    requestAnimationFrame(tick);
  };

  window.addEventListener(
    'pointermove',
    (event) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetY = (event.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true, signal: pageSignal },
  );

  requestAnimationFrame(tick);
}

/** 滚动时环境光缓慢漂移：空间感 */
export function ambientScroll(): void {
  if (!canAnimate()) return;
  const blobs = nodes('.ambient-blob');
  let frame = 0;

  const update = (): void => {
    frame = 0;
    const offset = window.scrollY * 0.035;
    blobs.forEach((blob, index) => {
      blob.style.translate = `0 ${offset * (index % 2 === 0 ? 1 : -1)}px`;
    });
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!frame) frame = requestAnimationFrame(update);
    },
    { passive: true, signal: pageSignal },
  );
}

/** P1-4 滚动辉光过渡：02–03 空档的环境光层冷→暖缓变（只动 opacity；入场静止终态，滚动才接管） */
export function scrollGlow(): void {
  const gap = first('[data-glow]');
  const cool = gap ? first('.glow-cool', gap) : null;
  const warm = gap ? first('.glow-warm', gap) : null;
  if (!gap || !cool || !warm || !canAnimate()) return;

  let frame = 0;
  const update = (): void => {
    frame = 0;
    const rect = gap.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    // 滚动进度 0→1：辉光从冷侧过渡到暖侧（线性，峰值吃满晕的 0.16 上限）
    const t = clamp(0, 1, (vh - rect.top) / vh);
    cool.style.opacity = String(1 - t);
    warm.style.opacity = String(t);
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!frame) frame = requestAnimationFrame(update);
    },
    { passive: true, signal: pageSignal },
  );
}

/** 角色的「生活感」：呼吸、星光浮动、眨眼、被靠近时细微反应 */
export function residentLife(root: ParentNode = document): void {
  const resident = first('[data-resident]', root);
  if (!resident || !canAnimate()) return;

  const body = first('.char-body', resident);
  if (body) {
    animate(body, {
      scaleY: [1, 1.014],
      duration: 3400,
      loop: true,
      alternate: true,
      ease: 'inOut(1)',
    });
  }

  const spark = first('.char-spark', resident);
  if (spark) {
    animate(spark, {
      y: [-3, 3],
      rotate: [0, 10],
      duration: 2800,
      loop: true,
      alternate: true,
      ease: 'inOut(2)',
    });
  }

  // 眨眼：两段式 keyframes，间隔随机
  nodes('.char-eye', resident).forEach((eye) => {
    animate(eye, {
      keyframes: [{ scaleY: 0.08, duration: 90 }, { scaleY: 1, duration: 200 }],
      loop: true,
      delay: () => rand(2600, 6200),
    });
  });

  // 鼠标靠近时的细微反应：头轻轻偏向来者
  const head = first('.char-head', resident);
  if (head && isFinePointer()) {
    window.addEventListener(
      'pointermove',
      (event: PointerEvent) => {
        const box = resident.getBoundingClientRect();
        const dx = (event.clientX - (box.left + box.width / 2)) / window.innerWidth;
        const dy = (event.clientY - (box.top + box.height / 2)) / window.innerHeight;
        const near = Math.abs(dx) < 0.34 && Math.abs(dy) < 0.45;
        animate(head, {
          rotate: near ? clamp(-5, 5, dx * 26) : 0,
          translateY: near ? clamp(-3, 3, dy * 16) : 0,
          duration: 650,
          ease: 'out(3)',
        });
      },
      { passive: true, signal: pageSignal },
    );
  }
}

/** Hover：内容轻微浮起（配合 CSS 高光扫描使用） */
export function hoverFloat(node: El): void {
  if (!canAnimate()) return;
  node.addEventListener('pointerenter', () => {
    animate(node, { y: -4, duration: 500, ease: 'out(3)' });
  });
  node.addEventListener('pointerleave', () => {
    animate(node, { y: 0, duration: 700, ease: 'out(3)' });
  });
}

/* Hero 远景线稿层（任务单 v8）：入场第 1 拍仅透明度渐入；滚动视差下沉（层间微速差 0.12）+
   滚过 Hero 淡出（01/02/03 恢复纯净留白）。只用 transform/opacity；reduce/灰态 = 静止终态。 */
export function heroShadow(): void {
  const wrap = document.querySelector<HTMLElement>('[data-hero-shadow]');
  const img = wrap?.querySelector<HTMLElement>('img');
  if (!wrap || !img) return;

  if (!canAnimate()) {
    img.style.opacity = '1';
    return;
  }

  // 第 1 拍「光先亮」：0/900 透明度渐入（与光晕同拍；不参与第 2/3 拍）
  animate(img, { opacity: [0, 1], duration: 900, ease: 'out(3)' });

  const hero = document.querySelector<HTMLElement>('.hero');
  const tick = (): void => {
    const y = window.scrollY;
    const h = hero?.offsetHeight || 1;
    const p = Math.min(Math.max(y / h, 0), 1);
    wrap.style.transform = `translateY(${(y * 0.12).toFixed(1)}px)`;
    wrap.style.opacity = (0.13 * (1 - p)).toFixed(3);
  };
  window.addEventListener('scroll', tick, { passive: true, signal: pageSignal });
  tick();
}

/* ── Phase 5 互动装置（任务单 v16 §3.2/3.3）：纯文字/痕迹语气，克制。 ── */

/** 星芒光标视差（视差/高光合体：≤±6px、lerp 0.06；只 transform；触屏与 reduce 禁用） */
export function sparkParallax(): void {
  if (!canAnimate() || window.matchMedia('(pointer: coarse)').matches) return;
  const spark = document.querySelector<HTMLElement>('.stage-spark');
  if (!spark) return;
  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;
  window.addEventListener(
    'pointermove',
    (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 12;
      ty = (e.clientY / window.innerHeight - 0.5) * 12;
    },
    { passive: true, signal: pageSignal },
  );
  const tick = (): void => {
    if (pageSignal?.aborted) return;
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;
    spark.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** 星芒彩蛋：连点星芒 3 次 → 一句文字浮出（纯文字语气；reduce 为瞬时显示） */
export function sparkEgg(): void {
  const spark = document.querySelector<HTMLElement>('.stage-spark');
  const whisper = document.querySelector<HTMLElement>('[data-spark-whisper]');
  if (!spark || !whisper) return;
  let taps = 0;
  let timer = 0;
  spark.addEventListener('click', () => {
    taps += 1;
    if (taps < 3) return;
    taps = 0;
    whisper.textContent = '……你还在啊。灯给你留着。';
    whisper.classList.add('is-visible');
    window.clearTimeout(timer);
    timer = window.setTimeout(() => whisper.classList.remove('is-visible'), 4600);
  }, { signal: pageSignal });
}

/** 深夜特殊状态（23:00–05:00）：一句话留灯（非当日零影响） */
export function nightNote(): void {
  const el = document.querySelector<HTMLElement>('[data-night-note]');
  if (!el) return;
  const hour = new Date().getHours();
  if (hour >= 23 || hour < 5) {
    el.textContent = '这么晚了。灯给你留着。';
    el.classList.add('is-visible');
  }
}

/** 回访 tick：切走再回来，右缘读数轻跳一下（「回来了」的活感；只 transform/opacity） */
export function readoutReturn(): void {
  if (!canAnimate()) return;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    const el = document.querySelector<HTMLElement>('[data-readout]');
    if (!el) return;
    animate(el, {
      y: [6, 0],
      opacity: [0.35, 1],
      duration: 380,
      ease: 'out(3)',
      onComplete: () => {
        el.style.removeProperty('opacity');
        el.style.removeProperty('transform');
      },
    });
  }, { signal: pageSignal });
}

/* ── 0/1 码脉（v17 · B）：hover 发丝线入口末尾闪一拍 0→1；点击链接推广闪码。 ── */

/** hover 星芒微光（v17 · 保持版）：链接末尾四芒星浮现后「驻留保持」——鼠标停住就一直在，
 *  不自动飘散；移开（mouseout）才淡出。每链同时只一颗；reduce 不显示。 */
export function codePulse(): void {
  if (!canAnimate()) return;
  const selector = '.u-link, .hero-entry, .work-link, .life-entry, .stage-entry';
  const NS = 'http://www.w3.org/2000/svg';
  const live = new Map<Element, SVGElement>();

  const spawn = (link: Element): void => {
    if (live.has(link)) return;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'spark-pulse');
    svg.setAttribute('viewBox', '0 0 18 18');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML =
      '<path d="M9 2.5 L10.1 7.9 15.5 9 10.1 10.1 9 15.5 7.9 10.1 2.5 9 7.9 7.9 Z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />';
    link.appendChild(svg);
    live.set(link, svg);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => svg.classList.add('is-lit')),
    );
  };

  const dismiss = (link: Element): void => {
    const svg = live.get(link);
    if (!svg) return;
    live.delete(link);
    svg.classList.remove('is-lit');
    svg.classList.add('is-out');
    window.setTimeout(() => svg.remove(), 340);
  };

  document.addEventListener(
    'mouseover',
    (e) => {
      const link = (e.target as Element | null)?.closest?.(selector);
      if (link) spawn(link);
    },
    { passive: true, signal: pageSignal },
  );
  document.addEventListener(
    'mouseout',
    (e) => {
      const link = (e.target as Element | null)?.closest?.(selector);
      if (!link) return;
      // 离开链接内部不触发（relatedTarget 仍在 link 内时保留）
      const to = e.relatedTarget as Element | null;
      if (to && link.contains(to)) return;
      dismiss(link);
    },
    { passive: true, signal: pageSignal },
  );
}

/** 点击闪码：全站链接点击复用转场 0/1 闪码（160ms；VT 转场时段由 VT 自带，不重复） */
export function codeFlashClick(): void {
  const flash = first('[data-transition-flash]');
  if (!flash || !canAnimate()) return;
  document.addEventListener('click', (e) => {
    const link = (e.target as Element | null)?.closest?.('a[href]');
    if (!link) return;
    flash.classList.remove('is-on');
    void flash.offsetWidth;
    flash.classList.add('is-on');
    window.setTimeout(() => flash.classList.remove('is-on'), 200);
  }, { signal: pageSignal });
}

/** 全站动效初始化（Base 布局调用一次） */
export function initSpace(): void {
  pageAbort?.abort();
  pageAbort = new AbortController();
  pageSignal = pageAbort.signal;
  enterSpace();
  heroShadow();
  revealOnScroll();
  revealGroups();
  ambientScroll();
  scrollGlow();
  residentLife();
  cursorGlow();
  magnetic();
  sparkParallax();
  sparkEgg();
  nightNote();
  readoutReturn();
  codePulse();
  codeFlashClick();
  const field = first('[data-parallax-field]');
  if (field) spaceParallax(field);
  nodes('[data-float]').forEach((el) => hoverFloat(el));
}

/** 数字 tick：文本变更时轻微滚动跳字（≤400ms） */
export function tickText(el: El, text: string): void {
  el.textContent = text;
  if (!canAnimate()) return;
  animate(el, { y: [7, 0], opacity: [0.35, 1], duration: 380, ease: 'out(3)' });
}

/** 转场 0/1 闪码：View Transitions 页面间半拍闪字（≤160ms 透明度脉冲） */
export function initTransitionFlash(): void {
  const flash = first('[data-transition-flash]');
  if (!flash) return;
  document.addEventListener('astro:before-preparation', () => {
    if (!canAnimate()) return;
    flash.classList.remove('is-on');
    void (flash as HTMLElement).offsetWidth;
    flash.classList.add('is-on');
    window.setTimeout(() => flash.classList.remove('is-on'), 220);
  }, { signal: pageSignal });
}

/**
 * 光标微辉光：指针移动时环境光层极轻偏移（≤12px、惯性缓动；移动端禁用）。
 * 只写 CSS 变量 --gx/--gy（.ambient 消费），不碰 .ambient-blob 的动画 transform。
 */
export function cursorGlow(): void {
  if (!canAnimate() || window.matchMedia('(pointer: coarse)').matches) return;
  const layer = first('.ambient');
  if (!layer) return;
  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;
  let raf = 0;
  const tick = (): void => {
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;
    layer.style.setProperty('--gx', `${cx.toFixed(2)}px`);
    layer.style.setProperty('--gy', `${cy.toFixed(2)}px`);
    raf =
      Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1
        ? window.requestAnimationFrame(tick)
        : 0;
  };
  window.addEventListener(
    'pointermove',
    (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 24;
      ty = (e.clientY / window.innerHeight - 0.5) * 24;
      if (!raf) raf = window.requestAnimationFrame(tick);
    },
    { passive: true },
  );
}

/**
 * 磁吸 hover：发丝线入口/物件轻微磁吸位移（≤3px）。
 * 只改 --mx/--my CSS 变量（.magnetic 消费），hover 的 --lift 与入场动画互不压制。
 */
export function magnetic(selector = '.magnetic'): void {
  if (!canAnimate() || window.matchMedia('(pointer: coarse)').matches) return;
  nodes(selector).forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const mx = clamp(-3, 3, ((e.clientX - r.left) / r.width - 0.5) * 6);
      const my = clamp(-3, 3, ((e.clientY - r.top) / r.height - 0.5) * 6);
      el.style.setProperty('--mx', `${mx.toFixed(2)}px`);
      el.style.setProperty('--my', `${my.toFixed(2)}px`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--mx', '0px');
      el.style.setProperty('--my', '0px');
    });
  });
}
