# Project Structure

## Organization Philosophy

**pnpm workspace モノレポ**: `packages/` 配下にバックエンドとフロントエンドを分離。ゲームロジックはフロントエンド中心、データ永続化はバックエンドで担当。

## Directory Patterns

### Backend (`packages/backend/`)
**Purpose**: Cloudflare Workers上で動作するAPI（セーブデータ・マスタデータ管理）
**Key directories**:
- `src/` - ソースコード
- `src/handlers/` - APIエンドポイントのハンドラー
- `src/db/` - データベーススキーマとヘルパー
- `src/types/` - 型定義（Wrangler生成含む）
- `drizzle/` - マイグレーションファイル

### Frontend (`packages/frontend/`)
**Purpose**: React SPAゲームアプリケーション（Cloudflare Pages）
**想定ディレクトリ**:
- `src/` - Reactコンポーネントとロジック
- `src/components/` - UIコンポーネント（マップ、バトル画面など）
- `src/game/` - ゲームロジック（バトル計算、タイプ相性など）
- `src/hooks/` - カスタムフック（ゲーム状態管理）
- `src/types/` - ゲーム固有の型定義
- `src/data/` - マスタデータ（ゴースト種類、技、アイテム）
- `public/` - 静的ファイル（画像、音声）

## Naming Conventions

- **Files**: camelCase (`battleSystem.ts`, `ghostData.ts`)
- **Components**: PascalCase (`BattleScreen.tsx`, `MapGrid.tsx`)
- **Test files**: `*.test.ts` / `*.test.tsx`
- **Type definitions**: `*.d.ts`
- **定数/マスタデータ**: UPPER_SNAKE_CASE または PascalCase

## Import Organization

```typescript
// Backend: 相対インポート
import { createDB } from "./db";
import { getSaveData } from "./handlers/save";

// Frontend: バックエンド型を参照
import type { AppType } from "../../backend/src/index";

// Frontend: ゲームロジック
import { calculateDamage } from "./game/battle";
import { GHOST_TYPES } from "./data/ghostTypes";
```

**パッケージ間参照**:
- Frontend → Backend: TypeScript project referencesで型を共有
- `tsconfig.json`の`references`でビルド順序を制御

## Code Organization Principles

1. **Handler Pattern**: 各APIエンドポイントは`handlers/`に個別ファイル
2. **型エクスポート**: `AppType`をエクスポートしてクライアントで型推論
3. **DB抽象化**: `createDB`ファクトリでD1バインディングをラップ
4. **ゲームロジック分離**: `game/`に純粋関数として実装（UIに依存しない）
5. **マスタデータ管理**: `data/`にゴースト・技・アイテムの定義を集約
6. **設定分離**: Biome、TypeScript、Viteは各パッケージで個別設定

## Configuration Files

| File | Purpose |
|------|---------|
| `wrangler.jsonc` | Cloudflare Workers設定 |
| `biome.json` | Linter/Formatter設定 |
| `tsconfig.json` | TypeScript設定 |
| `vite.config.ts` | Vite + Vitest設定 |

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
