/**
 * Folia 集成配置（v30 · 2026-09-30）——地址单点可配，做好兼容：
 * 现在 http://124.223.162.190:81（VPS 81 端口），后续解析到 music.nijingzh.top 时
 * 只改 PUBLIC_FOLIA_BASE 重新构建，全站（演出 iframe / 歌单音源）一次切换。
 *
 * 环境变量（.env，勿提交仓库）：
 *   PUBLIC_FOLIA_BASE         Folia 基地址（默认当前 VPS 81 端口）
 *   PUBLIC_FOLIA_STAGE_PATH   全屏歌词演出的路由路径（默认 /player/stage——
 *                             按原 §12A.2 规格；Folia 实际路由不对时改这里即可）
 *   PUBLIC_FOLIA_PLAYLIST_ID  歌单 ID（由江衍在网易云维护；留空 = MiniPlayer 走占位态）
 */

const env = import.meta.env as Record<string, string | undefined>;

const trimTrailing = (s: string): string => s.replace(/\/+$/, '');

export const FOLIA_BASE: string = trimTrailing(
  env.PUBLIC_FOLIA_BASE || 'http://124.223.162.190:81'
);

export const FOLIA_STAGE_PATH: string = env.PUBLIC_FOLIA_STAGE_PATH || '/player/stage';

export const FOLIA_PLAYLIST_ID: string = env.PUBLIC_FOLIA_PLAYLIST_ID || '593219640';

/** 演出 iframe 的完整地址（Folia 无 X-Frame-Options，可嵌；拒嵌时前端降级新窗口） */
export const FOLIA_STAGE_URL: string = FOLIA_BASE + FOLIA_STAGE_PATH;
