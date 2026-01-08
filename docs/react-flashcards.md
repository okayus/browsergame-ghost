# React 前提知識フラッシュカード

このコードベースを読むために必要なReactの基礎知識をフラッシュカード形式でまとめました。
各カードの「Q:」を読んで、答えを考えてから「A:」を確認してください。

---

## 1. JSX

### カード 1-1: JSXとは

**Q:** 以下のコードは何という構文で書かれていますか？

```tsx
return <div className="container">Hello</div>;
```

<details>
<summary>A: 答えを見る</summary>

**JSX（JavaScript XML）**

JavaScriptの中にHTMLのような構文を書ける拡張構文です。
ブラウザはJSXを直接理解できないため、ビルド時にJavaScriptに変換されます。

```javascript
// 変換後
return React.createElement("div", { className: "container" }, "Hello");
```

</details>

---

### カード 1-2: JSXの中でJavaScriptを使う

**Q:** JSXの中でJavaScript式を埋め込むには何を使いますか？

```tsx
const name = "ピカチュウ";
return <div>???</div>;  // nameを表示したい
```

<details>
<summary>A: 答えを見る</summary>

**波括弧 `{ }`** を使います。

```tsx
const name = "ピカチュウ";
return <div>{name}</div>;
```

波括弧の中には任意のJavaScript式を書けます：
- 変数: `{name}`
- 計算: `{hp * 2}`
- 関数呼び出し: `{getName()}`
- 三項演算子: `{isAlive ? "生存" : "戦闘不能"}`

</details>

---

### カード 1-3: classNameとは

**Q:** なぜ `class` ではなく `className` を使うのですか？

```tsx
// HTML
<div class="container">

// JSX
<div className="container">
```

<details>
<summary>A: 答えを見る</summary>

`class` はJavaScriptの**予約語**だからです。

JSXはJavaScriptの中で書くため、予約語との衝突を避ける必要があります。

同様の理由で：
- `for` → `htmlFor`
- `class` → `className`

</details>

---

## 2. コンポーネント

### カード 2-1: コンポーネントとは

**Q:** Reactコンポーネントとは何ですか？

<details>
<summary>A: 答えを見る</summary>

**UIの部品を返す関数（またはクラス）**です。

```tsx
// 関数コンポーネント
function Button() {
  return <button>クリック</button>;
}
```

特徴：
- 名前は**大文字で始める**（`Button`、`PartyScreen`）
- JSXを返す
- 再利用可能

</details>

---

### カード 2-2: コンポーネントの使い方

**Q:** 定義したコンポーネントはどうやって使いますか？

```tsx
function Button() {
  return <button>クリック</button>;
}

function App() {
  return <div>???</div>;  // Buttonを使いたい
}
```

<details>
<summary>A: 答えを見る</summary>

**HTMLタグのように書きます**。

```tsx
function App() {
  return (
    <div>
      <Button />
      <Button />
    </div>
  );
}
```

- 自己終了タグ `<Button />` または `<Button></Button>`
- 大文字で始まるタグはコンポーネント
- 小文字で始まるタグはHTML要素

</details>

---

### カード 2-3: フラグメント

**Q:** コンポーネントは何個の要素を返せますか？

```tsx
// これはエラーになる
function Bad() {
  return (
    <div>1つ目</div>
    <div>2つ目</div>
  );
}
```

<details>
<summary>A: 答えを見る</summary>

**1つの要素**しか返せません。

複数要素を返したい場合は**フラグメント `<>...</>`** で囲みます：

```tsx
function Good() {
  return (
    <>
      <div>1つ目</div>
      <div>2つ目</div>
    </>
  );
}
```

フラグメントは実際のDOMには何も出力されません。

</details>

---

## 3. Props

### カード 3-1: Propsとは

**Q:** Propsとは何ですか？

<details>
<summary>A: 答えを見る</summary>

**親コンポーネントから子コンポーネントへ渡すデータ**です。

```tsx
// 親
<GhostCard name="ピカチュウ" level={25} />

// 子
function GhostCard({ name, level }) {
  return <div>{name} Lv.{level}</div>;
}
```

- 読み取り専用（子は変更できない）
- オブジェクトとして渡される

</details>

---

### カード 3-2: Propsの受け取り方

**Q:** 以下の2つの書き方の違いは何ですか？

```tsx
// 書き方A
function Card(props) {
  return <div>{props.name}</div>;
}

// 書き方B
function Card({ name }) {
  return <div>{name}</div>;
}
```

