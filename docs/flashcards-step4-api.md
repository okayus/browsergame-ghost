# Step 4 フラッシュカード - API通信

このフラッシュカードは、API通信（`client.ts`, `useApiClient.ts`, `useSaveData.ts`）を読むために必要な知識をカバーしています。

---

## 1. Hono Client (hc)

**Q: `hc<AppType>(API_BASE_URL)` は何をしている？**

<details>
<summary>Answer</summary>

**型安全なHTTPクライアントを作成**している。

```tsx
import { hc } from "hono/client";
import type { AppType } from "../../../backend/src/index";

const client = hc<AppType>(API_BASE_URL);
```

**Honoの特徴**:
- バックエンドの型定義を直接参照
- APIのパスと引数を型チェック
- レスポンスの型も自動推論

**使用例**:
```tsx
// バックエンドで定義されたエンドポイントを型安全に呼び出し
const response = await client.api.save.$get();
//                            ↑ パスが型で補完される

const result = await client.api.save.$post({
  json: { position, party, inventory }  // リクエストボディ
});
```

**メリット**:
- 存在しないエンドポイントを呼ぶとコンパイルエラー
- リクエスト/レスポンスの型が保証される

</details>

---

## 2. 認証トークンの付与

**Q: `Authorization: Bearer ${token}` ヘッダーは何のため？**

<details>
<summary>Answer</summary>

**APIリクエストに「誰からのリクエストか」を伝える**ため。

```tsx
export function createAuthenticatedApiClient(token: string | null) {
  return hc<AppType>(API_BASE_URL, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}
```

**認証の流れ**:
```
1. ユーザーがログイン
2. Clerkがトークンを発行
3. フロントエンドがトークンを取得
4. APIリクエストにトークンを付与
5. バックエンドがトークンを検証
6. 認証済みユーザーとして処理
```

**Bearer認証**:
- `Bearer` は「持参人」の意味
- トークンを持っている人がアクセス権を持つ
- HTTPヘッダーで送信

</details>

---

## 3. 非同期でトークンを取得

**Q: `getApiClient` が `async` 関数なのはなぜ？**

<details>
<summary>Answer</summary>

**トークンの取得が非同期処理だから**。

```tsx
export function useApiClient() {
  const { getToken } = useAuth();  // Clerkのフック

  const getApiClient = useCallback(async () => {
    const token = await getToken();  // トークン取得は非同期
    return createAuthenticatedApiClient(token);
  }, [getToken]);

  return { getApiClient };
}
```

**呼び出し側**:
```tsx
const client = await getApiClient();  // awaitが必要
const response = await client.api.save.$get();
```

**なぜトークン取得が非同期？**
- トークンの有効期限をチェック
- 期限切れなら自動更新
- Clerkサーバーと通信する可能性がある

</details>

---

## 4. async/awaitの基本

**Q: `async/await` を使ったAPI呼び出しのパターンは？**

<details>
<summary>Answer</summary>

```tsx
const loadSaveData = useCallback(async () => {
  // 1. 読み込み開始を通知
  setState((prev) => ({ ...prev, loading: true, error: null }));

  try {
    // 2. APIクライアントを取得
    const client = await getApiClient();

    // 3. APIを呼び出し
    const response = await client.api.save.$get();

    // 4. レスポンスをチェック
    if (!response.ok) {
      throw new Error(`Failed to load: ${response.status}`);
    }

    // 5. JSONを解析
    const result = await response.json();

    // 6. 成功時の状態更新
    setState((prev) => ({
      ...prev,
      data: result.data,
      loading: false,
    }));

    return result.data;

  } catch (err) {
    // 7. エラー時の処理
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    setState((prev) => ({
      ...prev,
      loading: false,
      error: errorMessage,
    }));
    return null;
  }
}, [getApiClient]);
```

**ポイント**:
- `async` 関数内で `await` を使う
- `try/catch` でエラーハンドリング
- 状態（loading, error）を適切に更新

</details>

---

## 5. HTTPレスポンスのステータスコード

**Q: `response.status === 404` はどういう意味？**

<details>
<summary>Answer</summary>

**HTTPステータスコードでレスポンスの種類を判断**。

```tsx
if (!response.ok) {
  if (response.status === 404) {
    // セーブデータが存在しない（新規プレイヤー）
    return null;
  }
  throw new Error(`Failed to load: ${response.status}`);
}
```

**主なステータスコード**:
| コード | 意味 | 対処 |
|--------|------|------|
| 200 | 成功 | データを処理 |
| 404 | 見つからない | 新規作成など |
| 401 | 認証エラー | 再ログインを促す |
| 500 | サーバーエラー | リトライを促す |

