# Noriuchi Log

パチンコ・パチスロのノリ打ち収支を共有する Next.js + Prisma + Auth.js プロジェクト。

## 環境変数

`.env` に最低限以下を設定してください（`.env.local` は Prisma CLI が読み込まない点に注意）。

```
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
SHADOW_DATABASE_URL=postgresql://user:pass@host/shadow?sslmode=require
AUTH_SECRET=ランダム32文字以上
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
```

## DB / Prisma 運用手順

- 依存インストール: `pnpm install`
- Prisma クライアント生成（環境変数をセットした状態で）: `pnpm prisma generate`

### 開発（Neon development ブランチ想定）
1. `.env` を開発用 `DATABASE_URL` と `SHADOW_DATABASE_URL` に設定（shadow は必ず別ブランチ/DB）。
2. スキーマ変更後にマイグレーション作成＋適用:
   ```bash
   pnpm prisma migrate dev --name <change>
   ```
   これで `prisma/migrations` が更新され、development + shadow に適用されます。

### 本番適用（Neon production ブランチ想定）
1. `.env` もしくはデプロイ環境の `DATABASE_URL` を production ブランチにセット。
2. 既存マイグレーションを適用:
   ```bash
   pnpm prisma migrate deploy
   ```
   ※ deploy は shadow を使いません。必要なら別途 `SHADOW_DATABASE_URL` を用意しますが必須ではありません。

### ワンライナーで環境を指定して実行したい場合

```
DATABASE_URL=... SHADOW_DATABASE_URL=... pnpm prisma migrate dev --name add_field
```

### よくあるエラー
- `Connection url is empty`: Prisma は `.env.local` を読まないため `DATABASE_URL` が空。`.env` にコピーするか実行時に環境変数を渡してください。
- `Unknown property datasourceUrl provided to PrismaClient constructor`: Prisma 7 では `datasourceUrl` は廃止。`@prisma/adapter-pg` + `pg` を使った `adapter` 初期化に修正済みです。

## 開発サーバー

```
pnpm dev
```

## ビルド

```
pnpm build
pnpm start
```
