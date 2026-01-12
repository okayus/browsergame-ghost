# フェーズ2: API層調査結果

## 調査概要

| 項目 | 内容 |
|------|------|
| 調査日 | 2026-01-12 |
| 対象ファイル | `api/client.ts`, `api/useApiClient.ts`, `api/useSaveData.ts`, `api/index.ts` |
| 総行数 | 約360行 |

---

## 調査目的（Why）

- フロントエンド↔バックエンド間の通信パターンを理解する
- Hono RPC Clientの使い方を把握する
- セーブデータの永続化・同期戦略を理解する

---

## 調査方法（How）

1. `client.ts`でHono RPCクライアントの初期化方法を確認
2. `useApiClient.ts`で認証トークンの注入パターンを確認
3. `useSaveData.ts`でデータ取得・保存・自動セーブのフローを分析
4. `index.ts`で公開APIを確認

---

## 調査結果（What）

### 1. client.ts（24行）

**責務**: Hono RPC クライアントの生成

**コード構造**:
```typescript
import { hc } from "hono/client";
import type { AppType } from "../../../backend/src/index";

// 2つのファクトリ関数を提供
export function createApiClient() { ... }                    // 認証なし
export function createAuthenticatedApiClient(token) { ... }  // 認証あり
```

**設計パターン**:

| パターン | 説明 |
|----------|------|
| **Factory Pattern** | クライアントインスタンスの生成を関数で抽象化 |
| **Cross-Package Type Import** | バックエンドの`AppType`を直接インポートして型安全性を確保 |

**重要なポイント**:
- `hc<AppType>(baseUrl)` でバックエンドの型定義を活用
- 認証トークンはHTTP Headerの`Authorization: Bearer {token}`で送信
- 環境変数`VITE_API_BASE_URL`でAPIエンドポイントを設定

**気づき**:
- バックエンドとフロントエンドが型を共有 → APIの型安全性が高い
- 認証なしクライアントは現状未使用の可能性

---

### 2. useApiClient.ts（19行）

**責務**: 認証トークン付きAPIクライアントを提供

**依存関係**:
```
useApiClient
├── @clerk/clerk-react (useAuth)
└── ./client (createAuthenticatedApiClient)
```

**フロー**:
```
1. useAuth()からgetToken()を取得
2. getApiClient()呼び出し時にトークンを取得
3. createAuthenticatedApiClientでクライアント生成
```

**設計パターン**:
- **Lazy Initialization**: クライアントは毎回生成される（トークン更新対応）
- **Hook Composition**: Clerk認証とHonoクライアントを組み合わせ

**気づき**:
- 毎回新しいクライアントを生成 → メモ化の余地あり？
- ただしトークンの有効期限を考慮すると、毎回取得が安全

---

### 3. useSaveData.ts（316行）⚠️ API層で最大

**責務**: セーブデータの取得・保存・自動セーブ・オフライン同期

#### 3-1. 定数・ユーティリティ

```typescript
const AUTO_SAVE_INTERVAL = 30000;  // 30秒
const PENDING_CACHE_KEY = "ghost-game-pending-save";
```

ローカルストレージ操作（3関数）:
- `loadPendingCache()` - 保留キャッシュ読み込み
- `savePendingCache()` - 保留キャッシュ保存
- `clearPendingCache()` - 保留キャッシュ削除

#### 3-2. useSaveDataQuery

**責務**: セーブデータの取得（Suspense対応）

```typescript
useSuspenseQuery({
  queryKey: ["saveData"],
  queryFn: async () => {
    const client = await getApiClient();
    const response = await client.api.save.$get();
    // 404 → null（新規プレイヤー）
    // OK → PlayerData
  },
});
```

**特徴**:
- `useSuspenseQuery`使用 → 親のSuspenseで待機
- 404を正常ケースとして処理（新規プレイヤー）

#### 3-3. useSaveDataMutation

**責務**: セーブデータの更新

```typescript
useMutation({
  mutationFn: async (data) => {
    const response = await client.api.save.$post({ json: data });
    clearPendingCache();  // 成功時はキャッシュクリア
    return data;
  },
  onSuccess: (data) => {
    queryClient.setQueryData(...)  // キャッシュ更新
  },
  onError: (error, data) => {
    savePendingCache(...)  // 失敗時はローカル保存
  },
});
```

