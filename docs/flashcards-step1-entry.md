# Step 1 フラッシュカード - エントリーポイント

このフラッシュカードは、`main.tsx` と `App.tsx` を読むために必要な知識をカバーしています。

---

## 1. createRoot

**Q: `createRoot` は何をする関数？**

<details>
<summary>Answer</summary>

ReactアプリをDOM要素にマウント（取り付け）する関数。

```tsx
import { createRoot } from "react-dom/client";

const rootElement = document.getElementById("root");
createRoot(rootElement).render(<App />);
```

**ポイント**:
- `react-dom/client` からインポート
- HTML内の `<div id="root">` を取得して、そこにReactアプリを描画
- `.render()` で実際の描画を開始

</details>

---

## 2. StrictMode

**Q: `<StrictMode>` は何のために使う？**

<details>
<summary>Answer</summary>

開発中にバグを早期発見するためのラッパーコンポーネント。

```tsx
<StrictMode>
  <App />
</StrictMode>
```

**StrictModeがしてくれること**:
- コンポーネントを2回レンダリングして、副作用のバグを検出
- 非推奨APIの使用を警告
- 本番ビルドでは無効化される（パフォーマンス影響なし）

**なぜ2回レンダリング？**
- `useEffect` が正しくクリーンアップされるか確認
- 不純な関数を検出

</details>

---

## 3. Providerパターン

**Q: `<ClerkProvider>` のような「Provider」は何をしている？**

<details>
<summary>Answer</summary>

子コンポーネント全体に「コンテキスト（共有データ）」を提供するパターン。

```tsx
<ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
  <App />   {/* App以下すべてでClerkが使える */}
</ClerkProvider>
```

**なぜ必要？**
- 認証情報をすべてのコンポーネントで使いたい
- Propsで毎回渡すのは大変（「Props Drilling」問題）
- Providerで包むと、どこからでも `useClerk()` で取得可能

**このプロジェクトでの使われ方**:
```tsx
// App.tsx内
const clerk = useClerk();  // Providerが提供する値を取得
clerk.openSignIn();        // サインイン画面を開く
```

</details>

---

## 4. import.meta.env

**Q: `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY` は何？**

<details>
<summary>Answer</summary>

Viteが提供する環境変数へのアクセス方法。

```tsx
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
```

**ポイント**:
- `VITE_` プレフィックスが必須（セキュリティ上の理由）
- `.env` ファイルで設定する
- APIキーなど、コードに直接書きたくない値を管理

**なぜ環境変数を使う？**
- 開発/本番で異なる値を使い分け
- 秘密情報をGitにコミットしない
- チーム間で環境設定を共有

</details>

---

## 5. 条件付きレンダリング（画面切り替え）

**Q: App.tsx で画面を切り替えている方法は？**

<details>
<summary>Answer</summary>

`switch` 文で `currentScreen` の値に応じて異なるコンポーネントを返す。

```tsx
const renderContent = () => {
  switch (authState.currentScreen) {
    case "welcome":
      return <WelcomeScreen />;
    case "loading":
      return <LoadingScreen />;
    case "error":
      return <ErrorScreen />;
    case "game":
      return <GameContainer>...</GameContainer>;
    default:
      return <LoadingScreen />;
  }
};

return renderContent();
```

**このパターンのメリット**:
- 画面遷移のロジックが一箇所にまとまる
- 各画面コンポーネントは独立して開発できる
- 状態に応じた明確な分岐

</details>

---

## 6. カスタムフックの組み合わせ

**Q: App.tsx で使われている4つのカスタムフックは？**

<details>
<summary>Answer</summary>

```tsx
const { state: authState, ... } = useAuthState();   // 認証状態
const { state: gameState, ... } = useGameState();   // ゲーム全体状態
const { state: mapState, ... } = useMapState();     // マップ状態
const { state: battleState, ... } = useBattleState(); // バトル状態
```

**各フックの役割**:
| フック | 管理する状態 |
|--------|-------------|
| `useAuthState` | ログイン状態、画面（welcome/game/error） |
| `useGameState` | 現在の画面（map/battle/menu）、パーティ |
| `useMapState` | 現在のマップ、プレイヤー位置 |
| `useBattleState` | バトルフェーズ、味方/敵ゴースト |

**ポイント**:
- 各フックは「状態」と「状態を変更する関数」を返す
- 分割代入で `state: authState` のようにリネーム
- 関心ごとに分離されているので理解しやすい

</details>

---

## 7. useEffectでの初期化

**Q: App.tsx の `useEffect` は何をしている？**

<details>
<summary>Answer</summary>

2つの `useEffect` がある：

**1. セーブデータの反映**
```tsx
useEffect(() => {
  if (saveData && !gameState.isLoaded) {
    setParty(saveData.party);
    setInventory(saveData.inventory);
    setPosition(saveData.position);
    // ...
    setLoaded();
  }
}, [saveData, gameState.isLoaded, ...]);
```
- サーバーから取得したセーブデータをゲーム状態に反映
- 一度だけ実行（`isLoaded` フラグで制御）

**2. 新規プレイヤーの初期化**
```tsx
useEffect(() => {
  if (needsInitialization) {
    initializeNewPlayer();
  }
}, [needsInitialization, initializeNewPlayer]);
```
- 新規ユーザーの場合、初期ゴーストを付与

