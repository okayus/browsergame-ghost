# サーバー起動状態の確認ガイド

## 1. プロセス確認コマンド

### フロントエンド（Vite）の確認

```bash
# ポート5173でリッスンしているプロセスを確認
lsof -i :5173

# または
netstat -tlnp | grep 5173

# プロセス名で検索
ps aux | grep vite
```

### バックエンド（Wrangler/Workers）の確認

```bash
# ポート8787でリッスンしているプロセスを確認
lsof -i :8787

# または
netstat -tlnp | grep 8787

# プロセス名で検索
ps aux | grep wrangler
```

## 2. curl/HTTPリクエストで確認

### フロントエンド

```bash
# フロントエンドが応答するか確認
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173

# 200が返ればOK
```

### バックエンド

```bash
# バックエンドAPIが応答するか確認
curl -s -o /dev/null -w "%{http_code}" http://localhost:8787/api/health

# または単純にアクセス
curl http://localhost:8787
```

## 3. pnpmで確認

```bash
# 実行中のスクリプトを確認（別ターミナルで実行中の場合は表示されない）
pnpm list --depth=0
```

## 4. 一括確認スクリプト

```bash
# フロントエンドとバックエンドの状態を一度に確認
echo "=== Frontend (port 5173) ===" && \
(lsof -i :5173 > /dev/null 2>&1 && echo "✅ Running" || echo "❌ Not running") && \
echo "" && \
echo "=== Backend (port 8787) ===" && \
(lsof -i :8787 > /dev/null 2>&1 && echo "✅ Running" || echo "❌ Not running")
```

## 5. サーバー起動コマンド

### 起動していない場合

```bash
# フロントエンド起動
pnpm --filter=frontend dev

# バックエンド起動（別ターミナルで）
pnpm --filter=backend dev
```

### 両方同時に起動（ルートから）

```bash
# 両方のdevスクリプトを並列実行
pnpm dev
```

## 6. サーバー停止方法

### 特定ポートのプロセスを停止

```bash
# ポート5173のプロセスを停止
kill $(lsof -t -i :5173)

# ポート8787のプロセスを停止
kill $(lsof -t -i :8787)
```

### 強制停止（応答しない場合）

```bash
kill -9 $(lsof -t -i :5173)
kill -9 $(lsof -t -i :8787)
```

## 7. よくある問題

| 症状 | 原因 | 対処法 |
|------|------|--------|
| ポートが使用中 | 前回のプロセスが残っている | `kill $(lsof -t -i :PORT)` で停止 |
| 接続拒否 | サーバーが起動していない | `pnpm dev` で起動 |
| CORS エラー | バックエンドが起動していない | バックエンドを起動 |

## 8. デフォルトポート一覧

| サービス | ポート | URL |
|----------|--------|-----|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Backend (Wrangler) | 8787 | http://localhost:8787 |
