# Step 3 フラッシュカード - 画面コンポーネント

このフラッシュカードは、画面コンポーネント（`LoadingScreen`, `ErrorScreen`, `MenuScreen`, `PartyScreen`, `MapScreen`）を読むために必要な知識をカバーしています。

---

## 1. 最小限のコンポーネント構造

**Q: `LoadingScreen` のような最小限のコンポーネントの構成要素は？**

<details>
<summary>Answer</summary>

```tsx
// Propsの型定義
interface LoadingScreenProps {
  message?: string;  // オプショナル（?付き）
}

// コンポーネント関数
export function LoadingScreen({ message = "読み込み中..." }: LoadingScreenProps) {
  return (
    <output data-testid="loading-screen">
      <div className="...">...</div>
      <p>{message}</p>
    </output>
  );
}
```

**構成要素**:
1. **Propsインターフェース**: コンポーネントが受け取る値の型
2. **関数コンポーネント**: JSXを返す関数
3. **分割代入**: `{ message = "デフォルト値" }` でデフォルト付きで受け取る
4. **JSX**: 実際に表示するUI

</details>

---

## 2. オプショナルPropsとデフォルト値

**Q: `message?: string` と `message = "読み込み中..."` の関係は？**

<details>
<summary>Answer</summary>

```tsx
interface LoadingScreenProps {
  message?: string;  // 型定義: 渡しても渡さなくてもOK
}

function LoadingScreen({ message = "読み込み中..." }: LoadingScreenProps) {
  // ↑ 渡されなかったときのデフォルト値
}
```

**使い分け**:
```tsx
<LoadingScreen />
// → message は "読み込み中..."

<LoadingScreen message="データを取得中..." />
// → message は "データを取得中..."
```

**ポイント**:
- `?` は「省略可能」を意味（TypeScript）
- `= "..."` は「省略時のデフォルト値」（JavaScript）
- 両方セットで使うことが多い

</details>

---

## 3. data-testid属性

**Q: `data-testid="loading-screen"` は何のために付ける？**

<details>
<summary>Answer</summary>

**テストで要素を特定するため**。

```tsx
<div data-testid="loading-screen">
  <div data-testid="loading-spinner" />
</div>
```

**テストでの使用例**:
```tsx
// テストコード
const screen = render(<LoadingScreen />);
const spinner = screen.getByTestId("loading-spinner");
expect(spinner).toBeInTheDocument();
```

**なぜクラス名やタグ名ではだめ？**
- クラス名: スタイル変更で壊れる可能性
- タグ名: 同じタグが複数あると特定できない
- `data-testid`: テスト専用なので安定している

**本番環境では**:
- パフォーマンスに影響なし（ただのHTML属性）
- ビルド時に削除することも可能

</details>

---

## 4. コールバックProps

**Q: `onRetry?: () => void` はどう使う？**

<details>
<summary>Answer</summary>

**親から渡された関数を子で呼び出す**。

```tsx
// ErrorScreen（子）
interface ErrorScreenProps {
  error?: string | null;
  onRetry?: () => void;  // 親から渡されるコールバック
}

function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
  return (
    <button onClick={onRetry}>もう一度試す</button>
    //           ↑ クリックで親の関数を実行
  );
}
```

```tsx
// App.tsx（親）
const retry = useCallback(async () => {
  // リトライ処理
}, []);

<ErrorScreen error={authState.error} onRetry={retry} />
//                                    ↑ 親で定義した関数を渡す
```

**データの流れ**:
```
親（App.tsx）             子（ErrorScreen）
retry関数を定義    →     onRetryとして受け取る
                 ←     ボタンクリックでonRetry()を呼ぶ
retry関数が実行される
```

</details>

---

## 5. 条件付きスタイル（動的クラス）

**Q: テンプレートリテラルでクラスを動的に切り替える方法は？**

<details>
<summary>Answer</summary>

```tsx
<button
  className={`base-classes ${
    isSelected
      ? "selected-classes"
      : "unselected-classes"
  } ${isDisabled ? "disabled-classes" : ""}`}
>
```

**実例（MenuScreen）**:
```tsx
className={`flex items-center rounded-lg border-2 p-3 transition-all ${
  isSelected
    ? "border-ghost-primary bg-ghost-primary/20 text-ghost-text-bright"
    : "border-ghost-border bg-ghost-surface text-ghost-text"
} ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
```

**読み方**:
- 基本クラス（常に適用）
- 選択状態で分岐
- 無効状態で追加

**別の書き方（clsxライブラリ）**:
```tsx
import clsx from 'clsx';

className={clsx(
  "base-classes",
  isSelected && "selected-classes",
  isDisabled && "disabled-classes"
)}
```

</details>

---

## 6. 配列のmap()でリスト表示

**Q: 配列からUI要素を生成する基本パターンは？**

<details>
<summary>Answer</summary>

```tsx
const MENU_ITEMS = [
  { id: "party", label: "パーティ" },
  { id: "items", label: "アイテム" },
  // ...
];

