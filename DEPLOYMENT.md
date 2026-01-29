# MySkin 本番環境デプロイ手順（AWS EC2）

本番環境（EC2）にデプロイするための環境構築・設定手順です。

---

## 1. アーキテクチャ概要

| 役割 | 技術 | ポート例 |
|------|------|----------|
| フロント | Vite ビルド → Nginx で静的配信 | 80 / 443 |
| API | Node.js (Express) | 3000 |
| DB | MySQL 8 | 3306 |
| WebSocket | 同一サーバー (ws) | 3000 |

---

## 2. EC2 インスタンスの準備

- **AMI**: Amazon Linux 2023 または Ubuntu 22.04
- **インスタンスタイプ**: 例 t3.small（必要に応じて変更）
- **セキュリティグループ**:
  - インバウンド: 22 (SSH), 80 (HTTP), 443 (HTTPS)
  - 同一VPC内から API(3000) にアクセスする場合は 3000 を開ける必要はない（Nginx リバースプロキシ経由）

---

## 3. EC2 上で必要なソフトのインストール

SSH で EC2 にログイン後、以下を実行します。

### 3.1 Node.js（LTS）

```bash
# Amazon Linux 2023 の場合
sudo dnf install -y nodejs

# または nvm で LTS を入れる場合
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install --lts
node -v
npm -v
```

### 3.2 MySQL 8

```bash
# Amazon Linux 2023
sudo dnf update -y
sudo dnf install -y mariadb105-server
sudo systemctl enable --now mariadb
mariadb --version

# 初回ログイン（一時パスワードは /var/log/mysqld.log を確認）
sudo mysql -u root -p
```

MySQL 内で DB とユーザー作成:

```sql
CREATE DATABASE myskin CHARACTER SET utf8mb4;
CREATE USER 'myskin'@'localhost' IDENTIFIED BY 'myskin0909';
GRANT ALL PRIVILEGES ON myskin.* TO 'myskin'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

シード投入:

```bash
cd /home/ec2-user/myskin/myskin-api
mysql -u myskin -p myskin < myskin_seed.sql
```

### 3.3 Nginx（フロント＋API リバースプロキシ）

```bash
sudo dnf install -y nginx   # Amazon Linux
# または
sudo apt install -y nginx  # Ubuntu
```

---

## 4. 環境変数の設定

### 4.1 フロントエンド（ビルド時）

リポジトリルートに `.env.production` を作成（Git にコミットしないこと）:

```env
VITE_API_URL=https://あなたのドメイン
```

- 同じ EC2 で API も動かす場合、`https://your-domain.com` のようにドメインで揃えると CORS・Cookie の扱いが楽です。

### 4.2 API（myskin-api）

`myskin-api/.env` を作成:

```env
PORT=3000
NODE_ENV=production

DB_HOST=localhost
DB_USER=myskin
DB_PASSWORD=myskin0909
DB_NAME=myskin
DB_PORT=3306

# 本番フロントのURL（複数ある場合はカンマ区切り）
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

---

## 5. アプリケーションのデプロイ

### 5.1 ソースの配置

- Git で clone するか、ビルド済みファイルを SCP/rsync で配置します。

```bash
cd /home/ec2-user
git clone <your-repo-url> myskin
cd myskin
```

### 5.2 フロントエンドのビルド

```bash
cd /home/ec2-user/myskin
npm ci
cp .env.production .env   # または export で VITE_API_URL を設定
npm run build
```

ビルド成果物は `build/`（vite.config の `outDir: 'build'` に従う）に出力されます。

### 5.3 API のセットアップと起動

```bash
cd /home/ec2-user/myskin/myskin-api
npm ci --omit=dev
mkdir -p uploads
touch uploads/.gitkeep
```

常時起動には **PM2** を推奨します。

```bash
sudo npm install -g pm2
pm2 start server.js --name myskin-api
pm2 save
pm2 startup
```

---

## 6. Nginx 設定

**推奨**: API と WebSocket をサブドメイン `api.your-domain.com` でまとめると設定が簡単です。

### 6.1 推奨: サブドメインで API を分ける場合

- フロント: `https://your-domain.com` → 静的ファイル（`build/`）
- API・WebSocket: `https://api.your-domain.com` → `http://127.0.0.1:3000`

