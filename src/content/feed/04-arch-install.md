---
kind: 文章
title: Arch Linux 安装手记：从零到可用的桌面
desc: 分区、引导、驱动，以及装完之后第一批值得做的小事。
date: 2026-09-12
href: /posts/arch-install
category: 技术
tags:
  - Arch Linux
  - Linux
---
这篇文章记的是我自己的装机流程，不是唯一正确答案。命令里的磁盘名按你自己的改，**分区和格式化会清空数据，执行前先 `lsblk` 确认设备**。

## 准备

- 用 Arch 官方 ISO 写 U 盘，UEFI 启动；
- 有线网最省事，只有 Wi-Fi 就用 `iwctl`：

```bash
iwctl
device list
station wlan0 scan
station wlan0 connect "你的Wi-Fi"
exit
ping -c 3 archlinux.org
```

- 确认是 UEFI：`ls /sys/firmware/efi/efivars` 有东西就是。

## 分区

我习惯三块：EFI 512M、swap 跟内存差不多、剩下全给根。

```bash
lsblk
sgdisk -Z /dev/nvme0n1
sgdisk -n 1:0:+512M -t 1:ef00 /dev/nvme0n1
sgdisk -n 2:0:+16G  -t 2:8200 /dev/nvme0n1
sgdisk -n 3:0:0     -t 3:8300 /dev/nvme0n1

mkfs.fat -F32 /dev/nvme0n1p1
mkswap /dev/nvme0n1p2 && swapon /dev/nvme0n1p2
mkfs.ext4 /dev/nvme0n1p3

mount /dev/nvme0n1p3 /mnt
mkdir -p /mnt/boot
mount /dev/nvme0n1p1 /mnt/boot
```

文件系统我选 ext4：简单、稳、出问题好救。想玩快照就上 btrfs，但要提前规划子卷，别装完再补。

## 装基础系统

```bash
pacstrap -K /mnt base linux linux-firmware intel-ucode \
  networkmanager vim sudo bash-completion

genfstab -U /mnt >> /mnt/etc/fstab
arch-chroot /mnt
```

`linux-firmware` 千万别省，尤其是笔记本的无线网卡和显卡。`intel-ucode`（AMD 用 `amd-ucode`）是 CPU 微码，装了少踩很多莫名其妙的坑。

## chroot 里的收尾

```bash
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
hwclock --systohc

sed -i 's/^#en_US.UTF-8/en_US.UTF-8/' /etc/locale.gen
sed -i 's/^#zh_CN.UTF-8/zh_CN.UTF-8/' /etc/locale.gen
locale-gen
echo 'LANG=en_US.UTF-8' > /etc/locale.conf

echo 'myhost' > /etc/hostname
useradd -m -G wheel -s /bin/bash yan
passwd yan
EDITOR=vim visudo   # 放开 %wheel ALL=(ALL:ALL) ALL

systemctl enable NetworkManager
```

## 引导

UEFI + 单系统我用 systemd-boot，比 GRUB 轻：

```bash
bootctl install
```

`/boot/loader/loader.conf`：

```ini
default arch.conf
timeout 3
```

`/boot/loader/entries/arch.conf`：

```ini
title   Arch Linux
linux   /vmlinuz-linux
initrd  /intel-ucode.img
initrd  /initramfs-linux.img
options root=PARTUUID=你的根分区PARTUUID rw quiet
```

PARTUUID 用 `blkid` 查。双系统或者要更复杂的引导，还是 GRUB 省心。

## 第一次重启

```bash
exit
umount -R /mnt
reboot
```

起来之后先确认网络和时间：

```bash
timedatectl
ping -c 3 archlinux.org
```

时间不对会导致 HTTPS 证书报错，很多人第一次装完以为网络坏了，其实是时钟漂了。

## 桌面

```bash
sudo pacman -S plasma sddm konsole dolphin
sudo systemctl enable sddm

sudo pacman -S pipewire pipewire-pulse wireplumber
systemctl --user enable pipewire pipewire-pulse wireplumber
```

字体和中文输入：

```bash
sudo pacman -S noto-fonts noto-fonts-cjk noto-fonts-emoji
sudo pacman -S fcitx5 fcitx5-chinese-addons fcitx5-configtool
```

输入法环境变量写进 `~/.pam_environment` 或 `~/.config/environment.d/`，然后在 fcitx5 里加拼音。第一次装完发现打不出中文，十有八九是环境变量没生效或者没加输入法。

## 几个坑

**无线网卡没驱动。** 装完重启发现没网，通常是漏了 `linux-firmware`，或者需要额外的 `broadcom-wl` 之类。装之前先查自己网卡的型号。

**双系统时间差 8 小时。** Windows 用本地时间，Linux 默认 UTC。要么让 Linux 也读本地时间（`timedatectl set-local-rtc 1`），要么改 Windows 注册表，二选一，别两边都改。

**Secure Boot。** 官方 ISO 能启动但装完引导不了，多半是 Secure Boot 没关或者没配签名。

**别照抄别人的分区。** 尤其是 `sgdisk -Z`，敲下去整块盘就没了。先 `lsblk`，再确认，最后才执行。

装完只是开始。真正花时间的是后面把这台机器调成顺手的样子——那是另一篇文章的事了。