// JSX内
{MENU_ITEMS.map((item, index) => (
  <button
    key={item.id}  // ← 必須: ユニークなキー
    onClick={() => handleItemClick(index)}
  >
    {item.label}
  </button>
))}
```

**keyが必要な理由**:
- Reactが要素を効率的に更新するため
- 順序変更や削除を正しく追跡できる
- 配列のインデックスよりも、データのIDを使うのがベター

**よくある間違い**:
```tsx
// NG: indexをkeyにすると順序変更時に問題
{items.map((item, index) => <div key={index} />)}

// OK: ユニークなIDをkeyにする
{items.map(item => <div key={item.id} />)}
```

</details>

---

## 7. 選択状態の管理

**Q: キーボードでの上下選択はどう実装する？**

<details>
<summary>Answer</summary>

```tsx
function MenuScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleKeyInput = useCallback((key: string) => {
    switch (key) {
      case "ArrowUp":
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : MENU_ITEMS.length - 1  // ループ
        );
        break;
      case "ArrowDown":
        setSelectedIndex((prev) =>
          prev < MENU_ITEMS.length - 1 ? prev + 1 : 0  // ループ
        );
        break;
      case "Enter":
        // 選択中の項目でアクション実行
        const item = MENU_ITEMS[selectedIndex];
        onSelectItem(item.id);
        break;
    }
  }, [selectedIndex, onSelectItem]);

  return (
    <>
      {MENU_ITEMS.map((item, index) => (
        <button
          data-selected={selectedIndex === index}
          className={selectedIndex === index ? "selected" : ""}
        >
          {item.label}
        </button>
      ))}
    </>
  );
}
```

**ポイント**:
- `useState(0)` で選択インデックスを管理
- 上下キーでインデックスを増減
- 端に達したらループ（0→最後、最後→0）
- `selectedIndex === index` で選択状態を判定

</details>

---

## 8. 親からのキー入力を受け取る

**Q: `onKeyInput` propsでキー入力を受け取る仕組みは？**

<details>
<summary>Answer</summary>

```tsx
// 親（App.tsx）
const [keyInput, setKeyInput] = useState<string | undefined>(undefined);

const handleKeyDown = (key: string) => {
  setKeyInput(key);
  setTimeout(() => setKeyInput(undefined), 0);  // 次フレームでリセット
};

<MenuScreen onKeyInput={keyInput} />
```

```tsx
// 子（MenuScreen）
interface MenuScreenProps {
  onKeyInput?: string;  // 親から渡されるキー
}

function MenuScreen({ onKeyInput }: MenuScreenProps) {
  useEffect(() => {
    if (onKeyInput) {
      handleKeyInput(onKeyInput);  // キーに応じた処理
    }
  }, [onKeyInput]);  // onKeyInputが変わったら実行
}
```

**なぜこの方式？**
- キーボードイベントは親（GameContainer）で一括管理
- どの画面を表示中かで処理を振り分け
- 子コンポーネントは純粋にキー文字列を受け取るだけ

</details>

---

## 9. 表示モードの切り替え

**Q: PartyScreenで一覧/詳細を切り替える方法は？**

<details>
<summary>Answer</summary>

```tsx
type PartyScreenMode = "list" | "detail";

function PartyScreen() {
  const [mode, setMode] = useState<PartyScreenMode>("list");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 詳細を開く
  const handleGhostClick = (index: number) => {
    setSelectedIndex(index);
    setMode("detail");
  };

  // 詳細を閉じる
  const closeDetail = useCallback(() => {
    setMode("list");
  }, []);

  return (
    <div>
      {/* 詳細モード */}
      {mode === "detail" && selectedGhost && (
        <GhostDetailPanel ghost={selectedGhost} onClose={closeDetail} />
      )}

      {/* 一覧モード */}
      {mode === "list" && (
        <>
          {party.map((ghost, index) => (
            <GhostSummaryCard
              key={ghost.id}
              ghost={ghost}
              isSelected={selectedIndex === index}
              onClick={() => handleGhostClick(index)}
            />
          ))}
        </>
      )}
    </div>
  );
}
```

**パターン**:
- `mode` stateで表示状態を管理
- `{mode === "xxx" && <Component />}` で条件分岐
- 選択したインデックスを保持して詳細表示に使う

</details>

---

## 10. 子コンポーネントへのデータ受け渡し

**Q: `GhostSummaryCard` に渡すpropsの設計は？**

<details>
<summary>Answer</summary>

```tsx
// 親（PartyScreen）
{party.map((ghost, index) => (
  <GhostSummaryCard
    key={ghost.id}
    ghost={ghost}                        // データ
    species={speciesMap[ghost.speciesId]} // 関連データ
    isSelected={selectedIndex === index}  // 表示状態
    onClick={() => handleGhostClick(index)} // コールバック
  />
))}
```

**Propsの種類**:
| Props | 役割 |
|-------|------|
| `ghost` | 表示するデータ本体 |
| `species` | 表示に必要な関連データ |
| `isSelected` | 親が管理する状態を子に反映 |
| `onClick` | 子でのアクションを親に通知 |

**設計のポイント**:
- 子は「表示」に専念
- 状態管理とロジックは親で
- コールバックで子→親の通信

</details>

---

## 11. ヘルパー関数の分離

**Q: `getDirectionFromKey` を別関数にする理由は？**

<details>
<summary>Answer</summary>

```tsx
// ヘルパー関数（コンポーネント外）
function getDirectionFromKey(key: string): Direction | null {
  switch (key) {
    case "w": case "W": case "ArrowUp": return "up";
    case "s": case "S": case "ArrowDown": return "down";
    case "a": case "A": case "ArrowLeft": return "left";
    case "d": case "D": case "ArrowRight": return "right";
    default: return null;
  }
}

