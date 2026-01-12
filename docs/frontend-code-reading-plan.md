# フロントエンド コードリーディング計画

## 概要

### 対象プロジェクト
- **名称**: Ghost（ゴースト捕獲・育成バトルゲーム）
- **リポジトリパス**: `packages/frontend/`
- **規模**: 53ファイル / 約7,400行（テストファイルを除く）

### 技術スタック
| カテゴリ | 技術 |
|---------|------|
| フレームワーク | React 19 |
| 言語 | TypeScript (strict mode) |
| ビルド | Vite 7 |
| スタイリング | Tailwind CSS 4 |
| 状態管理 | TanStack Query + カスタムフック |
| 認証 | Clerk (`@clerk/clerk-react`) |
| API通信 | Hono RPC Client (`hc`) |
| テスト | Vitest + React Testing Library + Playwright |

---

## 調査の目的（Why）

1. **アーキテクチャ理解**: React 19 + Hono RPC という比較的新しい構成のパターンを学ぶ
2. **ゲームUI設計の把握**: ターン制バトルゲームのUI状態管理がどう実装されているか
3. **コードベースへの貢献準備**: 今後の機能追加・バグ修正のための地図を作る
4. **ベストプラクティスの発見**: 参考にできるパターン・改善すべき点の特定

---

## 調査対象（What）

### ディレクトリ構造と優先度

```
src/
├── main.tsx                      [優先度: 高] エントリーポイント
├── App.tsx                       [優先度: 高] ルートコンポーネント
├── api/                          [優先度: 高] バックエンド通信層
│   ├── client.ts
│   ├── useApiClient.ts
│   ├── useSaveData.ts
│   └── index.ts
├── hooks/                        [優先度: 高] ゲーム状態管理の中核
│   ├── useAuthState.ts
│   ├── useBattleState.ts
│   ├── useBattleHandlers.ts
│   ├── useBattleItem.ts
│   ├── useBattleEndSync.ts
│   ├── useBattleTransition.ts
│   ├── useCaptureHandlers.ts
│   ├── useGameState.ts
│   ├── useInventoryState.ts
│   ├── useMapState.ts
│   ├── useScreenTransition.ts
│   └── index.ts
├── providers/                    [優先度: 中] コンテキストプロバイダー
│   └── QueryProvider.tsx
├── components/                   [優先度: 中] UIコンポーネント群
│   ├── auth/                     認証系画面
│   ├── battle/                   バトル画面（最大のコンポーネント群）
│   ├── error/                    エラー処理
│   ├── game/                     ゲーム共通コンポーネント
│   ├── map/                      マップ画面
│   ├── menu/                     メニュー画面
│   └── party/                    パーティ管理画面
└── vite-env.d.ts                 [優先度: 低] Vite型定義
```

---

## 調査方法（How）

### フェーズ1: エントリーポイントからのトップダウン調査

**目的**: アプリケーション全体の流れを把握

| 順序 | ファイル | 確認ポイント |
|------|----------|--------------|
| 1 | `main.tsx` | React アプリのマウント、プロバイダー構成 |
| 2 | `App.tsx` | ルーティング、画面切り替えロジック |
| 3 | `providers/QueryProvider.tsx` | TanStack Query の設定 |

### フェーズ2: API層の調査

**目的**: バックエンドとの通信パターンを理解

| 順序 | ファイル | 確認ポイント |
|------|----------|--------------|
| 1 | `api/client.ts` | Hono RPC クライアントの初期化 |
| 2 | `api/useApiClient.ts` | クライアントのフック化 |
| 3 | `api/useSaveData.ts` | セーブデータの取得・更新ロジック |

### フェーズ3: 状態管理フックの調査（コア）

**目的**: ゲームロジックと状態管理の中核を理解

調査順序（依存関係を考慮）:

```
useAuthState (認証状態)
    ↓
useGameState (ゲーム全体状態)
    ├── useMapState (マップ探索)
    ├── useInventoryState (アイテム管理)
    └── useBattleState (バトル状態)
            ├── useBattleHandlers (バトルアクション)
            ├── useBattleItem (アイテム使用)
            ├── useCaptureHandlers (捕獲処理)
            ├── useBattleTransition (画面遷移)
            └── useBattleEndSync (バトル終了同期)
```

### フェーズ4: コンポーネント調査

**目的**: UI実装パターンの理解

#### 4-1: ゲーム共通コンポーネント
- `GameContainer.tsx` - ゲーム画面のラッパー
- `MessageBox.tsx` - メッセージ表示
- `ScreenTransition.tsx` - 画面遷移アニメーション
- `SaveStatus.tsx` - セーブ状態表示

#### 4-2: バトル画面（最大のコンポーネント群）
```
BattleScreen.tsx (メイン)
├── GhostDisplay.tsx       (ゴースト表示)
├── CommandPanel.tsx       (コマンド選択)
├── SkillSelectPanel.tsx   (技選択)
├── ItemSelectPanel.tsx    (アイテム選択)
├── CaptureItemPanel.tsx   (捕獲アイテム選択)
├── GhostSwapPanel.tsx     (ゴースト交代)
├── VictoryPanel.tsx       (勝利時)
├── DefeatPanel.tsx        (敗北時)
├── EscapeResultPanel.tsx  (逃走結果)
├── CaptureSuccessPanel.tsx(捕獲成功)
├── CaptureFailurePanel.tsx(捕獲失敗)
└── MoveLearnPanel.tsx     (技習得)
```

#### 4-3: その他画面
- `auth/` - WelcomeScreen, LoadingScreen, ErrorScreen
- `map/` - MapScreen, MapGrid
- `menu/` - MenuScreen, SaveFeedback
- `party/` - PartyScreen, GhostDetailPanel, GhostSummaryCard

---

## 調査時の記録テンプレート

各ファイル調査後、以下を記録:

```markdown
### [ファイル名]

**責務**: （このファイルが担う役割）

**依存関係**:
- インポート:
- エクスポート:

**主要な関数/コンポーネント**:
1.

**設計パターン**:
-

**気づき・疑問**:
-
```

---

## 計画変更の条件

### 調査順序を変更する場合

1. **想定外の依存関係発見時**
   - 例: `useGameState`が`useBattleState`に依存していた場合→バトル系を先に調査

2. **共有モジュール発見時**
   - 例: 多くのファイルが参照するユーティリティ発見→先に調査

3. **型定義ファイルの発見時**
   - 例: `@ghost-game/shared`パッケージに重要な型がある→先に調査

### 調査範囲を拡大する場合

1. **バックエンドとの連携が密接な場合**
   - `packages/backend/`の該当ハンドラーも確認

2. **共有パッケージへの依存が大きい場合**
   - `packages/shared/`（存在すれば）を調査対象に追加

3. **テストコードに重要なドキュメント価値がある場合**
   - `*.test.tsx`を調査対象に追加

### 調査範囲を縮小する場合

1. **ボイラープレートが多い場合**
   - 類似パターンのコンポーネントはサンプルのみ調査

2. **時間制約がある場合**
   - フェーズ1-3（エントリーポイント〜フック）を優先

---

## 調査完了後のアウトプット

1. **アーキテクチャ図**: コンポーネント・フック間の依存関係図
2. **状態フロー図**: ゲーム状態の遷移図（特にバトル）
3. **API通信フロー**: フロントエンド⇔バックエンドの通信パターン
4. **気づきリスト**: 良いパターン・改善候補・疑問点

---

## 見積もり

| フェーズ | ファイル数 | 備考 |
|----------|-----------|------|
| 1. エントリーポイント | 3 | 基盤理解 |
| 2. API層 | 4 | 通信パターン |
| 3. 状態管理フック | 12 | **最重要** |
| 4. コンポーネント | 34 | UI実装 |

**推奨進め方**: フェーズ1-3を完了後、フェーズ4は必要に応じて深掘り

---

*作成日: 2026-01-12*
