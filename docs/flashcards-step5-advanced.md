# Step 5 フラッシュカード - 応用（バトル画面）

このフラッシュカードは、複雑なUI（`BattleScreen`, `GhostDisplay`, `CommandPanel`）を読むために必要な知識をカバーしています。

---

## 1. コンポーネント合成（Composition）

**Q: BattleScreenが子コンポーネントを受け取る設計の利点は？**

<details>
<summary>Answer</summary>

**親が「何を表示するか」を決められる柔軟性**がある。

```tsx
// BattleScreen（表示の枠組み）
interface BattleScreenProps {
  commandPanel?: React.ReactNode;  // 任意のコンポーネントを受け取れる
  messageBox?: React.ReactNode;
  // ...
}

function BattleScreen({ commandPanel, messageBox, ... }) {
  return (
    <div>
      {/* フェーズに応じてパネルを表示 */}
      {phase === "command_select" && commandPanel}
      {messageBox}
    </div>
  );
}
```

```tsx
// App.tsx（何を表示するか決める）
<BattleScreen
  commandPanel={
    phase === "command_select" ? (
      <CommandPanel onSelectCommand={handleCommand} />
    ) : phase === "move_select" ? (
      <SkillSelectPanel onSelectMove={handleMove} />
    ) : undefined
  }
/>
```

**メリット**:
- BattleScreenはレイアウトに専念
- どのパネルを表示するかは親が決定
- 新しいパネルを追加しても子を変更不要

</details>

---

## 2. React.ReactNode型

**Q: `commandPanel?: React.ReactNode` は何を受け取れる？**

<details>
<summary>Answer</summary>

**Reactがレンダリングできるすべてのもの**。

```tsx
interface Props {
  children: React.ReactNode;
}

// 以下すべて有効
<Component children={<div>要素</div>} />
<Component children="文字列" />
<Component children={123} />
<Component children={null} />
<Component children={undefined} />
<Component children={[<A />, <B />]} />
```

**よく使う型との比較**:
| 型 | 受け取れるもの |
|---|---|
| `React.ReactNode` | 何でもOK（最も柔軟） |
| `React.ReactElement` | JSX要素のみ |
| `string` | 文字列のみ |
| `() => JSX.Element` | 関数コンポーネント |

**使い分け**:
- 子を柔軟に受け取りたい → `ReactNode`
- 特定のpropsを持つコンポーネントを期待 → 具体的な型

</details>

---

## 3. 状態のリフトアップ（Lifting State Up）

**Q: なぜCommandPanelではなくApp.tsxでバトル状態を管理する？**

<details>
<summary>Answer</summary>

**複数のコンポーネントが同じ状態を参照するから**。

```tsx
// App.tsx（状態を持つ）
const { state: battleState, setPhase, executePlayerAction } = useBattleState();

// BattleScreenに状態を渡す
<BattleScreen
  phase={battleState.phase}
  playerGhost={battleState.playerGhost}
  enemyGhost={battleState.enemyGhost}
/>

// CommandPanelにアクションを渡す
<CommandPanel
  onSelectCommand={handleBattleCommand}
/>
```

**なぜリフトアップ？**
```
         App.tsx ← 状態をここで管理
        /       \
BattleScreen   CommandPanel
（状態を表示）  （状態を変更）
```

- `BattleScreen` は状態を「表示」したい
- `CommandPanel` は状態を「変更」したい
- 両方に影響するので、共通の親で管理

</details>

---

## 4. 再利用可能なUI部品

**Q: `GhostDisplay` が味方/敵両方に使えるのはなぜ？**

<details>
<summary>Answer</summary>

**`isEnemy` propsで表示を切り替える**から。

```tsx
interface GhostDisplayProps {
  ghostState: BattleGhostState;
  isEnemy: boolean;  // 敵かどうかで表示を変える
  ghostType?: string;
}

function GhostDisplay({ ghostState, isEnemy }) {
  // 敵: [ステータス] --- [ゴースト]
  // 味方: [ゴースト] --- [ステータス]
  return (
    <div>
      {isEnemy ? (
        <>
          {infoPanel}
          {sprite}
        </>
      ) : (
        <>
          {sprite}
          {infoPanel}
        </>
      )}
    </div>
  );
}
```

