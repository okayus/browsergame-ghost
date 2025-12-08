# Technology Stack

## Architecture

モノレポ構成の2Dブラウザゲーム。バックエンドはCloudflare Workers（ゲームデータ・セーブ管理）、フロントエンドはCloudflare Pages（ゲームUI・描画）。

## Core Technologies

- **Language**: TypeScript (strict mode)
- **Package Manager**: pnpm (v10.11.1+) with workspaces
- **Runtime**: Cloudflare Workers (Backend) / Browser (Frontend)

### Backend
- **Framework**: Hono (軽量Webフレームワーク)
- **ORM**: Drizzle ORM
- **Database**: Cloudflare D1 (SQLite互換)
- **Validation**: Zod

### Frontend
- **Framework**: React 19
- **Bundler**: Vite 7
- **Styling**: Tailwind CSS 4.x
- **API Client**: Hono RPC Client (`hc`)
- **Auth**: Clerk (`@clerk/clerk-react`)
- **Rendering**: CSS Grid + Tailwind（2D描画）

### Backend Auth
- **Auth Middleware**: `@hono/clerk-auth`

### CI/CD
- **Pipeline**: GitHub Actions
- **Deploy**: Cloudflare Pages (Frontend) / Cloudflare Workers (Backend)

## Key Libraries

| Library | Purpose |
|---------|---------|
| `hono` | Webフレームワーク（バックエンド・クライアント両対応） |
| `drizzle-orm` | 型安全なORM（ゴースト・プレイヤーデータ永続化） |
| `zod` | スキーマ検証（フロント/バックエンド共通） |
| `@hono/zod-validator` | リクエストバリデーション |
| `@clerk/clerk-react` | フロントエンド認証 |
| `@hono/clerk-auth` | バックエンド認証ミドルウェア |
| `tailwindcss` | ユーティリティファーストCSS |

## Development Standards

### Type Safety
- TypeScript strict mode 必須
- `noUnusedLocals`, `noUnusedParameters` 有効
- Drizzle ORMの推論型を活用
- ゲームロジックの型定義を厳密に

### Code Quality
- **Linter/Formatter**: Biome (ESLint + Prettierの代替)
- インデント: 2スペース
- クォート: ダブルクォート
- 行幅: 100文字

### Testing
- **Framework**: Vitest
- Backend: ユニットテスト (`*.test.ts`)
- Frontend: React Testing Library + jsdom
- ゲームロジック: 純粋関数としてテスト可能に設計

## Development Environment

### Required Tools
- Node.js 20+
- pnpm 10.11.1+
- Wrangler CLI (Cloudflare Workers開発)

### Common Commands
```bash
# Backend
pnpm --filter=backend dev          # 開発サーバー起動
pnpm --filter=backend test         # テスト実行
pnpm --filter=backend typecheck    # 型チェック
pnpm --filter=backend check        # Biome lint + format

# Frontend
pnpm --filter=frontend dev         # Vite開発サーバー
pnpm --filter=frontend test        # テスト実行
pnpm --filter=frontend build       # 本番ビルド

# Database
pnpm --filter=backend db:generate  # マイグレーション生成
pnpm --filter=backend db:migrate:local  # ローカルDB適用
```

## Key Technical Decisions

1. **Hono over Express**: エッジ環境との互換性、軽量さ、型安全なRPCクライアント
2. **Drizzle over Prisma**: D1との親和性、軽量なバンドルサイズ
3. **Biome over ESLint+Prettier**: 設定の簡素化、高速な実行
4. **pnpm workspaces**: 効率的な依存関係管理、厳密なパッケージ分離
5. **ゲームロジック分離**: UI層とロジック層を分離し、テスト・再利用性を向上

---
_Document standards and patterns, not every dependency_