**`response.ok` の意味**:
- ステータスコードが200-299ならtrue
- それ以外はfalse

</details>

---

## 6. localStorage でオフライン対応

**Q: ローカルストレージにキャッシュを保存する理由は？**

<details>
<summary>Answer</summary>

**ネットワークエラー時にデータを失わないため**。

```tsx
const PENDING_CACHE_KEY = "ghost-game-pending-save";

// 保存
function savePendingCache(data: PendingCacheData): void {
  try {
    localStorage.setItem(PENDING_CACHE_KEY, JSON.stringify(data));
  } catch {
    // ストレージエラーは無視
  }
}

// 読み込み
function loadPendingCache(): PendingCacheData | null {
  try {
    const cached = localStorage.getItem(PENDING_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as PendingCacheData;
    }
  } catch {
    // パースエラーは無視
  }
  return null;
}

// 削除
function clearPendingCache(): void {
  localStorage.removeItem(PENDING_CACHE_KEY);
}
```

**使われるタイミング**:
- セーブ失敗時 → キャッシュに保存
- セーブ成功時 → キャッシュをクリア
- オンライン復帰時 → キャッシュを同期

</details>

---

## 7. try/catch でのエラーハンドリング

**Q: localStorage操作を `try/catch` で囲む理由は？**

<details>
<summary>Answer</summary>

**ストレージ関連のエラーでアプリが止まらないようにするため**。

```tsx
function savePendingCache(data: PendingCacheData): void {
  try {
    localStorage.setItem(PENDING_CACHE_KEY, JSON.stringify(data));
  } catch {
    // ストレージエラーは無視（アプリは動き続ける）
  }
}
```

**起こりうるエラー**:
- ストレージ容量オーバー
- プライベートブラウジングでストレージ無効
- JSON.parseで不正なデータ

**エラーハンドリングの考え方**:
- 「セーブできなくても、ゲームは続けられる」
- 致命的でないエラーは握りつぶす
- 重要なエラーはUIに表示

</details>

---

## 8. useRefで値を保持

**Q: `pendingSaveDataRef` を `useRef` で管理する理由は？**

<details>
<summary>Answer</summary>

**再レンダリングを起こさずに値を保持するため**。

```tsx
// useRefで保持
const pendingSaveDataRef = useRef<{
  position?: PlayerPosition;
  party?: Party;
  inventory?: Inventory;
} | null>(null);

// 値の更新（再レンダリングなし）
const updatePendingSaveData = useCallback((data) => {
  pendingSaveDataRef.current = {
    ...pendingSaveDataRef.current,
    ...data,
  };
}, []);

// 値の読み取り
const executeAutoSave = useCallback(async () => {
  if (pendingSaveDataRef.current) {
    const dataToSave = pendingSaveDataRef.current;
    pendingSaveDataRef.current = null;
    await saveData(dataToSave);
  }
}, [saveData]);
```

**useRef vs useState**:
| | useState | useRef |
|--|----------|--------|
| 更新時 | 再レンダリング | 再レンダリングしない |
| 用途 | 表示に影響する値 | 内部で保持するだけの値 |

**この場合**:
- セーブ用データは「貯めておく」だけ
- UIには影響しない → useRefが適切

</details>

---

## 9. setIntervalで自動セーブ

**Q: 30秒ごとの自動セーブはどう実装する？**

<details>
<summary>Answer</summary>

```tsx
const AUTO_SAVE_INTERVAL = 30000; // 30秒

useEffect(() => {
  // インターバルを設定
  const intervalId = setInterval(() => {
    executeAutoSave();
  }, AUTO_SAVE_INTERVAL);

  // クリーンアップ関数
  return () => {
    clearInterval(intervalId);
  };
}, [executeAutoSave]);
```

**ポイント**:
- `setInterval` でタイマーを開始
- `clearInterval` でタイマーを停止
- `useEffect` のクリーンアップで確実に停止

**なぜクリーンアップが必要？**
- コンポーネントがアンマウントされたとき
- 依存配列の値が変わったとき
- タイマーを止めないとメモリリークになる

</details>

---

## 10. windowイベントリスナー

**Q: `window.addEventListener("online", ...)` は何をしている？**

<details>
<summary>Answer</summary>

**ブラウザがオンラインに復帰したときに処理を実行**。

```tsx
useEffect(() => {
  const handleOnline = () => {
    if (state.hasPendingCache) {
      syncPendingCache();  // 保留中のデータを同期
    }
  };

  window.addEventListener("online", handleOnline);

  // クリーンアップ
  return () => {
    window.removeEventListener("online", handleOnline);
  };
}, [state.hasPendingCache, syncPendingCache]);
```

