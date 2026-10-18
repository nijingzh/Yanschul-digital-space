#!/usr/bin/env bash
# 一键把 like-server 装成 systemd 服务（开机自启 + 崩溃自动拉起）。
# 用法：sudo bash deploy/like-server/install.sh
# 说明：自动把仓库实际路径和 node 实际路径写进 unit，避免手改模板踩 /opt 与 nvm 路径的坑。
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "请用 sudo 运行：sudo bash $0" >&2
  exit 1
fi

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE="$(command -v node || true)"
if [ -z "$NODE" ]; then
  echo "找不到 node，请先确认 node 已安装并在 PATH 里（nvm 用户先 source ~/.nvm/nvm.sh）" >&2
  exit 1
fi

echo "目录：$DIR"
echo "node：$NODE"

cat > /etc/systemd/system/like-server.service <<EOF
[Unit]
Description=Yanschul like counter (zero-dep node server)
After=network.target

[Service]
WorkingDirectory=$DIR
ExecStart=$NODE server.cjs
Restart=always
RestartSec=3
Environment=NODE_ENV=production
Environment=LIKE_COOLDOWN_MS=2000

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now like-server
sleep 1
systemctl --no-pager --full status like-server || true
echo
echo "自测："
curl -fsS http://127.0.0.1:3001/api/like || true
echo
echo "如果 status 不是 active (running)，用 journalctl -u like-server -n 50 --no-pager 看原因。"