// コンポーネント内での使用
const handleKeyInput = useCallback((key: string) => {
  const direction = getDirectionFromKey(key);
  if (!direction) return;
  // ...
}, [...]);
```

**メリット**:
1. **再利用可能**: 複数の場所で使える
2. **テストしやすい**: 関数単体でテストできる
3. **読みやすい**: コンポーネントがスッキリする
4. **パフォーマンス**: `useCallback` 内で毎回作成されない

**外部公開**:
```tsx
export { getDirectionFromKey };  // 他のファイルでも使える
```

</details>

---

## 12. 子コンポーネントの合成

**Q: MapScreenがMapGridを使う方法は？**

<details>
<summary>Answer</summary>

```tsx
// MapScreen（親）
import { MapGrid } from "./MapGrid";

export function MapScreen({ mapData, playerX, playerY, ... }: MapScreenProps) {
  return (
    <div className="...">
      <div className="...">{mapData.name}</div>

      <MapGrid
        mapData={mapData}
        playerX={playerX}
        playerY={playerY}
        tileSize={40}
      />

      <div className="...">操作説明</div>
    </div>
  );
}
```

**コンポーネント合成のメリット**:
- 責務の分離（MapScreen=レイアウト、MapGrid=描画）
- 再利用可能（MapGridを別の場所でも使える）
- テストしやすい（各コンポーネントを独立してテスト）

**Propsのバケツリレー**:
```
App.tsx
  └→ mapData, playerX, playerY
        └→ MapScreen
              └→ MapGrid
```

</details>

---

## 13. aria属性によるアクセシビリティ

**Q: `aria-live` や `role` 属性は何のため？**

<details>
<summary>Answer</summary>

```tsx
// LoadingScreen
<output
  aria-live="polite"    // 内容が変わったらスクリーンリーダーに通知
  aria-busy="true"      // 読み込み中であることを伝える
>

// ErrorScreen
<div role="alert">      // エラーであることを伝える
```

**主なARIA属性**:
| 属性 | 意味 |
|------|------|
| `aria-live="polite"` | 内容変更時に読み上げ（待機的） |
| `aria-busy="true"` | 処理中であることを示す |
| `role="alert"` | 重要な通知であることを示す |

**なぜ重要？**
- 視覚障害者がスクリーンリーダーでサイトを使える
- SEOにも影響（アクセシビリティは評価対象）
- 法的要件を満たす場合がある

</details>

---

## 14. イベントハンドラの型

**Q: `onClick` の型はどう書く？**

<details>
<summary>Answer</summary>

```tsx
// シンプルなコールバック
interface Props {
  onClick: () => void;
}

// インデックスを渡すコールバック
interface Props {
  onClick: (index: number) => void;
}

// イベントオブジェクトを受け取る場合
interface Props {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
```

**使い分け**:
```tsx
// 親で定義
const handleGhostClick = (index: number) => {
  setSelectedIndex(index);
};

// 子に渡す
<GhostSummaryCard onClick={() => handleGhostClick(index)} />
//                ↑ 引数なしの関数を渡す
```

**ポイント**:
- コールバックに渡すデータは `() => fn(data)` の形で包む
- 子コンポーネント側では引数なしで呼べる

</details>

---

## 理解度チェック

以下の質問に答えられたら、Step 3は完了です：

1. [ ] Propsの型定義とデフォルト値の設定方法を説明できる
2. [ ] `data-testid` を付ける理由を説明できる
3. [ ] `map()` でリストをレンダリングする際の `key` の重要性を説明できる
4. [ ] 親から子へのコールバックの流れを説明できる
5. [ ] 条件付きレンダリングのパターン（`&&` と三項演算子）を使い分けられる
