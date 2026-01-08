# Step 2 フラッシュカード - カスタムフック

このフラッシュカードは、状態管理のカスタムフック（`useGameState`, `useMapState`, `useAuthState`, `useBattleState`）を読むために必要な知識をカバーしています。

---

## 1. カスタムフックの基本構造

**Q: このプロジェクトのカスタムフックが共通して返すものは？**

<details>
<summary>Answer</summary>

**「状態」と「状態を変更するアクション関数」** をオブジェクトで返す。

```tsx
// 典型的なパターン
export function useGameState(): UseGameStateReturn {
  const [state, setState] = useState<GameState>(initialState);

  const setScreen = useCallback((screen) => {
    setState(prev => ({ ...prev, currentScreen: screen }));
  }, []);

  return {
    state,      // 読み取り専用の状態
    setScreen,  // 状態を変更するアクション
    // ...他のアクション
  };
}
```

**このパターンのメリット**:
- 状態と更新ロジックが一箇所にまとまる
- コンポーネントは「何をしたいか」だけ考えればいい
- テストがしやすい

</details>

---

## 2. 初期状態の定義

**Q: なぜ `initialState` を関数の外で定義する？**

<details>
<summary>Answer</summary>

```tsx
// フック関数の外で定義
const initialState: GameState = {
  currentScreen: "map",
  party: null,
  inventory: { items: [] },
  isLoaded: false,
};

export function useGameState() {
  const [state, setState] = useState<GameState>(initialState);
  // ...
}
```

**理由**:
1. **パフォーマンス**: フックが呼ばれるたびにオブジェクトを再生成しない
2. **リセットに使える**: `resetGame` で簡単に初期状態に戻せる
3. **型定義と一致**: TypeScriptの型と初期値が対応していることが明確

```tsx
const resetGame = useCallback(() => {
  setState(initialState);  // 初期状態にリセット
}, []);
```

</details>

---

## 3. スプレッド構文での状態更新

**Q: `{ ...prev, currentScreen: screen }` は何をしている？**

<details>
<summary>Answer</summary>

**既存の状態をコピーしつつ、一部だけ上書きする**。

```tsx
const setScreen = useCallback((screen: GameScreen) => {
  setState((prev) => ({ ...prev, currentScreen: screen }));
  //         ↑ 前の状態  ↑ 全プロパティをコピー   ↑ この値だけ上書き
}, []);
```

**なぜ直接変更しない？**
```tsx
// NG: 直接変更はReactが検知できない
prev.currentScreen = screen;
return prev;

// OK: 新しいオブジェクトを返す
return { ...prev, currentScreen: screen };
```

**Reactの原則**: 状態は「イミュータブル（不変）」に扱う

</details>

---

## 4. ネストしたオブジェクトの更新

**Q: パーティ内のゴーストを更新する方法は？**

<details>
<summary>Answer</summary>

```tsx
const updatePartyGhost = useCallback(
  (ghostId: string, updates: Partial<OwnedGhost>) => {
    setState((prev) => {
      if (!prev.party) return prev;

      // 配列の中の特定要素だけ更新
      const updatedGhosts = prev.party.ghosts.map((ghost) =>
        ghost.id === ghostId
          ? { ...ghost, ...updates }  // マッチしたものだけ更新
          : ghost                      // 他はそのまま
      );

      return {
        ...prev,
        party: { ...prev.party, ghosts: updatedGhosts },
      };
    });
  },
  []
);
```

**ポイント**:
- `map` で新しい配列を作成
- 該当するIDのゴーストだけ `{ ...ghost, ...updates }` で更新
- ネストが深くても各レベルでスプレッドが必要

</details>

---

## 5. useCallbackの依存配列

**Q: `useCallback` の依存配列は何を意味する？**

<details>
<summary>Answer</summary>

**関数内で使う「外部の値」をリストアップ**する。

```tsx
const useItem = useCallback(
  (itemId: string, quantity = 1): boolean => {
    // state.inventory.items を参照している
    const itemIndex = state.inventory.items.findIndex(...);
    // ...
  },
  [state.inventory.items]  // ← 参照している値を列挙
);
```

**依存配列の役割**:
- 配列内の値が変わったら、新しい関数を作成
- 変わらなければ、前回の関数を再利用

**空配列 `[]` の場合**:
```tsx
const setScreen = useCallback((screen) => {
  setState(prev => ({ ...prev, currentScreen: screen }));
}, []);  // setState は常に安定しているので依存不要
```
- 外部の値を参照していないので、関数は一度だけ作成される

</details>

---

## 6. 関数内で現在の状態を参照する方法

**Q: `setState` のコールバック形式を使う理由は？**

<details>
<summary>Answer</summary>

**最新の状態を確実に参照するため**。

```tsx
// NG: クロージャで古い state を参照してしまう可能性
const addMessage = () => {
  setState({ ...state, messages: [...state.messages, newMsg] });
};

// OK: prev は常に最新の状態
const addMessage = useCallback((message: string) => {
  setState((prev) => ({
    ...prev,
    messages: [...prev.messages, message],
  }));
}, []);
```