**依存配列の意味**:
- 配列内の値が変わったときだけ実行される
- 無限ループを防ぐために必要

</details>

---

## 8. useCallbackの使い方

**Q: なぜハンドラ関数を `useCallback` で包んでいる？**

<details>
<summary>Answer</summary>

```tsx
const handleEncounter = useCallback(
  (encounter: EncounterResult) => {
    // エンカウント処理
  },
  [gameState.party?.ghosts, startBattle, setScreen]  // 依存配列
);
```

**理由**:
1. **パフォーマンス最適化**: 毎回新しい関数を作らない
2. **子コンポーネントの再レンダリング防止**: 関数の参照が変わらない
3. **useEffectの依存に使える**: 安定した参照が必要

**依存配列に入れるもの**:
- 関数内で使う外部の値（state、props、他の関数）
- これらが変わったときだけ新しい関数を作る

</details>

---

## 9. useMemoの使い方

**Q: `useMemo` は何のために使う？**

<details>
<summary>Answer</summary>

重い計算結果をキャッシュする。

```tsx
const speciesMap = useMemo(() => {
  return ALL_GHOST_SPECIES.reduce(
    (acc, species) => {
      acc[species.id] = species;
      return acc;
    },
    {} as Record<string, GhostSpecies>
  );
}, []);  // 依存配列が空 = 最初の1回だけ計算
```

**この例でやっていること**:
- ゴースト種族の配列 → IDで引けるオブジェクト に変換
- 毎回変換すると無駄なので、結果をキャッシュ

**useCallbackとの違い**:
| フック | キャッシュするもの |
|--------|-------------------|
| `useMemo` | 計算結果（値） |
| `useCallback` | 関数 |

</details>

---

## 10. ネストした条件分岐

**Q: ゲーム画面内でさらに画面を切り替える方法は？**

<details>
<summary>Answer</summary>

`authState.currentScreen === "game"` の中で、さらに `gameState.currentScreen` で分岐。

```tsx
case "game":
  return (
    <GameContainer>
      {gameState.currentScreen === "map" && <MapScreen />}
      {gameState.currentScreen === "battle" && <BattleScreen />}
      {gameState.currentScreen === "menu" && <MenuScreen />}
      {gameState.currentScreen === "party" && <PartyScreen />}
    </GameContainer>
  );
```

**2段階の画面管理**:
```
authState.currentScreen
├── "welcome"  → WelcomeScreen
├── "loading"  → LoadingScreen
├── "error"    → ErrorScreen
└── "game"     → GameContainer
                  └── gameState.currentScreen
                      ├── "map"    → MapScreen
                      ├── "battle" → BattleScreen
                      ├── "menu"   → MenuScreen
                      └── "party"  → PartyScreen
```

**`&&` 演算子の意味**:
- 左側が `true` のときだけ右側を表示
- `{条件 && <Component />}` はよく使うパターン

</details>

---

## 11. イベントハンドラの設計

**Q: キーボード入力はどう処理されている？**

<details>
<summary>Answer</summary>

`handleKeyDown` 関数で現在の画面に応じて処理を分岐。

```tsx
const handleKeyDown = (key: string) => {
  // バトル画面
  if (gameState.currentScreen === "battle") {
    setKeyInput(key);
    setTimeout(() => setKeyInput(undefined), 0);
    return;
  }

  // マップ画面
  if (gameState.currentScreen === "map") {
    if (key === "Escape") {
      handleOpenMenu();
      return;
    }
    // WASD / 矢印キーで移動
    switch (key.toLowerCase()) {
      case "w": case "arrowup": direction = "up"; break;
      // ...
    }
  }
};
```

**キー入力の流れ**:
1. `GameContainer` がキーイベントを受け取る
2. `onKeyDown={handleKeyDown}` でApp.tsxに通知
3. 現在の画面に応じて処理
4. バトル/メニュー画面では `keyInput` stateで子に伝達

</details>

---

## 12. コンポーネントへのPropsとしてReactNodeを渡す

**Q: `commandPanel` propの型が `React.ReactNode` なのはなぜ？**

<details>
<summary>Answer</summary>

コンポーネント自体を子として渡すため。

```tsx
<BattleScreen
  commandPanel={
    battleState.phase === "command_select" ? (
      <CommandPanel onSelectCommand={handleBattleCommand} />
    ) : battleState.phase === "move_select" ? (
      <SkillSelectPanel onSelectMove={handleMoveSelect} />
    ) : undefined
  }
/>
```

**メリット**:
- `BattleScreen` は「どのパネルを表示するか」を知らなくていい
- 親（App.tsx）が状態に応じて適切なパネルを選択
- 「Composition（合成）」パターン

**BattleScreen側**:
```tsx
// 渡されたものをそのまま表示
{phase === "command_select" && commandPanel}
```

</details>

---

## 理解度チェック

以下の質問に答えられたら、Step 1は完了です：

1. [ ] `main.tsx` と `App.tsx` の役割の違いを説明できる
2. [ ] `<ClerkProvider>` が何を提供しているか説明できる
3. [ ] 画面遷移がどのように実装されているか説明できる
4. [ ] `useCallback` と `useMemo` の使い分けを説明できる
5. [ ] なぜ複数のカスタムフックに分離されているか説明できる