**使い方**:
```tsx
// 敵ゴースト
<GhostDisplay ghostState={enemyGhost} isEnemy={true} />

// 味方ゴースト
<GhostDisplay ghostState={playerGhost} isEnemy={false} />
```

**設計のポイント**:
- 同じコンポーネントを両方の用途に使う
- `isEnemy` で細かい差異を吸収
- コードの重複を避ける

</details>

---

## 5. サブコンポーネントへの分離

**Q: `GhostInfoPanel` と `GhostSprite` を別関数にする理由は？**

<details>
<summary>Answer</summary>

**コードを整理して読みやすくする**ため。

```tsx
// サブコンポーネント（内部用）
function GhostInfoPanel({ ghost, currentHp, maxHp, hpPercentage }) {
  return (
    <div className="...">
      <span>{ghost.speciesId}</span>
      <span>Lv.{ghost.level}</span>
      {/* HPバー */}
    </div>
  );
}

function GhostSprite({ isEnemy }) {
  return (
    <div>{isEnemy ? "👻" : "🔥"}</div>
  );
}

// メインコンポーネント
export function GhostDisplay({ ghostState, isEnemy }) {
  const infoPanel = <GhostInfoPanel {...} />;
  const sprite = <GhostSprite isEnemy={isEnemy} />;

  return (
    <div>
      {isEnemy ? <>{infoPanel}{sprite}</> : <>{sprite}{infoPanel}</>}
    </div>
  );
}
```

**メリット**:
- 各部品の責務が明確
- JSXが短くなって読みやすい
- 必要なら別ファイルに分離も可能

**exportしていない理由**:
- `GhostDisplay` 内部でのみ使用
- 他から使う予定がない

</details>

---

## 6. フェーズに応じた表示切り替え

**Q: バトルフェーズごとに異なるUIを表示する方法は？**

<details>
<summary>Answer</summary>

**`phase` の値で条件分岐**する。

```tsx
function BattleScreen({ phase, commandPanel, ... }) {
  return (
    <div>
      {/* コマンドパネルエリア */}
      <div className="...">
        {phase === "command_select" && commandPanel}
        {phase === "move_select" && commandPanel}
        {phase === "item_select" && commandPanel}

        {phase === "executing" && (
          <div data-testid="executing-indicator">
            <span className="animate-pulse">実行中...</span>
          </div>
        )}

        {phase === "result" && (
          <div data-testid="result-panel">
            <span>バトル終了</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

**フェーズの種類**:
| フェーズ | 表示するもの |
|----------|--------------|
| `command_select` | CommandPanel |
| `move_select` | SkillSelectPanel |
| `item_select` | ItemSelectPanel |
| `executing` | 「実行中...」 |
| `result` | 「バトル終了」 |

</details>

---

## 7. グリッドレイアウトでのキーボード操作

**Q: 2x2グリッドでの上下左右移動はどう実装する？**

<details>
<summary>Answer</summary>

**インデックスの計算でグリッド内を移動**。

```
インデックス配置:
[0] [1]
[2] [3]
```

```tsx
const handleKeyInput = (key: string) => {
  switch (key) {
    case "ArrowUp":
      // 上に移動（0,1→2,3、2,3→0,1）
      setSelectedIndex((prev) => (prev <= 1 ? prev + 2 : prev - 2));
      break;
    case "ArrowDown":
      // 下に移動
      setSelectedIndex((prev) => (prev >= 2 ? prev - 2 : prev + 2));
      break;
    case "ArrowLeft":
    case "ArrowRight":
      // 左右に移動（0↔1、2↔3）
      setSelectedIndex((prev) => (prev % 2 === 0 ? prev + 1 : prev - 1));
      break;
  }
};
```

**計算のポイント**:
- `prev % 2` で左右の列を判定（偶数=左、奇数=右）
- `prev <= 1` で上下の行を判定
- 上端/下端で折り返す

</details>

---

## 8. 無効化されたボタンの処理

**Q: `canCapture={false}` のときの動作は？**

<details>
<summary>Answer</summary>

**クリックもキーボード操作も無効化**する。

```tsx
// Props
interface CommandPanelProps {
  canCapture?: boolean;  // デフォルトtrue
}