**なぜ問題が起きる？**
- `useCallback` でメモ化された関数は、作成時の `state` を覚えている
- 連続で呼ばれると、古い状態を参照してしまう
- `prev =>` 形式なら、React が最新の状態を渡してくれる

</details>

---

## 7. 派生状態（Derived State）

**Q: `useMemo` で `currentScreen` を計算しているのはなぜ？**

<details>
<summary>Answer</summary>

**複数の状態から「派生する値」を効率的に計算するため**。

```tsx
// useAuthState.ts
const currentScreen = useMemo((): AppScreen => {
  if (!isLoaded) return "loading";
  if (!isSignedIn) return "welcome";
  if (saveError || internalError) return "error";
  if (saveLoading || isInitializing) return "loading";
  if (saveData) return "game";
  return "loading";
}, [isLoaded, isSignedIn, saveError, internalError, saveLoading, isInitializing, saveData]);
```

**なぜ `useMemo` を使う？**
- 複数の状態から画面を決定するロジックがある
- 依存する値が変わらなければ再計算しない
- ロジックが一箇所にまとまって読みやすい

**派生状態の例**:
- `isDataLoaded = saveData !== null && !saveLoading`
- `needsInitialization = isAuthenticated && !saveLoading && saveData === null`

</details>

---

## 8. 条件付きの早期リターン

**Q: `if (!prev.party) return prev;` は何をしている？**

<details>
<summary>Answer</summary>

**前提条件を満たさない場合、状態を変更せずにそのまま返す**。

```tsx
const updatePartyGhost = useCallback((ghostId, updates) => {
  setState((prev) => {
    // パーティがなければ何もしない
    if (!prev.party) return prev;

    // ここに来るのはパーティがある場合のみ
    const updatedGhosts = prev.party.ghosts.map(...);
    return { ...prev, party: { ...prev.party, ghosts: updatedGhosts } };
  });
}, []);
```

**このパターンのメリット**:
- 不正な状態での操作を防ぐ
- TypeScriptに `prev.party` が `null` でないことを伝える
- ネストが浅くなって読みやすい（Guard Clause パターン）

</details>

---

## 9. 移動とエンカウント判定

**Q: `useMapState` の `move` 関数が返す情報は？**

<details>
<summary>Answer</summary>

**移動結果とエンカウント情報をまとめて返す**。

```tsx
interface MoveResult {
  success: boolean;           // 移動できたか
  newPosition: PlayerPosition; // 新しい位置
  encounter: EncounterResult | null; // エンカウント情報
}

const move = useCallback((direction: Direction): MoveResult => {
  // 1. 移動先を計算
  const { dx, dy } = getDirectionDelta(direction);
  const newX = state.position.x + dx;
  const newY = state.position.y + dy;

  // 2. 移動可能かチェック
  if (!canMoveTo(newX, newY)) {
    return { success: false, newPosition: state.position, encounter: null };
  }

  // 3. 位置を更新
  setState(prev => ({ ...prev, position: newPosition }));

  // 4. エンカウント判定
  const tile = getTileAt(newX, newY);
  const encounter = checkEncounter(tile, ...);

  return { success: true, newPosition, encounter };
}, [...]);
```

**このパターンのポイント**:
- 複数の情報を構造化して返す
- 呼び出し側は結果を見て次のアクションを決められる

</details>

---

## 10. 外部フックの組み合わせ

**Q: `useAuthState` で使われている外部フックは？**

<details>
<summary>Answer</summary>

```tsx
export function useAuthState() {
  // Clerkの認証状態
  const { isLoaded, isSignedIn } = useAuth();

  // セーブデータ管理（自作フック）
  const { data: saveData, loading, error, ... } = useSaveData();

  // APIクライアント（自作フック）
  const { getApiClient } = useApiClient();

  // 内部状態
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // ...
}
```

**フックの組み合わせパターン**:
```
useAuthState
├── useAuth()        ← Clerkライブラリ
├── useSaveData()    ← 自作（API通信）
├── useApiClient()   ← 自作（HTTPクライアント）
└── useState()       ← React標準
```

**メリット**:
- 各フックが単一の責任を持つ
- テストしやすい
- 再利用できる

</details>

---

## 11. useEffectでの初期化処理

**Q: 認証成功時にセーブデータを読み込む仕組みは？**

<details>
<summary>Answer</summary>

```tsx
// 認証成功時にセーブデータを読み込む
useEffect(() => {
  if (isAuthenticated && !hasTriedLoading && !saveLoading) {
    loadSaveData().then(() => {
      setHasTriedLoading(true);
    });
  }
}, [isAuthenticated, hasTriedLoading, saveLoading, loadSaveData]);
```

**条件の意味**:
| 条件 | 意味 |
|------|------|
| `isAuthenticated` | ログイン済み |
| `!hasTriedLoading` | まだ読み込みを試していない |
| `!saveLoading` | 読み込み中でない |