<details>
<summary>A: 答えを見る</summary>

**分割代入（Destructuring）** を使っているかどうかです。

```tsx
// 書き方A: propsオブジェクト全体を受け取る
function Card(props) {
  return <div>{props.name}</div>;
}

// 書き方B: 分割代入で必要なプロパティだけ取り出す（推奨）
function Card({ name }) {
  return <div>{name}</div>;
}
```

書き方Bの方が：
- 必要なpropsが一目でわかる
- コードが短い

</details>

---

### カード 3-3: 関数をPropsとして渡す

**Q:** 子コンポーネントでボタンがクリックされたことを親に伝えるには？

<details>
<summary>A: 答えを見る</summary>

**コールバック関数をPropsとして渡します**。

```tsx
// 親
function Parent() {
  const handleClick = () => {
    console.log("子でクリックされた！");
  };

  return <Child onClick={handleClick} />;
}

// 子
function Child({ onClick }) {
  return <button onClick={onClick}>クリック</button>;
}
```

慣例：コールバックのprop名は `onXxx` にする

</details>

---

### カード 3-4: TypeScriptでのProps型定義

**Q:** TypeScriptでPropsの型を定義するには？

<details>
<summary>A: 答えを見る</summary>

**interface** または **type** で定義します。

```tsx
// 方法1: interface
interface CardProps {
  name: string;
  level: number;
  onSelect?: () => void;  // ?は省略可能
}

function Card({ name, level, onSelect }: CardProps) {
  return <div onClick={onSelect}>{name}</div>;
}

// 方法2: インラインで書く
function Card({ name, level }: { name: string; level: number }) {
  return <div>{name}</div>;
}
```

</details>

---

## 4. State（状態）

### カード 4-1: useStateとは

**Q:** `useState` は何をするフックですか？

<details>
<summary>A: 答えを見る</summary>

**コンポーネント内で変化する値（状態）を管理する**フックです。

```tsx
const [count, setCount] = useState(0);
//     ↑値    ↑更新関数        ↑初期値
```

- `count`: 現在の値
- `setCount`: 値を更新する関数
- `useState(0)`: 初期値は0

</details>

---

### カード 4-2: なぜ普通の変数ではダメなのか

**Q:** なぜ `let` で変数を作るのではなく `useState` を使うのですか？

```tsx
// これではダメ
function Counter() {
  let count = 0;
  return <button onClick={() => count++}>{count}</button>;
}
```

<details>
<summary>A: 答えを見る</summary>

**普通の変数を変更してもUIが再描画されない**からです。

```tsx
// let を使った場合
let count = 0;
count++;  // 値は変わるが、画面は更新されない

// useState を使った場合
const [count, setCount] = useState(0);
setCount(count + 1);  // 値が変わり、画面も再描画される
```

`setState` を呼ぶと、Reactは「状態が変わった」と認識して再描画します。

</details>

---

### カード 4-3: 状態の更新

**Q:** 以下のコードの問題点は何ですか？

```tsx
const [count, setCount] = useState(0);

function handleClick() {
  setCount(count + 1);
  setCount(count + 1);
  // countは2になる？
}
```

<details>
<summary>A: 答えを見る</summary>

**countは1にしかならない**。

`setCount` は即座に `count` を更新しません。
両方の `setCount(count + 1)` は同じ `count`（0）を参照しています。

解決策：**関数形式で更新する**

```tsx
function handleClick() {
  setCount(prev => prev + 1);  // prev = 0 → 1
  setCount(prev => prev + 1);  // prev = 1 → 2
}
```

</details>

---

## 5. useEffect

### カード 5-1: useEffectとは

**Q:** `useEffect` は何をするフックですか？

<details>
<summary>A: 答えを見る</summary>

**副作用（サイドエフェクト）を実行する**フックです。

副作用とは：
- API呼び出し
- イベントリスナーの登録
- タイマーの設定
- DOM操作

```tsx
useEffect(() => {
  // ここに副作用を書く
  console.log("コンポーネントが描画された");
}, []);
```

</details>

---

### カード 5-2: 依存配列

**Q:** `useEffect` の第2引数の配列は何を意味しますか？

```tsx
useEffect(() => {
  console.log("実行");
}, [count]);  // ← これは何？
```

<details>
<summary>A: 答えを見る</summary>

**依存配列（Dependency Array）**です。

