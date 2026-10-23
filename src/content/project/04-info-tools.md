---
title: 信息收集工具串
desc: 把散落的安全工具串成一条可复用的侦察路径。
date: 2026-08-28
href: /projects
category: 技术
stack:
  - Python
  - Shell
  - Nmap
links:
  - label: 工具清单
    href: '#'
tags:
  - Python
  - 安全
---
信息收集的工具不缺，缺的是**把它们串起来的那根线**。这个项目的目标很简单：输入一个域名，输出一份能直接用于测试的资产清单，中间不用手动搬文件。

## 流水线

```text
seed.txt
  → 子域枚举（crt.sh / subfinder）
  → 解析（dnsx）
  → 存活与指纹（httpx）
  → 端口与服务（nmap）
  → 目录与接口（ffuf / JS 提取）
  → assets.jsonl + report.md
```

每一段只做一件事，上一段的输出就是下一段的输入。每段都可以单独重跑，中间结果落在 `data/` 下，断在哪一步都清楚。

## 为什么用 Python 而不是一堆 shell

单个工具用 shell 包一层就够了，但这条链需要：并发、超时、重试、去重、结构化输出。用 shell 写到最后会变成一堆 `xargs` 和临时文件，很难维护。

Python 这边只做编排，不重新实现扫描：

```python
async def probe(host: str) -> dict | None:
    proc = await asyncio.create_subprocess_exec(
        "httpx", "-silent", "-json", "-u", host,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.DEVNULL,
    )
    out, _ = await asyncio.communicate()
    return json.loads(out) if out.strip() else None
```

工具挂了就记一条 `error`，不影响其他目标。并发用信号量压住，默认 20，扫描类任务可以再降。

## 输出格式

统一用 JSONL，一行一个资产：

```json
{"host":"api.example.com","ip":"1.2.3.4","port":443,"status":200,"title":"API","tech":["nginx","php"],"source":"crt.sh"}
```

后面的报告生成、去重、对比历史，全部基于这个格式。csv 只是给人看的导出，不作为中间数据。

## 边界与礼貌

- 只处理授权范围内的域名，配置文件里写死 scope，越界直接跳过；
- 默认限速，目录扫描 50 req/s 以下，端口扫描不用 `-T4`；
- 所有请求带固定 UA，方便对方在日志里识别；
- 不碰登录口、不提交表单、不做任何写操作——信息收集只读。

## 现在缺什么

截图归档和报告自动生成还没做。理想状态是跑完直接出一份带证据的 HTML 报告，现在还得手动拼。下一步先把截图补上，那个最费时间。
