---
kind: 文章
title: '从弱口令到 GetShell：DVWA 完整链路复现'
desc: '爆破进后台、命令注入拿执行权、写马拿到 WebShell。一条完整的链路，外加三个把我卡了半天的坑。'
date: 2026-10-23
href: /posts/dvwa-rce-getshell
tags: ['DVWA', '命令注入', 'Burp Suite']
category: 技术
---

这个靶场我拖了一个下午才打完。不是漏洞难——每一步的原理都很简单——真正卡住我的是判定方式和转义规则。所以这篇不只是复现，重点记那几个坑。

## 环境

| 角色 | 配置 |
|---|---|
| 攻击机 | Windows 11 + Burp Suite 2024.10 |
| 靶机 | Windows Server 2003 SP2 + phpStudy（Apache 2.4.23 / PHP 5.4.45） |
| 应用 | DVWA 1.10，安全等级 low |
| 网络 | 192.168.137.0/24，靶机 192.168.137.128 |

靶机是自己搭的虚拟机，全程在授权范围内操作。这一点先说清楚：**同样的动作，换个目标就是违法**。

![完整链路：从弱口令到 GetShell](/assets/blog/dvwa-rce/08-flow.svg)

## 第一步：把登录口当靶子

DVWA 的登录页是 `POST /dvwa/login.php`，先把请求抓下来。

![抓到的登录请求](/assets/blog/dvwa-rce/01-login-request.png)

请求体里有四个字段：`username`、`password`、`Login`、`user_token`。前两个是我们要爆破的位置，后两个是坑。

扔进 Intruder，在两个位置打上 §，攻击类型选 **Cluster bomb**（用户名 × 密码全组合），两边各放几个候选：

![Intruder 配置](/assets/blog/dvwa-rce/02-intruder-setup.png)

24 条跑完，结果长这样：

![爆破结果](/assets/blog/dvwa-rce/03-intruder-hit.png)

**全部 302，长度全是 400 左右，看不出任何区别。** 我第一次跑完以为全失败了，其实成功的那条就藏在里面——`admin / password`，响应头里写的是 `Location: index.php`，其余全是 `login.php`。

### 坑一：302 的成败只能看 Location

登录成功后跳后台，失败后跳回登录页，两者都是 302，响应体都是空的（`Content-Length: 0`）。用状态码或长度判断等于没判断。正确做法是提取 `Location` 头，或者用 Grep - Match 匹配成功页的特征串。

### 坑二：user_token 会轮换

第一次跑的时候 24 条全废。原因是 DVWA 的登录页每次渲染都会重新生成一次 session token，而 Burp 默认跟随重定向——**你失败一次，页面重载一次，手上这个 token 就作废了**。后面所有请求都卡在 CSRF 校验上。

解决办法是关掉"跟随重定向"，或者干脆用 Burp 宏每次先取一遍新 token。真实系统里后者才是常态，这属于后面要补的功课。

## 第二步：命令注入

进后台后打开 Command Injection 页面，功能是"ping 一个 IP"。

![输入注入语句](/assets/blog/dvwa-rce/04-cmd-input.png)

输入框里填：

```text
127.0.0.1 & whoami
```

回显多了一行系统用户：

![命令执行结果](/assets/blog/dvwa-rce/05-cmd-whoami.png)

原理不复杂：后端把输入拼进了系统命令，PHP 只负责拼字符串，真正决定"这是几条命令"的是 shell。于是 `&` 把后面那半截变成了独立命令。

`;` 在这里不生效——那是 Unix 的写法，Windows 的 cmd 只认 `&`、`&&`、`|`、`||`。这个差异踩一次就记住了。

## 第三步：写马

有了命令执行，下一步就是往 Web 目录里塞文件。

最直觉的写法是 `echo` 一句 php 进去，但 cmd 里 `<` 和 `>` 是重定向符，整个木马会被当成重定向语法，得用 `^` 转义，还得小心引号和括号——试了两次都失败。

换了个思路：**让命令里一个特殊字符都没有**。

```text
127.0.0.1 & echo PD9waHAgQGV2... > C:\PhpStudy\PHPTutorial\WWW\s.b64 & certutil -decode C:\PhpStudy\PHPTutorial\WWW\s.b64 C:\PhpStudy\PHPTutorial\WWW\shell.php & del C:\PhpStudy\PHPTutorial\WWW\s.b64
```

三条命令串在一起：先把 base64 写进 `s.b64`，用系统自带的 `certutil -decode` 还原成 php，再删掉中间文件。

![写马命令](/assets/blog/dvwa-rce/06-write-shell.png)

这条命令回显只有 ping 的结果，因为 `echo` 和 `certutil` 都不输出内容。**没有报错就是成功**。

顺带一提：这个思路本身也是绕过——特征匹配只认它见过的东西，编码一次就换了样子。

## 第四步：GetShell

浏览器打开 `http://192.168.137.128/shell.php`，页面空白，说明 php 执行了但没有输出。用 HackBar 发一个 POST：

```text
c=phpinfo();
```

![拿到 phpinfo](/assets/blog/dvwa-rce/07-phpinfo.png)

phpinfo 出来了，版本、路径、配置全在里面。到这一步，文件和执行权都在手上，这条链就算走完了。

收尾记得删掉：

```text
127.0.0.1 & del C:\PhpStudy\PHPTutorial\WWW\shell.php
```

## 复盘：三个漏洞和它们的修法

| 环节 | 漏洞 | 根因 | 修复 |
|---|---|---|---|
| 登录 | 弱口令 | 默认密码 + 无锁定 | 强密码策略、失败计数与锁定、二次验证 |
| 后台功能 | 命令注入 | 输入拼进 `system()` | 不调 shell，用语言内置能力；必须调时白名单校验参数 |
| 写文件 | Web 目录可写 | 应用与可执行文件同目录 | 上传/写入目录禁止执行、最小权限运行 |

三个环节连起来才是完整的危害链：**弱口令给你入口，命令注入给你执行权，目录可写让你把执行权变成持久后门**。少任何一环，危害都会降一个量级。

修复优先级按危害排：命令注入（RCE）最高，弱口令次之，目录权限是放大器。

## 几个把我卡住的坑

**302 的判定。** 状态码、长度、响应时间都不是判据，只有 `Location` 是。这条对真实站点的登录口同样适用。

**token 轮换。** 复杂一点的系统，登录口都有 token，而且每次渲染都换。纯 Intruder 打不动，得有宏。

**杀软。** 把 payload 存进笔记时，Windows Defender 直接把文件隔离了，连弹窗都没有（自动处置）。后来改成拆分写法或者 base64 才存住。这件事跟"为什么现在的 webshell 都要加密"是同一个道理。

**证据要边打边留。** 我第一遍打完什么都没截，只能重打一次。真实项目里没人给你重打的机会。

## 最后

这条链的每一步单独看都不难，难的是把它们串起来，并且知道每一步的"成功"到底长什么样。靶场存在的意义，大概就是让这些判断在安全的环境里变成肌肉记忆。

下一次想试试带 token 的登录口，用 Burp 宏把它啃下来。