配列内の値が変わった時だけ、effectが再実行されます。

```tsx
// パターン1: 毎回実行
useEffect(() => {});

// パターン2: 初回のみ実行
useEffect(() => {}, []);

// パターン3: countが変わった時だけ実行
useEffect(() => {}, [count]);

// パターン4: countまたはnameが変わった時に実行
useEffect(() => {}, [count, name]);
```

</details>

---

### カード 5-3: クリーンアップ

**Q:** `useEffect` から関数を返すと何が起こりますか？

```tsx
useEffect(() => {
  const timer = setInterval(() => {}, 1000);

  return () => {
    clearInterval(timer);  // これは何？
  };
}, []);
```

<details>
<summary>A: 答えを見る</summary>

**クリーンアップ関数**が実行されます。

- コンポーネントがアンマウント（画面から消える）される時
- 依存配列の値が変わってeffectが再実行される前

使用例：
- イベントリスナーの解除
- タイマーの停止
- サブスクリプションの解除

```tsx
useEffect(() => {
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

</details>

---

## 6. カスタムフック

### カード 6-1: カスタムフックとは

**Q:** カスタムフックとは何ですか？

<details>
<summary>A: 答えを見る</summary>

**再利用可能なロジックをまとめた関数**です。

```tsx
// カスタムフック
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  return { count, increment, decrement };
}

// 使用側
function Counter() {
  const { count, increment } = useCounter(10);
  return <button onClick={increment}>{count}</button>;
}
```

ルール：名前は `use` で始める

</details>

---

### カード 6-2: このアプリのカスタムフック

**Q:** `useGameState()` のようなカスタムフックを使う利点は？

```tsx
// App.tsx
const { state, setScreen, setParty } = useGameState();
```

<details>
<summary>A: 答えを見る</summary>

**状態管理のロジックをコンポーネントから分離できる**。

利点：
1. **再利用**: 同じロジックを複数のコンポーネントで使える
2. **テスト容易**: フック単体でテストできる
3. **関心の分離**: UIとロジックを分ける
4. **可読性**: App.tsxがシンプルになる

```tsx
// フックがない場合（App.tsxが肥大化）
const [screen, setScreen] = useState("map");
const [party, setParty] = useState([]);
const [inventory, setInventory] = useState([]);
// ... 大量のロジック

// フックを使う場合（シンプル）
const gameState = useGameState();
const mapState = useMapState();
const battleState = useBattleState();
```

</details>

---

## 7. 条件付きレンダリング

### カード 7-1: 条件によって表示を切り替える

**Q:** 条件によって異なるUIを表示する方法を3つ挙げてください。

<details>
<summary>A: 答えを見る</summary>

**1. 三項演算子**
```tsx
{isLoggedIn ? <Dashboard /> : <Login />}
```

**2. && 演算子（条件を満たす時だけ表示）**
```tsx
{hasError && <ErrorMessage />}
```

**3. 早期return**
```tsx
function Screen({ isLoading }) {
  if (isLoading) return <Loading />;
  return <Content />;
}
```

</details>

---

### カード 7-2: このアプリでの条件分岐

**Q:** App.tsxで画面を切り替えている部分を読み解いてください。

```tsx
{gameState.currentScreen === "map" && <MapScreen ... />}
{gameState.currentScreen === "battle" && <BattleScreen ... />}
{gameState.currentScreen === "menu" && <MenuScreen ... />}
```

<details>
<summary>A: 答えを見る</summary>

**`currentScreen` の値によって1つだけ表示される**。

- `currentScreen === "map"` の時 → `MapScreen` だけ表示
- `currentScreen === "battle"` の時 → `BattleScreen` だけ表示
- `currentScreen === "menu"` の時 → `MenuScreen` だけ表示

`&&` 演算子は、左側が `true` の時だけ右側を評価（表示）します。

</details>

---

## 8. リストのレンダリング

### カード 8-1: 配列をUIに変換する

**Q:** 配列の各要素をUIとして表示するには？

```tsx
const items = ["リンゴ", "バナナ", "オレンジ"];
```

<details>
<summary>A: 答えを見る</summary>

**`map()` 関数を使います**。

```tsx
const items = ["リンゴ", "バナナ", "オレンジ"];

