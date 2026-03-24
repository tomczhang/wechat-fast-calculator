#!/bin/bash
set -e

DOMAIN=${1:?"用法: bash deploy.sh api.tommiao.com"}
REPO="https://github.com/tomczhang/wechat-fast-calculator.git"
APP_DIR="/opt/wechat-api"

echo "=== 1. 安装 Node.js 20 ==="
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
echo "Node $(node -v), npm $(npm -v)"

echo "=== 2. 安装 PM2 + Git ==="
sudo npm install -g pm2
sudo apt-get install -y git

echo "=== 3. 克隆/更新代码 ==="
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git pull
else
  sudo git clone "$REPO" "$APP_DIR"
fi
cd "$APP_DIR/server"

echo "=== 4. 检查 .env ==="
if [ ! -f .env ]; then
  echo "!! 请先创建 $APP_DIR/server/.env 填写 API 密钥 !!"
  echo "!! 参考 .env.example !!"
  exit 1
fi

echo "=== 5. 安装依赖 ==="
npm install --omit=dev

echo "=== 6. PM2 启动 ==="
pm2 delete wechat-api 2>/dev/null || true
pm2 start index.js --name wechat-api
pm2 save
sudo env PATH="$PATH:/usr/bin" pm2 startup systemd -u "$USER" --hp "$HOME"

echo "=== 7. 安装 Nginx + Certbot ==="
sudo apt-get install -y nginx certbot python3-certbot-nginx

echo "=== 8. Nginx 配置 ==="
sudo tee /etc/nginx/sites-available/wechat-api <<NGINXCONF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINXCONF

sudo ln -sf /etc/nginx/sites-available/wechat-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "=== 9. 申请 HTTPS 证书 ==="
sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email

echo ""
echo "=== 部署完成 ==="
echo "API: https://$DOMAIN"
echo "测试: curl https://$DOMAIN/api/health"
echo ""
echo "后续更新只需:"
echo "  cd $APP_DIR && git pull && cd server && npm install --omit=dev && pm2 restart wechat-api"
