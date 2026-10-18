# 生产部署（裸机 · 443 + 81）

这份目录记录**服务器上实际跑的拓扑**，不是 docker-compose 那套实验配置：

```text
443  nijingzh.top      静态站点（/var/www/Yanschul-digital-space/dist）
                        /api/like → 127.0.0.1:3001（点赞计数）
81   nijingzh.top      Folia 页面 + /api/ → 127.0.0.1:3000（网易 API，剥前缀）
3001                   点赞计数服务（systemd: like-server）
```

## 首次部署

```bash
# 1. 拉代码、构建
cd /var/www/Yanschul-digital-space
git pull
npm ci
npm run build

# 2. 点赞服务（推荐一键脚本，会自动写对路径）
sudo bash deploy/like-server/install.sh

# 3. nginx
sudo cp deploy/production/site-443.conf /etc/nginx/sites-available/nijingzh.conf
sudo cp deploy/production/folia-81.conf /etc/nginx/sites-available/folia-81.conf
sudo ln -sf /etc/nginx/sites-available/nijingzh.conf /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/folia-81.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 每次更新

```bash
cd /var/www/Yanschul-digital-space
git pull && npm ci && npm run build
# 静态文件无需重启 nginx
```

## 需要你确认的两处

1. **Folia / 网易 API 端口**：模板里写的是 `8080`（Folia 页面）和 `3000`（网易 API），按你服务器的实际进程改。
2. **证书路径**：模板用 certbot 默认路径 `/etc/letsencrypt/live/nijingzh.top/`，如果你签的是别的名字要改。

## 关于 81 端口的 Cookie 注入

`folia-81.conf` 里只对**只读听歌接口**注入 `MUSIC_U`，写接口匿名转发。Cookie 等同账号密码：

- 只放在服务器 nginx 配置里，不进 git、不进前端；
- 觉得不对劲就改网易云密码，旧 Cookie 立即作废；
- 不需要主站也全曲的话，整段保持注释即可。

## 自检

```bash
curl -I https://nijingzh.top/            # 200 + 安全头
curl https://nijingzh.top/api/like        # {"count":N}
curl https://nijingzh.top/nope            # 404（不是 200）
curl -I https://nijingzh.top/fonts/lxgw-wenkai-site-regular.woff2  # 1y immutable
curl -s https://nijingzh.top:81/api/song/url?ids=2097170103 | head -c 80  # JSON，不是 Cannot GET
```