**主なwindowイベント**:
| イベント | 発火タイミング |
|----------|----------------|
| `online` | オフライン→オンライン |
| `offline` | オンライン→オフライン |
| `beforeunload` | ページを離れる直前 |
| `focus` | タブがアクティブになった |

**クリーンアップの重要性**:
- リスナーを削除しないと重複登録される
- メモリリークの原因になる

</details>

---

## 11. beforeunloadでの終了前処理

**Q: `beforeunload` イベントで何ができる？**

<details>
<summary>Answer</summary>

**ページを離れる直前に処理を実行**（ただし制限あり）。

```tsx
useEffect(() => {
  const handleBeforeUnload = () => {
    if (pendingSaveDataRef.current) {
      // 同期的にセーブを試みる（ベストエフォート）
      console.log("Pending save data on unload:", pendingSaveDataRef.current);
      // 注意: 非同期処理は完了を待てない
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, []);
```

**制限事項**:
- `async/await` は使えない（完了を待てない）
- 長い処理はブラウザにキャンセルされる
- ユーザー体験を損なわないよう短時間で

**代替手段**:
- `navigator.sendBeacon()` で非同期送信
- 定期的な自動セーブで補う

</details>

---

## 12. 状態オブジェクトの設計

**Q: `SaveDataState` インターフェースの設計意図は？**

<details>
<summary>Answer</summary>

**API操作に関連するすべての状態を一箇所にまとめる**。

```tsx
export interface SaveDataState {
  data: PlayerData | null;      // メインのデータ
  loading: boolean;             // 読み込み中フラグ
  error: string | null;         // エラーメッセージ
  lastSavedAt: Date | null;     // 最終セーブ時刻
  saving: boolean;              // セーブ中フラグ
  hasPendingCache: boolean;     // 保留キャッシュの有無
}
```

**設計のポイント**:
| 状態 | 用途 |
|------|------|
| `loading` | ローディング表示の制御 |
| `saving` | セーブ中の表示制御 |
| `error` | エラーメッセージの表示 |
| `lastSavedAt` | 「最終セーブ: xx分前」の表示 |
| `hasPendingCache` | 同期アイコンの表示 |

**UIとの対応**:
```tsx
<SaveStatus
  saving={saving}
  hasPendingCache={hasPendingCache}
  lastSavedAt={lastSavedAt}
/>
```

</details>

---

## 13. スプレッド構文でオブジェクトを返す

**Q: `return { ...state, loadSaveData, saveData, ... }` のパターンは？**

<details>
<summary>Answer</summary>

**状態とアクション関数を一緒に返す**パターン。

```tsx
return {
  ...state,              // 状態を展開
  loadSaveData,          // アクション関数
  saveData,
  updatePendingSaveData,
  executeAutoSave,
  syncPendingCache,
};
```

**呼び出し側での使い方**:
```tsx
const {
  data,           // state.dataと同じ
  loading,        // state.loadingと同じ
  error,          // state.errorと同じ
  loadSaveData,   // 関数
  saveData,       // 関数
} = useSaveData();
```

**メリット**:
- 状態とアクションをまとめて取得
- 分割代入で必要なものだけ取り出せる
- `state.data` より `data` と書けてシンプル

</details>

---

## 14. 部分的なデータ更新

**Q: `{ ...prev.data, ...data.position && { position: data.position } }` は何？**

<details>
<summary>Answer</summary>

**条件付きでプロパティを追加する**テクニック。

```tsx
setState((prev) => ({
  ...prev,
  data: prev.data
    ? {
        ...prev.data,
        // positionがあれば追加
        ...(data.position && { position: data.position }),
        // partyがあれば追加
        ...(data.party && { party: data.party }),
        // inventoryがあれば追加
        ...(data.inventory && { inventory: data.inventory }),
        updatedAt: new Date().toISOString(),
      }
    : null,
}));
```

**分解すると**:
```tsx
// data.position がある場合
data.position && { position: data.position }
// → { position: ... }

// data.position がない場合
data.position && { position: data.position }
// → false（スプレッドすると何も追加されない）
```

**なぜ必要？**
- 部分更新（positionだけ、partyだけ）に対応
- 渡されたフィールドだけを更新

</details>

---

## 理解度チェック

以下の質問に答えられたら、Step 4は完了です：

1. [ ] Hono Clientで型安全なAPI呼び出しができる仕組みを説明できる
2. [ ] `async/await` と `try/catch` でAPI呼び出しを書ける
3. [ ] `localStorage` でオフラインキャッシュを実装する理由を説明できる
4. [ ] `useRef` と `useState` の使い分けを説明できる
5. [ ] `useEffect` でイベントリスナーを設定・解除できる