**フロント用** `/etc/nginx/conf.d/myskin-front.conf`:

```nginx
server {
    listen 80;
    server_name todokizamu.me www.todokizamu.me;
    root /home/ec2-user/myskin/build;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**API用** `/etc/nginx/conf.d/myskin-api.conf`:

```nginx
upstream myskin_api {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name api.todokizamu.me;

    location / {
        proxy_pass http://myskin_api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }
}
```

- 本番の `.env.production`: `VITE_API_URL=https://api.todokizamu.me`
- API の `ALLOWED_ORIGINS`: `https://todokizamu.me,https://www.todokizamu.me`

### 6.2 同一ドメインで /api と /ws を使う場合

フロントと API を同じドメインで動かす場合は、`/api` と `/ws` を Nginx でプロキシします。この場合、**API 側で WebSocket を path `/ws` で listen する**必要があります。

- `server.js` の WebSocket 初期化を変更:
  ```js
  const wss = new WebSocket.Server({ server, path: '/ws' });
  ```
- フロントの WebSocket URL を `/ws` に:
  - `VITE_WS_URL=https://todokizamu.net/ws` のように別変数にするか、`VITE_API_URL` の末尾に `/ws` を付与する実装にする。

例: `/etc/nginx/conf.d/myskin.conf`（同一ドメイン）

```nginx
upstream myskin_api {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    root /home/ec2-user/myskin/build;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://myskin_api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads {
        proxy_pass http://myskin_api;
        proxy_set_header Host $host;
    }

    location /ws {
        proxy_pass http://myskin_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

HTTPS にする場合（Let's Encrypt 例）:

```bash
sudo dnf install -y certbot python3-certbot-nginx
# サブドメインを使う場合
sudo certbot --nginx -d your-domain.com -d www.your-domain.com -d api.your-domain.com
# 同一ドメインのみの場合
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

その後、Nginx の `listen 80` を `return 301 https://...` に変更し、`listen 443 ssl` の server を追加（certbot が自動で入れる場合もあり）。

---

## 7. 本番環境チェックリスト

- [ ] EC2 セキュリティグループで 80/443 のみ公開（22 は必要なら IP 制限）
- [ ] MySQL は `localhost` のみバインド（外部から直接アクセスしない）
- [ ] `.env` / `.env.production` を Git に含めない
- [ ] API の `ALLOWED_ORIGINS` に本番フロント URL のみ記載
- [ ] パスワードはハッシュ化（現状は平文のため、本番では bcrypt 等の導入を推奨）
- [ ] `uploads` ディレクトリのパーミッション（アプリが書き込み可能）
- [ ] PM2 で API の自動再起動とログ確認

---

## 8. 運用コマンド例

```bash
# API ログ
pm2 logs myskin-api

# API 再起動
pm2 restart myskin-api

# Nginx 設定反映
sudo nginx -t && sudo systemctl reload nginx
```

---

## 9. トラブルシューティング

| 現象 | 確認項目 |
|------|----------|
| CORS エラー | `ALLOWED_ORIGINS` にフロントの URL が含まれているか |
| 502 Bad Gateway | PM2 で API が起動しているか、PORT=3000 で listen しているか |
| WebSocket がつながらない | Nginx の `/ws` の `Upgrade` / `Connection` ヘッダー、API の ws パス |
| 静的ファイル 404 | `root` が `build` ディレクトリを指しているか、ビルド実行済みか |

---

以上で、EC2 上でフロント（Nginx）・API（Node + PM2）・MySQL を使った本番構成の概要と設定手順になります。
