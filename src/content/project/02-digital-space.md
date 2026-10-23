---
title: 江衍 · Digital Space
desc: 从设计系统开始，一砖一瓦搭起来的个人数字空间。
date: 2026-09-20
href: /projects
category: 技术
stack:
  - Astro
  - TypeScript
  - Tailwind
  - Anime.js
links:
  - label: 设计系统
    href: '#'
tags:
  - Astro
  - TypeScript
---
这是这个站本身。目标不是"做个博客"，是做一个**能长期维护、改起来不心疼**的个人空间。

## 技术选型

- **Astro**：默认零 JS，页面是静态 HTML，交互只在哪里需要才加载；
- **TypeScript strict**：内容 schema 用 zod 定义，字段写错在构建时就报；
- **Tailwind 4**：只当工具用，真正的视觉规则在 `global.css` 的 token 里；
- **Anime.js**：动效只碰 transform / opacity，`prefers-reduced-motion` 下全部静止。

没上 React/Vue。这个站 90% 是静态内容，多一个运行时只会多一份要维护的东西。

## 内容层

五个 collection：`feed`（文章/记录）、`project`、`world`、`media`、`now`。日期统一 `YYYY-MM-DD` 字符串，展示层再格式化成 `2026.09.28`，避免 YAML 把日期解析成 Date 之后到处时区偏移。

所有取数集中在一个 `data/content.ts` 里，组件不直接碰 collection。这样以后换数据源（比如接 CMS）只需要改一个文件。

## 视觉与动效

设计系统的约束写在 `global.css`：三档白、两级墨、粉紫只进环境光、发丝线代替边框、光源固定在右上。夜航模式是同一套 token 的另一组值，组件不用改。

动效分三层：进站加载、页内入场、页间转场。前两层用 IntersectionObserver 触发，第三层交给 Astro 的 ClientRouter。踩过一个坑：入场动画的 `threshold` 用百分比时，比视口高几倍的文章正文永远凑不够触发比例，首屏会一直停在透明状态——后来改成 0.01 才正常。

## 字体与性能

字体自托管：霞鹜文楷子集，3924 字、868KB，单个 woff2，不再依赖 CDN。构建时 CSS 输出成带 hash 的独立文件，可以长缓存；HTML 保持 no-cache。

## 部署

服务器是 Ubuntu + nginx：静态产物放 `/var/www/.../dist`，`/api/like` 反代到本地的计数服务（systemd 常驻）。证书、404、安全头、缓存策略都在 `deploy/production/` 里有对应配置。

整套东西的迭代过程写在[《我用 AI 做了这个网站》](/posts/ai-made-this-site)里，这里只记结论：**先把约束写下来，再开始写代码**。
