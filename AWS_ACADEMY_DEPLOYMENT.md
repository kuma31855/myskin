# AWS Academy デプロイガイド（MySkin）

このドキュメントは、AWS Academy 環境で MySkin（化粧品サブスクリプションサイト）をデプロイする方法を説明します。

## 📋 AWS Academy での制限事項

### 利用可能なサービス
- ✅ EC2（通常利用可能）
- ✅ ECR（通常利用可能）
- ✅ VPC, Security Groups（通常利用可能）
- ✅ EBS（通常利用可能）

### 制限事項
1. **クレジット制限**: AWS Academy は通常、月額 $50〜200 程度のクレジットを提供
2. **リソース制限**: 一部のインスタンスタイプが利用できない可能性あり
3. **サービス制限**: 一部の高度なサービスが制限される可能性あり

## 🎯 推奨デプロイ方法: EC2 + Docker（コスト効率重視）

AWS Academy では、コストを抑えるために **EC2 + Docker Compose** を推奨します。

### 理由
- フロント・API・MySQL を 1 台の EC2 でまとめて実行可能
- Docker で環境を揃えられ、手順が単純
- 小規模デプロイに十分な t3.small / t3.medium で運用可能
- クレジット内に収まりやすい

---

## 🌐 VPC について

**AWS Academy Learner Lab では、通常デフォルト VPC が提供されています。**

✅ **VPC を個別に作成する必要はありません**

理由:
- デフォルト VPC には Internet Gateway・ルートテーブル・サブネットが既に含まれる
- EC2 作成時に自動的にデフォルト VPC が使用される
- 追加の VPC リソースが不要でコスト削減になる

---

## 🚀 ステップバイステップ: EC2 + Docker デプロイ

### 前提条件

1. **AWS Academy アカウント**
   - AWS Academy Learner Lab にアクセス
   - クレジット残高を確認

2. **AWS CLI 設定（任意）**
   ```bash
   aws configure
   # AWS Academy の認証情報を入力
   ```

---

### ステップ 1: EC2 インスタンスの作成

#### 1.1 インスタンスタイプの選択

**推奨**: `t3.small`（2 vCPU, 4GB RAM）
- コスト: 約 $0.0208/時間（月額約 $15）
- フロント + API + MySQL の Docker 構成に十分

**余裕を持たせる**: `t3.medium`（2 vCPU, 4GB RAM）
- コスト: 約 $0.0416/時間（月額約 $30）

#### 1.2 セキュリティグループの設定

EC2 作成時または既存 SG に以下を設定します。

| タイプ   | ポート | ソース      | 備考 |
|----------|--------|-------------|------|
| SSH      | 22     | 自分の IP/32 | 管理用 |
| HTTP     | 80     | 0.0.0.0/0   | Nginx（Cloudflare 経由時も） |
| HTTPS    | 443    | 0.0.0.0/0   | HTTPS を EC2 で終端する場合 |
| カスタム | 8080   | 0.0.0.0/0   | ドメイン未使用で直接アクセスする場合 |
| カスタム | 3000   | 0.0.0.0/0   | 同上（API 直アクセス用） |

**Cloudflare 経由でドメインのみ公開する場合**: 80 と 443 を 0.0.0.0/0 で開けておけば十分です（8080/3000 は Nginx でプロキシするため外部に露出しません）。

#### 1.3 キーペアと SSH 接続

- キーペアをダウンロードし、`chmod 400 myskin-key.pem` で権限を設定
- 接続例:
  ```bash
  ssh -i myskin-key.pem ec2-user@<EC2_PUBLIC_IP>
  ```

---

### ステップ 2: EC2 上のセットアップ（Docker 導入）

#### 2.1 SSH 接続

```bash
ssh -i myskin-key.pem ec2-user@<EC2_PUBLIC_IP>
```

#### 2.2 システム更新と Docker のインストール（Amazon Linux 2023）

```bash
# システム更新
sudo dnf update -y

# Docker のインストール
sudo dnf install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Docker Compose プラグイン
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 再ログインして docker グループを有効化
exit
# 再度 SSH 接続
```

#### 2.3 Git のインストール

```bash
sudo dnf install -y git
git --version
```

---

### ステップ 3: プロジェクトのデプロイ（Docker）

#### 3.1 リポジトリのクローン

```bash
cd ~
git clone <あなたのMySkinリポジトリURL> myskin
cd myskin
```

#### 3.2 環境変数の設定（Docker Compose 用）

**ドメインを使う場合**（例: todokizamu.me, api.todokizamu.me）は、フロントのビルド時に API の URL を渡します。  
まずは **IP 直アクセス** で試す場合は、そのまま `docker compose up` で問題ありません。