return (
  <ul>
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);
```

`map()` は配列の各要素を変換して新しい配列を返します。

</details>

---

### カード 8-2: keyとは

**Q:** リストをレンダリングする時の `key` は何のために必要ですか？

```tsx
{items.map(item => (
  <li key={item.id}>{item.name}</li>
))}
```

<details>
<summary>A: 答えを見る</summary>

**Reactが各要素を識別するため**です。

keyがあると、Reactは：
- どの要素が追加されたか
- どの要素が削除されたか
- どの要素が変更されたか

を効率的に判断できます。

ルール：
- **一意であること**（重複しない）
- **安定していること**（順番が変わっても同じ）
- indexをkeyにするのは**非推奨**（順番が変わると問題）

```tsx
// 良い例
<li key={ghost.id}>{ghost.name}</li>

// 悪い例（順番が変わると問題）
<li key={index}>{ghost.name}</li>
```

</details>

---

## 9. イベント処理

### カード 9-1: イベントハンドラの書き方

**Q:** ボタンクリック時に関数を実行するには？

<details>
<summary>A: 答えを見る</summary>

**`onClick` に関数を渡します**。

```tsx
// 方法1: 関数を直接渡す
<button onClick={handleClick}>クリック</button>

// 方法2: アロー関数で書く
<button onClick={() => console.log("clicked")}>クリック</button>

// 方法3: 引数を渡したい場合
<button onClick={() => handleSelect(item.id)}>選択</button>
```

注意：`onClick={handleClick()}` と書くと**即時実行**されてしまう！

</details>

---

### カード 9-2: イベントオブジェクト

**Q:** イベントの詳細情報（どのキーが押されたか等）を取得するには？

<details>
<summary>A: 答えを見る</summary>

**イベントハンドラの引数**で受け取ります。

```tsx
function handleKeyDown(event: React.KeyboardEvent) {
  console.log(event.key);  // "Enter", "Escape", "ArrowUp" など
}

<input onKeyDown={handleKeyDown} />
```

よく使うイベント：
- `onClick`: クリック
- `onChange`: 入力値の変更
- `onKeyDown`: キー押下
- `onSubmit`: フォーム送信

</details>

---

## 10. TypeScript + React

### カード 10-1: 関数コンポーネントの型

**Q:** TypeScriptで関数コンポーネントの型を書く方法は？

<details>
<summary>A: 答えを見る</summary>

**Propsの型を定義して引数に指定**します。

```tsx
// 方法1: 引数に型を指定（推奨）
interface Props {
  name: string;
  level: number;
}

function GhostCard({ name, level }: Props) {
  return <div>{name} Lv.{level}</div>;
}

// 方法2: React.FC を使う（非推奨になりつつある）
const GhostCard: React.FC<Props> = ({ name, level }) => {
  return <div>{name} Lv.{level}</div>;
};
```

</details>

---

### カード 10-2: useStateの型

**Q:** `useState` で型を指定するには？

<details>
<summary>A: 答えを見る</summary>

**ジェネリクス `<型>`** を使います。

```tsx
// 自動推論される場合（初期値から推論）
const [count, setCount] = useState(0);  // number

// 明示的に指定する場合
const [user, setUser] = useState<User | null>(null);

// 配列の場合
const [items, setItems] = useState<string[]>([]);

// オブジェクトの場合
interface Ghost {
  id: string;
  name: string;
}
const [ghost, setGhost] = useState<Ghost | null>(null);
```

</details>

---

## 確認テスト

以下のコードを読んで、何が起こるか説明できますか？

```tsx
interface Props {
  items: string[];
  onSelect: (item: string) => void;
}

function ItemList({ items, onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    console.log("選択が変わった:", selected);
  }, [selected]);

  return (
    <ul>
      {items.map(item => (
        <li
          key={item}
          onClick={() => {
            setSelected(item);
            onSelect(item);
          }}
          style={{ fontWeight: selected === item ? "bold" : "normal" }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
```

<details>
<summary>答え</summary>

1. `items` 配列と `onSelect` コールバックを親から受け取る
2. `selected` 状態で現在選択中のアイテムを管理
3. `selected` が変わるたびにコンソールに出力
4. `items` を `map` でリスト表示
5. 各アイテムクリックで：
   - `setSelected` で選択状態を更新
   - `onSelect` で親に通知
6. 選択中のアイテムは太字で表示

</details>

---

## 次のステップ

このフラッシュカードの内容を理解したら、
`docs/frontend-architecture-guide.md` を読んで、
実際のコードでこれらの概念がどう使われているか確認しましょう。