// 表示の無効化
const isDisabled = cmd.command === "capture" && !canCapture;

<button
  disabled={isDisabled}
  className={`... ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
>
```

```tsx
// クリックの無効化
const handleCommandClick = (index: number) => {
  const command = COMMANDS[index];
  if (command.command === "capture" && !canCapture) {
    return;  // 何もしない
  }
  onSelectCommand(command.command);
};

// キーボードの無効化
case "Enter": {
  const command = COMMANDS[selectedIndex];
  if (command.command === "capture" && !canCapture) {
    return;  // 何もしない
  }
  onSelectCommand(command.command);
}
```

**3つの対策**:
1. `disabled` 属性でHTMLレベルで無効化
2. クラスで視覚的に無効化を表示
3. ハンドラ内で早期リターン

</details>

---

## 9. HPバーの動的スタイル

**Q: HPに応じてバーの色を変える方法は？**

<details>
<summary>Answer</summary>

**HP割合を計算し、関数で色クラスを返す**。

```tsx
// 色を決定する関数
function getHpBarColor(hpPercentage: number): string {
  if (hpPercentage > 50) return "bg-green-500";  // 緑
  if (hpPercentage > 25) return "bg-yellow-500"; // 黄
  return "bg-red-500";  // 赤
}

// HP割合を計算
const hpPercentage = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));

// 表示
<div
  className={`h-full transition-all duration-300 ${getHpBarColor(hpPercentage)}`}
  style={{ width: `${hpPercentage}%` }}
/>
```

**ポイント**:
- `Math.max(0, Math.min(100, ...))` で0-100に制限
- `transition-all duration-300` でアニメーション
- `style={{ width }}` で動的な幅

</details>

---

## 10. data-* 属性でテストと状態表示

**Q: `data-phase` や `data-selected` 属性の用途は？**

<details>
<summary>Answer</summary>

**テストとデバッグのための情報付与**。

```tsx
<div
  data-testid="battle-screen"
  data-phase={phase}  // 現在のフェーズ
>

<button
  data-testid={`command-${cmd.command}`}
  data-selected={isSelected}  // 選択状態
  data-disabled={isDisabled}  // 無効状態
>
```

**用途1: テストで状態を確認**
```tsx
const panel = screen.getByTestId("battle-screen");
expect(panel).toHaveAttribute("data-phase", "command_select");

const button = screen.getByTestId("command-fight");
expect(button).toHaveAttribute("data-selected", "true");
```

**用途2: CSSセレクタでスタイル適用**
```css
[data-selected="true"] {
  border-color: var(--primary);
}
```

**用途3: ブラウザのDevToolsでデバッグ**
- 要素を検査して現在の状態を確認できる

</details>

---

## 11. 条件付きスプレッド演算子

**Q: `playerGhostType={playerGhostType ?? undefined}` は何をしている？**

<details>
<summary>Answer</summary>

**nullをundefinedに変換**している。

```tsx
<BattleScreen
  playerGhostType={playerGhostType ?? undefined}
  //              null → undefined に変換
/>
```

**なぜ変換する？**
```tsx
// BattleScreenのProps
interface BattleScreenProps {
  playerGhostType?: string;  // undefinedは許可、nullは許可していない
}
```

**`??` 演算子（Nullish Coalescing）**:
- 左が `null` または `undefined` のとき、右を返す
- `playerGhostType ?? undefined`
  - `playerGhostType` がnull → `undefined`
  - `playerGhostType` が値 → その値

**似た演算子との違い**:
```tsx
null ?? "default"   // → "default"
null || "default"   // → "default"

0 ?? "default"      // → 0
0 || "default"      // → "default"（0はfalsyなので）
```

</details>

---

## 12. コンポーネント間のデータフロー

**Q: バトル画面全体のデータフローを整理すると？**

<details>
<summary>Answer</summary>

```
App.tsx
├── useBattleState() ← 状態管理
│
├── battleState（状態）
│   ├── phase
│   ├── playerGhost
│   ├── enemyGhost
│   └── messages
│
├── アクション関数
│   ├── startBattle()
│   ├── setPhase()
│   ├── executePlayerAction()
│   └── resetBattle()
│
└── 子コンポーネントへの流れ
    │
    BattleScreen ← phase, playerGhost, enemyGhost
    ├── GhostDisplay (enemy) ← ghostState, isEnemy=true
    ├── GhostDisplay (player) ← ghostState, isEnemy=false
    └── commandPanel (slot)
        │
        CommandPanel ← onSelectCommand
        └── ボタンクリック → onSelectCommand("fight")
                            ↓
        App.tsx handleBattleCommand
                            ↓
        executePlayerAction() → 状態更新
```

**データの流れ**:
1. **状態**: App → BattleScreen → GhostDisplay（下向き）
2. **イベント**: CommandPanel → App（上向き、コールバック経由）
3. **更新**: App内でuseStateが更新 → 再レンダリング

</details>

---

## 13. propsのデフォルト値パターン

**Q: オプショナルpropsにデフォルト値を設定するパターンは？**

<details>
<summary>Answer</summary>

**分割代入でデフォルト値を指定**。

```tsx
interface CommandPanelProps {
  canCapture?: boolean;           // 型定義でオプショナル
  initialSelectedIndex?: number;
}

function CommandPanel({
  canCapture = true,              // デフォルト: true
  initialSelectedIndex = 0,       // デフォルト: 0
  onSelectCommand,
}: CommandPanelProps) {
  // canCaptureは確実にboolean
  // initialSelectedIndexは確実にnumber
}
```

**使い方**:
```tsx
// すべてデフォルト
<CommandPanel onSelectCommand={handler} />

// 一部だけ指定
<CommandPanel
  onSelectCommand={handler}
  canCapture={false}  // これだけ上書き
/>
```

**利点**:
- 呼び出し側のコードがシンプルに
- よく使う設定をデフォルトにできる
- 型安全性を維持

</details>

---

## 14. アニメーションクラスの使い方

**Q: `animate-pulse` や `animate-spin` は何？**

<details>
<summary>Answer</summary>

**Tailwind CSSの組み込みアニメーション**。

```tsx
// ローディングスピナー
<div className="animate-spin rounded-full border-4 border-t-purple-500" />

// 実行中の点滅
<span className="animate-pulse">実行中...</span>

// HPバーのトランジション
<div className="transition-all duration-300" style={{ width: `${hp}%` }} />
```

**主なアニメーション**:
| クラス | 効果 |
|--------|------|
| `animate-spin` | 回転（ローディング） |
| `animate-pulse` | フェードイン/アウト |
| `animate-bounce` | 上下にバウンド |
| `transition-all` | 変化をなめらかに |
| `duration-300` | 300msかけて変化 |

**HPバーのアニメーション**:
```tsx
<div
  className="h-full transition-all duration-300 bg-green-500"
  style={{ width: `${hpPercentage}%` }}
/>
// widthが変わると300msかけて滑らかに変化
```

</details>

---

## 理解度チェック

以下の質問に答えられたら、Step 5は完了です：

1. [ ] `React.ReactNode` を使って柔軟にコンポーネントを受け取る方法を説明できる
2. [ ] 状態をリフトアップする理由とパターンを説明できる
3. [ ] 再利用可能なコンポーネントの設計方法を説明できる
4. [ ] フェーズに応じた条件分岐のパターンを実装できる
5. [ ] バトル画面全体のデータフロー（親→子、子→親）を図示できる