##### オプション A: IP 直アクセス（手軽に確認）

```bash
cd ~/myskin

# そのまま起動（VITE_API_URL は docker-compose.yml のデフォルト http://localhost:3000）
docker compose up -d --build
```

- フロント: `http://<EC2_PUBLIC_IP>:8080`
- API: `http://<EC2_PUBLIC_IP>:3000`  
※ ブラウザから「localhost」ではなく **EC2 のパブリック IP** でアクセスする場合は、下記 B で `VITE_API_URL=http://<EC2_PUBLIC_IP>:3000` のようにビルドし直す必要があります。

##### オプション B: 本番用 .env でドメイン・API URL を指定

```bash
cd ~/myskin

# EC2 のパブリック IP を取得（ドメイン未使用時）
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# ドメイン使用時は VITE_API_URL を本番 API の URL に
cat > .env << 'EOF'
# フロントビルド時の API URL（ブラウザから叩く URL）
# ドメイン使用: https://api.todokizamu.me
# IP のみ: http://<EC2_IP>:3000
VITE_API_URL=http://localhost:3000
EOF

# ドメインで運用する場合は .env を編集
nano .env
# VITE_API_URL=https://api.todokizamu.me に変更など
```

##### docker-compose で .env を読む場合の例（本番用）

`docker-compose.prod.yml` を用意する場合は、フロントのビルド引数に `.env` の `VITE_API_URL` を渡します。

```bash
# 例: .env に VITE_API_URL=https://api.todokizamu.me を書いた場合
docker compose --env-file .env build frontend --build-arg VITE_API_URL=https://api.todokizamu.me
docker compose up -d
```

または、既存の `docker-compose.yml` の `frontend` の `build.args.VITE_API_URL` を本番の API URL に書き換えてから:

```bash
docker compose up -d --build
```

#### 3.3 コンテナの起動

```bash
cd ~/myskin

# ビルド＆起動
docker compose up -d --build

# ログ確認
docker compose logs -f
```

初回は MySQL の初期化（myskin_seed.sql 実行）で数十秒かかることがあります。API は DB のヘルスチェック通過後に起動します。

#### 3.4 動作確認

```bash
# EC2 のパブリック IP を取得
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# API（商品一覧）
curl -s "http://${EC2_IP}:3000/api/products" | head -c 200

# フロント（HTML が返れば OK）
curl -sI "http://${EC2_IP}:8080"
```

**ブラウザでのアクセス**:
- **フロント**: `http://<EC2_PUBLIC_IP>:8080`
- **API**: `http://<EC2_PUBLIC_IP>:3000`

---

### ステップ 4: ドメイン・Cloudflare・Nginx の設定（オプション）

ドメインでアクセスする場合（例: `https://todokizamu.me`, `https://api.todokizamu.me`）は、Cloudflare + Nginx のリバースプロキシを設定します。

#### 4.1 Cloudflare の設定

