#!/usr/bin/env python3
"""Regenerate the self-hosted LXGW WenKai subset used by this site.

The shipped font (public/fonts/lxgw-wenkai-site-regular.woff2) contains the
characters this repository renders plus the GB2312 level-1 set (3755 common
characters), so new articles do not suddenly fall back to a system font.

Usage:
    pip install fonttools brotli
    python scripts/fonts/subset.py --font /path/to/LXGWWenKai-Regular.ttf

Download the source font from https://github.com/lxgw/LxgwWenKai/releases
(OFL licensed; keep the license notice when redistributing).
"""
from __future__ import annotations

import argparse
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "public" / "fonts"

EXTRA = (
    "0123456789"
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    "，。、；：？！“”‘’（）《》〈〉「」『』【】〔〕…—～·•"
    "✦✧☾☀♪♥◷↑↓←→↗↘◦●○■□▲△"
    "　"
    " #%&*+-/=@\\|_~^$<>[]{}"
)


def collect_charset() -> str:
    chars: set[str] = set(EXTRA)
    # GB2312 level 1: the 3755 most common simplified characters.
    for hi in range(0xB0, 0xD8):
        for lo in range(0xA1, 0xFF):
            try:
                chars.add(bytes([hi, lo]).decode("gb2312"))
            except UnicodeDecodeError:
                pass
    for path in (ROOT / "src").rglob("*"):
        if path.suffix in {".astro", ".ts", ".css", ".md", ".json"} and path.is_file():
            chars.update(path.read_text(encoding="utf-8"))
    return "".join(sorted(c for c in chars if ord(c) >= 0x20))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--font", required=True, help="path to LXGWWenKai-Regular.ttf")
    args = parser.parse_args()

    from fontTools import subset

    text = collect_charset()
    cjk = sum(1 for c in text if "\u4e00" <= c <= "\u9fff")
    print(f"charset: {len(text)} chars ({cjk} CJK)")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    dst = OUT_DIR / "lxgw-wenkai-site-regular.woff2"

    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.notdef_outline = True

    font = subset.load_font(args.font, options)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text=text)
    subsetter.subset(font)
    subset.save_font(font, str(dst), options)
    print(f"{dst.relative_to(ROOT)}: {dst.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