**エラーハンドリング**:
- 成功 → QueryClientキャッシュ更新 + ローカルキャッシュクリア
- 失敗 → ローカルストレージに保留データとして保存

#### 3-4. useInitializePlayerMutation

**責務**: 新規プレイヤーの初期化

```typescript
useMutation({
  mutationFn: async () => {
    await client.api.save.initialize.$post();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["saveData"] });
  },
});
```

#### 3-5. useAutoSave（メイン機能）

**責務**: 自動セーブ・オフライン同期の統合管理

**状態管理**:
| 状態 | 型 | 用途 |
|------|-----|------|
| `hasPendingCache` | boolean | 未同期データの有無 |
| `lastSavedAt` | Date \| null | 最終セーブ時刻 |
| `pendingSaveDataRef` | Ref | 次回セーブ予定データ |

**提供する関数**:

| 関数 | 用途 |
|------|------|
| `updatePendingSaveData` | セーブ予定データを更新（即時保存しない） |
| `executeAutoSave` | 自動セーブを実行 |
| `syncPendingCache` | オンライン復帰時に保留データを同期 |

**イベントリスナー**:

| イベント | 処理 |
|----------|------|
| `setInterval(30秒)` | 定期的な自動セーブ |
| `beforeunload` | ページ離脱前の処理（現状ログのみ） |
| `online` | オンライン復帰時に保留キャッシュ同期 |

**セーブフロー図**:

```
ゲーム操作
    │
    ▼
updatePendingSaveData()  ← データをRefに蓄積
    │
    │ [30秒経過]
    ▼
executeAutoSave()
    │
    ├─ [成功] → clearPendingCache() → setLastSavedAt()
    │
    └─ [失敗] → savePendingCache(localStorage)
                      │
                      │ [オンライン復帰]
                      ▼
               syncPendingCache() → サーバーに再送信
```

---

### 4. index.ts（11行）

**責務**: モジュールの公開API定義

**エクスポート一覧**:
```typescript
// 型
export type { ApiClient } from "./client";

// 関数
export { createApiClient, createAuthenticatedApiClient } from "./client";

// フック
export { useApiClient } from "./useApiClient";
export {
  SAVE_DATA_QUERY_KEY,
  useAutoSave,
  useInitializePlayerMutation,
  useSaveDataMutation,
  useSaveDataQuery,
} from "./useSaveData";
```

---

## 設計パターンまとめ

### 1. Hono RPC Client
```
Backend (Hono)           Frontend (Hono Client)
     │                         │
     │  AppType (型)           │
     └────────────────────────→│
                               │
     POST /api/save     ←──────│ client.api.save.$post()
     GET /api/save      ←──────│ client.api.save.$get()
```

**メリット**:
- 型安全なAPI呼び出し
- エンドポイントのtypoを防止
- レスポンス型の自動推論

### 2. オフラインファースト戦略

```
                 ┌─────────────────────────────────┐
                 │          localStorage           │
                 │   (ghost-game-pending-save)     │
                 └─────────────────────────────────┘
                        ↑ 失敗時保存    ↓ 復帰時同期
                        │               │
  ゲーム操作 → Ref蓄積 → 自動セーブ → サーバー
                 (30秒間隔)
```

### 3. Suspense統合

```
<Suspense fallback={<Loading />}>
  <Component />  ← useSuspenseQuery使用
</Suspense>
```

- データ取得中は自動的にfallback表示
- エラーはErrorBoundaryでキャッチ

---

## API エンドポイント一覧

| メソッド | パス | 用途 |
|----------|------|------|
| GET | `/api/save` | セーブデータ取得 |
| POST | `/api/save` | セーブデータ更新 |
| POST | `/api/save/initialize` | 新規プレイヤー初期化 |

---

## 気づき・課題

1. **オフライン対応が充実**: localStorageによる保留キャッシュ、オンライン復帰時の同期
2. **beforeunloadの課題**: 現状ログ出力のみ、`navigator.sendBeacon`の検討余地あり
3. **型安全性が高い**: Hono RPCにより、API呼び出しがコンパイル時に検証される
4. **30秒間隔の妥当性**: ゲームの特性（頻繁な状態変化）を考慮した設計

---

## 次のステップ

- [x] フェーズ1完了
- [x] フェーズ2完了
- [ ] フェーズ2.5: `@ghost-game/shared`パッケージ概要
- [ ] フェーズ3: 状態管理フック
- [ ] フェーズ4: UIコンポーネント
