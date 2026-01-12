# フェーズ1: エントリーポイント調査結果

## 調査概要

| 項目 | 内容 |
|------|------|
| 調査日 | 2026-01-12 |
| 対象ファイル | `main.tsx`, `App.tsx`, `QueryProvider.tsx` |
| 総行数 | 約540行 |

---

## 調査目的（Why）

- アプリケーション全体の起動フローを理解する
- プロバイダー構成（認証・データ取得）の把握
- 画面遷移とイベントハンドリングの全体像を掴む

---

## 調査方法（How）

1. `main.tsx`からReactアプリのマウント処理を確認
2. プロバイダーのネスト構造を追跡
3. `App.tsx`で認証フロー・画面切り替えロジックを分析
4. 使用されているフック・コンポーネントの依存関係を洗い出し

---

## 調査結果（What）

### 1. main.tsx（27行）

**責務**: Reactアプリケーションのマウントとプロバイダー構成

**プロバイダーのネスト構造**:
```
<StrictMode>
  <ClerkProvider>        ← 認証プロバイダー（Clerk）
    <QueryProvider>      ← データ取得プロバイダー（TanStack Query）
      <App />
    </QueryProvider>
  </ClerkProvider>
</StrictMode>
```

**設計パターン**:
- 環境変数からClerk Publishable Keyを取得（`VITE_CLERK_PUBLISHABLE_KEY`）
- 必須の設定が欠けている場合は早期にエラーをスロー（fail-fast）

**気づき**:
- 認証がQueryProviderより外側 → 認証トークンをAPI呼び出しで使う設計

---

### 2. QueryProvider.tsx（24行）

**責務**: TanStack Queryの設定とプロバイダー提供

**設定内容**:
```typescript
{
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5分間キャッシュ有効
      retry: 1,                   // 失敗時1回リトライ
    },
  },
}
```

**設計パターン**:
- シングルトンのQueryClientをモジュールスコープで生成
- 子コンポーネントに透過的に渡す薄いラッパー

**気づき**:
- staleTime 5分は比較的長い → ゲームデータは頻繁に変わらない前提
- リトライ1回のみ → ネットワークエラーに対する耐性は低め

---

### 3. App.tsx（487行）⚠️ 最大のファイル

**責務**:
- 認証状態に応じた画面切り替え
- ゲーム全体の状態オーケストレーション
- 全画面のレンダリング分岐

**構造**:

```
App (メイン)
├── 認証読み込み中 → LoadingScreen
├── 未認証 → WelcomeScreen
└── 認証済み → ErrorBoundary + Suspense
                  └── AuthenticatedContent
```

#### AuthenticatedContent（約400行）

**使用しているフック（14個）**:

| フック | 責務 |
|--------|------|
| `useSaveDataQuery` | セーブデータ取得 |
| `useInitializePlayerMutation` | 新規プレイヤー初期化 |
| `useSaveDataMutation` | セーブデータ更新 |
| `useAutoSave` | 自動セーブ管理 |
| `useGameState` | ゲーム全体状態（画面、パーティ、インベントリ） |
| `useMapState` | マップ・プレイヤー位置 |
| `useBattleState` | バトル状態（フェーズ、ゴースト） |
| `useBattleEndSync` | バトル終了時のHP同期 |
| `useBattleTransition` | バトル画面遷移 |
| `useBattleHandlers` | バトルコマンド処理 |
| `useCaptureHandlers` | ゴースト捕獲処理 |
| `useAuthState` | 認証状態 |
| `useClerk` | Clerk操作 |

**画面状態（currentScreen）**:
- `"loading"` - ローディング中
- `"welcome"` - ログイン前
- `"map"` - マップ探索
- `"battle"` - バトル中
- `"menu"` - メニュー表示
- `"party"` - パーティ管理

**イベントハンドラ（主要なもの）**:

| ハンドラ | トリガー | 処理内容 |
|----------|----------|----------|
| `handleMove` | WASD/矢印キー | マップ移動 |
| `handleEncounter` | 草むら移動 | 野生ゴースト遭遇→バトル開始 |
| `handleOpenMenu` | Escapeキー | メニュー画面表示 |
| `handleBattleCommand` | バトル中選択 | コマンド実行 |
| `handleSave` | メニューからセーブ | 手動セーブ実行 |
| `handleKeyDown` | キー入力 | 画面別キー処理分岐 |

**外部パッケージ依存**:

`@ghost-game/shared`から多数インポート:
- 型: `GhostSpecies`, `GhostType`, `OwnedGhost`, `PlayerData`
- 関数: `generateWildGhost`, `getGhostSpeciesById`, `getMapById`
- 定数: `ALL_GHOST_SPECIES`, `ALL_MOVES`

**設計パターン**:
- **Compound Components**: BattleScreenにcommandPanelをpropsで渡す
- **Conditional Rendering**: 画面状態による描画分岐
- **カスタムフックによる関心分離**: 状態管理をフックに委譲

**気づき・課題**:

1. **App.tsxが肥大化** - 約400行がAuthenticatedContentに集中
2. **フック依存が多い** - 14個のフックを使用、責務の整理が必要
3. **sharedパッケージが重要** - ゲームロジックの中核がここにある

---

## 依存関係図

```
main.tsx
    │
    ├── ClerkProvider (認証)
    │
    ├── QueryProvider (データ取得)
    │       │
    │       └── QueryClient (staleTime: 5分, retry: 1)
    │
    └── App.tsx
            │
            ├── useAuthState → 認証状態判定
            │
            ├── [未認証] → WelcomeScreen
            │
            └── [認証済み] → ErrorBoundary + Suspense
                              │
                              └── AuthenticatedContent
                                      │
                                      ├── useSaveDataQuery
                                      ├── useAutoSave
                                      ├── useGameState
                                      ├── useMapState
                                      ├── useBattleState
                                      ├── useBattleHandlers
                                      ├── useCaptureHandlers
                                      └── ... (他フック)
```

---

## 計画への影響

### 発見事項による計画変更

1. **`@ghost-game/shared`パッケージを調査対象に追加**
   - 理由: ゲームロジックの中核（ダメージ計算、捕獲、タイプ相性など）がここにある
   - App.tsxから多くの型・関数をインポートしている

2. **フェーズ3（フック調査）の優先度を上げる**
   - 理由: App.tsxの複雑さの大部分はフックに委譲されている
   - フックを理解しないとApp.tsxの動作が把握できない

3. **App.tsxは「接着剤」として理解**
   - 単独で深追いするより、フックとコンポーネントを理解した後に再確認

---

## 次のステップ

- [x] フェーズ1完了
- [ ] フェーズ2: API層（`api/`ディレクトリ）
- [ ] フェーズ2.5（追加）: `@ghost-game/shared`の概要把握
- [ ] フェーズ3: 状態管理フック
- [ ] フェーズ4: UIコンポーネント
