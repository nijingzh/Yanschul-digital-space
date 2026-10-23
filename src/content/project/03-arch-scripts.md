---
title: Arch Linux 安装脚本集
desc: 把第一次装机踩过的坑，写成可以重复跑的脚本。
date: 2026-09-12
href: /projects
category: 技术
stack:
  - Shell
  - Arch Linux
  - systemd
links:
  - label: 脚本仓库
    href: '#'
tags:
  - Shell
  - Arch Linux
---
第一次装 Arch 的时候，我把命令一条条敲进终端，装完就忘了。第二次装，又从头翻笔记。第三次就明白了：**装机流程要么变成脚本，要么每次都在赌记忆力**。

## 结构

```text
arch-setup/
  bootstrap.sh        # 入口：检查环境、按模块执行
  modules/
    00-disk.sh        # 分区、格式化、挂载
    10-base.sh        # pacstrap、fstab、chroot 基础配置
    20-boot.sh        # 引导器与内核参数
    30-desktop.sh     # 桌面、字体、输入法
    40-dev.sh         # 开发工具与 dotfiles
  lib/common.sh       # log / die / confirm / require
```

`bootstrap.sh` 只负责编排，每一步都能单独跑；某个模块失败，修完从那一模块继续，不用整机重来。

## 安全底线

分区脚本是唯一会删数据的部分，所以规则定得很死：

```bash
set -euo pipefail

: "${TARGET_DISK:?请显式设置 TARGET_DISK，例如 /dev/nvme0n1}"

confirm "将清空 $TARGET_DISK，确认？" || exit 1
lsblk "$TARGET_DISK"
```

- 不写默认磁盘，必须显式传入；
- 执行前打印 `lsblk`，让人再看一眼；
- 所有破坏性命令前面加确认，非交互模式用 `--yes` 显式跳过；
- `set -euo pipefail`，任何一步失败立刻停。

## 幂等

脚本最大的价值不是"能跑"，是"**能重复跑**"。所以每一步都先判断再执行：

```bash
if ! mountpoint -q /mnt; then
  mount "$ROOT_PART" /mnt
fi

if ! pacman -Q linux &>/dev/null; then
  pacstrap -K /mnt base linux linux-firmware
fi
```

桌面模块、开发工具模块都可以反复执行，不会因为"已经装过"就报错中断。

## 测试

流程在虚拟机里先跑三遍：全新安装、装到一半中断再继续、重复执行。第三遍最容易暴露问题——很多脚本第一次能跑，第二次就死在"文件已存在"上。

`shellcheck` 是必过的，`bash -n` 只能查语法，查不出未定义变量和引号问题。

## 没做的部分

- 没有做全自动无人值守：分区方案、桌面选择这些还是让人确认，装系统不适合"一键黑箱"；
- 没有内置密钥：需要的话从环境变量或 `pass` 读，脚本里不放任何明文；
- 没有追新：滚动发行版本来就会变，脚本跟着实际安装流程更新，不提前适配。

这套脚本现在最大的作用是**文档**：想知道这台机器是怎么装出来的，看它比看笔记快。