1. **Cloudflare にサイトを追加**
   - [Cloudflare Dashboard](https://dash.cloudflare.com) → 「サイトを追加」
   - ドメインを入力し、ネームサーバーを Cloudflare に切り替え

2. **DNS レコードの追加**

   | タイプ | 名前 | コンテンツ           | プロキシ |
   |--------|------|----------------------|----------|
   | A      | `@`  | `<EC2_パブリックIP>` | プロキシ済み（オレンジの雲） |
   | A      | `api`| `<EC2_パブリックIP>` | プロキシ済み |

3. **SSL/TLS**
   - **SSL/TLS** → **概要** → 暗号化モード: **フレキシブル** または **フル**

#### 4.2 ポート 80 の空き確認と httpd の停止（必要な場合）

```bash
sudo ss -tlnp | grep :80

# httpd が 80 を使っている場合
sudo systemctl stop httpd
sudo systemctl disable httpd
```

#### 4.3 Nginx のインストールとリバースプロキシ設定

```bash
sudo dnf install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

**フロント用** `/etc/nginx/conf.d/myskin-front.conf`:

```nginx
server {
    listen 80;
    server_name todokizamu.me www.todokizamu.me;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**API 用** `/etc/nginx/conf.d/myskin-api.conf`:

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

```bash
sudo nginx -t
sudo systemctl reload nginx
```

#### 4.4 本番用フロントの再ビルド（VITE_API_URL をドメインに）

ドメインで API にアクセスする場合は、フロントのビルド時に `VITE_API_URL` を本番の API URL にします。

```bash
cd ~/myskin

# 例: api.todokizamu.me で API を公開する場合
docker compose build frontend --build-arg VITE_API_URL=https://api.todokizamu.me --no-cache
docker compose up -d
```

#### 4.5 API の CORS（ALLOWED_ORIGINS）

Docker Compose で API の環境変数 `ALLOWED_ORIGINS` に本番フロントの URL を入れます。  
`docker-compose.yml` の `api` の `environment` を編集するか、本番用に上書きします。

```yaml
# 例
environment:
  ALLOWED_ORIGINS: https://todokizamu.me,https://www.todokizamu.me
```

変更後は `docker compose up -d` で API コンテナを再作成してください。

---

## 💰 コスト見積もり（AWS Academy）

### EC2 t3.small
- **時間あたり**: 約 $0.0208
- **1 日（24 時間）**: 約 $0.50
- **1 ヶ月（30 日）**: 約 $15

### 合計見積もり
- **最小**: 約 $15〜30/月（EC2 t3.small〜t3.medium のみ）
- データ転送・EBS を含めても、小規模であれば $50 以内に収まりやすいです。

**注意**: AWS Academy のクレジット（$50〜200/月程度）内で運用するため、使用量の監視を推奨します。

---

## 🔧 トラブルシューティング

### 1. Cloudflare エラー 522（Connection timed out）

- **意味**: Cloudflare から EC2（オリジン）への接続がタイムアウトしている状態です。
- **確認**:
  1. EC2 が running か
  2. セキュリティグループで 80 / 443 が 0.0.0.0/0 で開いているか
  3. Cloudflare の A レコードが **現在の EC2 のパブリック IP** を指しているか（再起動で IP が変わっていることがある）
  4. EC2 上で Nginx が動いているか: `sudo systemctl status nginx`
  5. EC2 上で Docker コンテナが動いているか: `docker compose ps`

詳しくはプロジェクト内の **DEPLOYMENT.md「10. Cloudflare を使う場合」** を参照してください。

### 2. フロントから API にアクセスできない（CORS / 404）

- **CORS**: API の `ALLOWED_ORIGINS` に、ブラウザで開いているフロントの URL（例: `https://todokizamu.me`）が含まれているか確認。
- **404**: Nginx の `proxy_pass` が `http://127.0.0.1:3000`（または `http://myskin_api`）になっているか確認。

### 3. コンテナが起動しない / API が DB に接続できない

```bash
# ログ確認
docker compose logs api
docker compose logs db

# DB のヘルス確認
docker compose exec db mysqladmin ping -h localhost -uroot -prootpass
```

- API は `db` のヘルスチェック通過後に起動します。DB がまだ立ち上がっていない場合は数十秒待ってから再度 `docker compose ps` を確認してください。
- パスワードは `docker-compose.yml` の `db` の `MYSQL_*` と、`api` の `DB_*` が一致しているか確認してください。

### 4. ディスク容量不足（no space left on device）

```bash
df -h
docker system df
docker system prune -a --volumes
```

不要なイメージ・ボリュームを削除し、必要に応じて EBS ボリュームを拡張してください。

### 5. 静的ファイル（フロント）が 403 / 404

- Docker の Nginx はコンテナ内の `/usr/share/nginx/html` を配信しています。ビルドが成功していれば、`docker compose up -d --build` で再ビルド・再起動すれば解消することが多いです。
- ドメイン経由で 403 の場合は、Nginx の `proxy_pass` が `http://127.0.0.1:8080` になっているか確認してください。

---

## 🔒 セキュリティチェックリスト

- [ ] セキュリティグループで SSH (22) を自分の IP のみに制限（可能な範囲で）
- [ ] DB パスワードを本番用に強力なものに変更（`docker-compose.yml` および API の `DB_PASSWORD`）
- [ ] `.env` が Git にコミットされていないことを確認
- [ ] 本番では `ALLOWED_ORIGINS` に必要なフロント URL のみを記載

---

## 💡 重要な注意事項

1. **AWS Academy のクレジット**: 使用量を定期的に確認してください。
2. **インスタンスの停止**: 使わない時間は EC2 を停止するとコスト削減になります（EBS は課金が続きます）。
3. **データの永続化**: Docker のボリューム（`myskin_mysql_data`, `myskin_api_uploads`）は EC2 のディスクに保存されます。インスタンスを削除するとデータも消えるため、重要なデータはバックアップを検討してください。
4. **パブリック IP**: 再起動で EC2 のパブリック IP が変わります。ドメインを使う場合は Elastic IP の利用を推奨します。

---

## 📚 参考資料・関連ドキュメント

- [AWS Academy Learner Lab](https://awsacademy.instructure.com/)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- 本プロジェクト: **DEPLOYMENT.md**（EC2 手動構築・Nginx 詳細・Cloudflare 522 対策など）