**フラグ管理のポイント**:
- `hasTriedLoading` で「一度だけ」を保証
- 条件を満たさなければ何も起きない
- サインアウト時にフラグをリセット

</details>

---

## 12. 複雑な状態遷移（バトルフェーズ）

**Q: バトルのフェーズ遷移はどう管理されている？**

<details>
<summary>Answer</summary>

```tsx
type BattlePhase = "command_select" | "move_select" | "item_select" | "executing" | "result";

interface BattleState {
  phase: BattlePhase;
  playerGhost: BattleGhostState | null;
  enemyGhost: BattleGhostState | null;
  turnCount: number;
  escapeAttempts: number;
  messages: string[];
  isActive: boolean;
  endReason: BattleEndReason | null;
}
```

**フェーズ遷移の流れ**:
```
startBattle() → command_select
                    ↓
              [コマンド選択]
               ↙        ↘
          fight        capture/run
            ↓              ↓
       move_select    executePlayerAction()
            ↓              ↓
       [技選択]        [結果判定]
            ↓              ↓
       executePlayerAction()  → result (終了)
            ↓                    または
       command_select (継続)  ← command_select (継続)
```

**状態遷移のポイント**:
- `phase` で現在の状態を明示
- `executePlayerAction` が結果を返し、次の状態を決定
- `isActive` と `endReason` で終了状態を管理

</details>

---

## 13. アクション結果の型定義

**Q: `executePlayerAction` が返す `TurnResult` の設計意図は？**

<details>
<summary>Answer</summary>

```tsx
interface TurnResult {
  playerActionMessage: string | null;    // プレイヤーのメッセージ
  enemyActionMessage: string | null;     // 敵のメッセージ
  battleEnded: boolean;                  // 終了したか
  endReason: BattleEndReason | null;     // 終了理由
  damageInfo: {
    playerDamage: number | null;         // 受けたダメージ
    enemyDamage: number | null;          // 与えたダメージ
  };
}
```

**設計のポイント**:
- 状態更新とは別に「結果情報」を返す
- 呼び出し側はこの結果を見て追加処理ができる
- UIの表示制御に必要な情報がすべて含まれる

```tsx
// 呼び出し側（App.tsx）
const result = executePlayerAction(...);
if (result.battleEnded) {
  setTimeout(() => {
    resetBattle();
    setScreen("map");
  }, 2000);
}
```

</details>

---

## 14. テスト用の乱数注入

**Q: `randomValue?: number` パラメータの目的は？**

<details>
<summary>Answer</summary>

**テスト時に乱数を固定するため**。

```tsx
const move = useCallback(
  (direction: Direction, randomValue?: number): MoveResult => {
    // ...
    const encounter = checkEncounter(
      tile,
      state.currentMap.encounters,
      randomValue ?? Math.random()  // テスト時は固定値、通常は乱数
    );
    // ...
  },
  [...]
);
```

**テストでの使用例**:
```tsx
// エンカウント発生を確実にテスト
const result = move("up", 0.01);  // 低い値 = 必ずエンカウント
expect(result.encounter?.occurred).toBe(true);

// エンカウント非発生をテスト
const result2 = move("up", 0.99);  // 高い値 = エンカウントしない
expect(result2.encounter?.occurred).toBe(false);
```

**このパターンのメリット**:
- 本番コードを変更せずにテスト可能
- オプショナルなので通常使用には影響しない
- 乱数依存のロジックを決定論的にテストできる

</details>

---

## 15. 戻り値の型定義

**Q: `UseGameStateReturn` のような戻り値型を定義する理由は？**

<details>
<summary>Answer</summary>

```tsx
export interface UseGameStateReturn {
  state: GameState;
  setScreen: (screen: GameScreen) => void;
  setParty: (party: Party) => void;
  updatePartyGhost: (ghostId: string, updates: Partial<OwnedGhost>) => void;
  // ...
}

export function useGameState(): UseGameStateReturn {
  // ...
  return { state, setScreen, setParty, updatePartyGhost, ... };
}
```

**メリット**:
1. **ドキュメント化**: フックが何を提供するか一目でわかる
2. **型安全**: 使う側が正しい引数を渡せる
3. **リファクタリング**: 内部実装を変えても型が同じなら問題なし
4. **IDE補完**: 使える関数が自動補完される

**型を見るだけで理解できる**:
```tsx
setScreen: (screen: GameScreen) => void;  // 画面を設定する
updatePartyGhost: (ghostId: string, updates: Partial<OwnedGhost>) => void;  // ゴーストを更新する
```

</details>

---

## 理解度チェック

以下の質問に答えられたら、Step 2は完了です：

1. [ ] カスタムフックが返す「状態」と「アクション」の役割を説明できる
2. [ ] `useCallback` の依存配列が何を意味するか説明できる
3. [ ] `setState(prev => ...)` 形式を使う理由を説明できる
4. [ ] `useMemo` で派生状態を計算するメリットを説明できる
5. [ ] 複数のフックを組み合わせて1つのカスタムフックを作る利点を説明できる
