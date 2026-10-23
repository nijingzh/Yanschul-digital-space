---
title: KDE Plasma 桌面调优记录
desc: KWin 规则、面板布局与一套自己的 Dotfiles。
date: 2026-08-15
href: /projects
category: 技术
stack:
  - KDE Plasma
  - KWin
  - Shell
links:
  - label: Dotfiles
    href: '#'
tags:
  - KDE
  - Dotfiles
---
用 KDE 的理由很简单：它是少数几个**把桌面当成可编程对象**的环境。面板、快捷键、窗口规则、虚拟桌面都能落到配置文件里，改坏了还能改回来。

## 布局

最后稳定下来的是单面板方案：

- 顶栏：应用菜单、全局菜单、虚拟桌面切换、系统托盘、时钟；
- 默认两个虚拟桌面：`work` 和 `life`，用 `Meta+1/2` 切；
- 窗口平铺靠快捷键而不是插件：`Meta+←/→` 半屏，`Meta+↑` 最大化，`Meta+Shift+数字` 移到对应桌面。

面板越少，注意力越省。早期也试过底部 Dock + 顶部面板，实际用下来只会让鼠标多跑几趟。

## KWin 规则

真正提升效率的是窗口规则，不是主题。目前常驻的几条：

| 匹配 | 动作 | 原因 |
|---|---|---|
| 类别含 `konsole` | 去掉标题栏、记住 120×34 | 终端不需要装饰 |
| 类别含 `code` | 强制在桌面 1、最大化 | 写代码只在一个桌面 |
| 标题含 `Picture-in-Picture` | 置顶、无边框 | 看视频时不被盖住 |
| 类别含 `steam` | 记住位置、禁止抢焦点 | 游戏启动器很吵 |

规则可以在系统设置里点，也可以直接写 `~/.config/kwinrulesrc`。后者适合版本化，但改完要 `qdbus org.kde.KWin /KWin reconfigure` 或者注销重进才生效。

## Dotfiles

只版本化真正手改的部分：

```text
dotfiles/
  kde/
    kwinrc
    kwinrulesrc
    kdeglobals
    kglobalshortcutsrc
    plasmarc
  scripts/
    apply.sh
```

`kdeglobals` 和 `kwinrc` 在图形界面里改设置时会被重写，所以流程是：**先关设置面板 → 改文件 → 重新登录**。反过来的话，手改的内容会被 GUI 覆盖，而且不会有任何提示。

`apply.sh` 只做软链接和 `qdbus` 重载，不做任何删除操作，跑第二遍也安全。

## 视觉

主题保持 Breeze，字体换成 Noto Sans + Noto Sans Mono，窗口圆角和模糊都关掉——不是为了好看，是为了在核显上不掉帧。KDE 的模糊效果很好看，但 4K 屏 + 核显的组合下，拖窗口时的掉帧比美观更影响心情。

## 踩过的坑

**Wayland 和 X11 行为不一致。** 全局快捷键、截图、输入法在两边表现不同，遇到问题先确认会话类型。

**缩放。** 4K 屏 150% 缩放下，部分 Qt5 应用会糊，得单独设 `QT_SCALE_FACTOR` 或者用 `xwayland` 的缩放开关。

**配置漂移。** 手动改和 GUI 改混着来，最后自己都不知道哪份是准的。现在只认 dotfiles 仓库，改完立刻提交。

这套东西谈不上多精致，但每次换机器，半小时能恢复到熟悉的状态，这就够了。
