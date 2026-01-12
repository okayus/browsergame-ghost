# フェーズ4: UIコンポーネント調査結果

## 調査概要

| 項目 | 内容 |
|------|------|
| 調査日 | 2026-01-12 |
| 対象ディレクトリ | `components/`配下 6カテゴリ |
| 総ファイル数 | 約34ファイル（テスト除く） |

---

## 調査目的（Why）

- UIコンポーネントの構成パターンを理解する
- キーボード操作の実装パターンを把握する
- Tailwind CSSの使用パターンを確認する

---

## 調査方法（How）

1. 各カテゴリから代表的なコンポーネントを抽出
2. コンポーネントの責務・props・実装パターンを分析
3. 共通のパターンを識別

---

## コンポーネントカテゴリ

```
components/
├── auth/          認証関連画面
│   ├── WelcomeScreen.tsx
│   ├── LoadingScreen.tsx
│   └── ErrorScreen.tsx
├── battle/        バトル画面（最大のカテゴリ）
│   ├── BattleScreen.tsx
│   ├── GhostDisplay.tsx
│   ├── CommandPanel.tsx
│   ├── SkillSelectPanel.tsx
│   ├── ItemSelectPanel.tsx
│   ├── CaptureItemPanel.tsx
│   ├── GhostSwapPanel.tsx
│   ├── VictoryPanel.tsx
│   ├── DefeatPanel.tsx
│   ├── EscapeResultPanel.tsx
│   ├── CaptureSuccessPanel.tsx
│   ├── CaptureFailurePanel.tsx
│   └── MoveLearnPanel.tsx
├── error/         エラー処理
│   └── ErrorBoundary.tsx
├── game/          ゲーム共通
│   ├── GameContainer.tsx
│   ├── MessageBox.tsx
│   ├── SaveStatus.tsx
│   └── ScreenTransition.tsx
├── map/           マップ画面
│   ├── MapScreen.tsx
│   └── MapGrid.tsx
├── menu/          メニュー画面
│   ├── MenuScreen.tsx
│   └── SaveFeedback.tsx
└── party/         パーティ画面
    ├── PartyScreen.tsx
    ├── GhostDetailPanel.tsx
    └── GhostSummaryCard.tsx
```

---

## 詳細分析

### game/GameContainer.tsx（131行）

**責務**: ゲーム全体のコンテナ・キーボードイベントハンドリング

**サポートキー**:
```typescript
const SUPPORTED_KEYS = [
  "w", "a", "s", "d", "W", "A", "S", "D",      // 移動
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
  "Enter", "Escape", " ",                       // 決定・キャンセル
  "1", "2", "3", "4",                          // 数字（メニュー選択）
];
```

**レイアウト**:
```
┌─────────────────────────────────────────┐
│  800px × 600px の固定サイズコンテナ      │
│                                          │
│  border-4 border-ghost-primary           │
│  bg-ghost-surface                        │
│  rounded-lg shadow-2xl                   │
│                                          │
│  ScreenTransition (オーバーレイ)         │
└─────────────────────────────────────────┘
```

**設計パターン**:
- Compound Components: childrenで各画面を受け取る
- キーイベントはwindowレベルでリッスン
- トランジション中はキー入力を無効化

---

### map/MapScreen.tsx（118行）

**責務**: マップ画面の表示・移動操作

**構造**:
```
┌───────────────────────────────────────┐
│           マップ名                     │
├───────────────────────────────────────┤
│                                       │
│           MapGrid                     │
│        (tileSize=40px)                │
│                                       │
├───────────────────────────────────────┤
│  操作説明: WASD/矢印 | メニュー: ESC   │
│  位置: (x, y)                         │
└───────────────────────────────────────┘
```

**キー入力パターン**:
```typescript
function getDirectionFromKey(key: string): Direction | null {
  switch (key) {
    case "w": case "ArrowUp": return "up";
    case "s": case "ArrowDown": return "down";
    // ...
  }
}
```

---

### battle/BattleScreen.tsx（97行）

**責務**: バトル画面のレイアウト管理

**構造**:
```
┌───────────────────────────────────────┐
│  敵ゴースト (GhostDisplay isEnemy)    │
│  [ステータス] ─────────── [スプライト] │
├───────────────────────────────────────┤
│                                       │
│         エフェクトエリア               │
│                                       │
├───────────────────────────────────────┤
│  プレイヤーゴースト (GhostDisplay)    │
│  [スプライト] ─────────── [ステータス] │
├───────────────────────────────────────┤
│                                       │
│      コマンドパネルエリア (180px)      │
│      (commandPanel props)             │
│                                       │
└───────────────────────────────────────┘
```

**設計パターン**:
- **Compound Components**: commandPanelをpropsで受け取る
- フェーズに応じた表示切替

---

### battle/CommandPanel.tsx（151行）

**責務**: バトルコマンド選択UI

**コマンド一覧**:
| コマンド | ラベル | 説明 |
|----------|--------|------|
| fight | たたかう | 技を選んで攻撃する |
| item | アイテム | アイテムを使う |
| capture | 捕まえる | ゴーストを捕まえる |
| run | 逃げる | バトルから逃げる |

**レイアウト**:
```
┌───────────┬───────────┐
│ たたかう  │ アイテム  │
├───────────┼───────────┤
│ 捕まえる  │ 逃げる    │
├───────────┴───────────┤
│     選択中の説明       │
└───────────────────────┘
```

**キー操作**:
- WASD/矢印: 2x2グリッド内を移動
- Enter/Space: 選択確定

---

### battle/GhostDisplay.tsx（143行）

**責務**: ゴースト情報の表示

**コンポーネント構成**:
```
GhostDisplay
├── GhostInfoPanel (ステータス)
│   ├── 名前 + レベル
│   ├── タイプバッジ
│   ├── HPバー (色変化: 緑→黄→赤)
│   └── HP数値
└── GhostSprite (絵文字表示)
```

**HPバー色ロジック**:
```typescript
function getHpBarColor(hpPercentage: number): string {
  if (hpPercentage > 50) return "bg-green-500";
  if (hpPercentage > 25) return "bg-yellow-500";
  return "bg-red-500";
}
```

---

### menu/MenuScreen.tsx（214行）

**責務**: メニュー画面UI

**メニュー項目**:
| ID | ラベル | 説明 | 状態 |
|----|--------|------|------|
| party | パーティ | ゴーストの状態を確認 | 有効 |
| items | アイテム | アイテムを確認 | 有効 |
| save | セーブ | ゲームを保存 | saveStatus依存 |
| settings | 設定 | ゲーム設定 | 無効（未実装） |
| close | とじる | メニューを閉じる | 有効 |

**セーブ機能連携**:
```typescript
// saveStatus propsでセーブ機能を有効化
{saveStatus && saveStatus.type !== "idle" && (
  <SaveFeedback
    status={saveStatus}
    onRetry={onSaveRetry}
    onDismiss={onDismissSave}
  />
)}
```

---

### party/PartyScreen.tsx（185行）

**責務**: パーティ管理画面

**2つのモード**:
1. **list**: ゴースト一覧表示（GhostSummaryCard）
2. **detail**: 選択ゴーストの詳細（GhostDetailPanel）

**構造**:
```
┌───────────────────────────────────────┐
│  パーティ                             │
├───────────────────────────────────────┤
│  ┌─────────────────────────────────┐  │
│  │ Ghost 1 (GhostSummaryCard)      │  │
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │ Ghost 2                         │  │
│  └─────────────────────────────────┘  │
│  ...                                  │
│  ┌─────────────────────────────────┐  │
│  │ もどる                          │  │
│  └─────────────────────────────────┘  │
├───────────────────────────────────────┤
│  選択してステータス確認 / Esc: もどる │
└───────────────────────────────────────┘
```

---

### auth/WelcomeScreen.tsx（54行）

**責務**: 未認証ユーザー向けウェルカム画面

**構造**:
```
┌───────────────────────────────────────┐
│                                       │
│          Ghost Game                   │
│                                       │
│  ゴーストを捕まえて、育てて、バトル    │
│                                       │
│  神秘的なゴーストたちが住む世界を...   │
│                                       │
│  ┌──────────┐  ┌──────────┐          │
│  │サインイン │  │ 新規登録 │          │
│  └──────────┘  └──────────┘          │
│                                       │
└───────────────────────────────────────┘
```

**Clerk連携**: `onSignIn`/`onSignUp`でClerkのモーダルを開く

---

## 共通設計パターン

### 1. キー入力の伝播パターン

```
GameContainer (windowレベルでkeydownをリッスン)
      │
      │ onKeyDown prop
      ▼
  各画面コンポーネント
      │
      │ onKeyInput prop
      ▼
  各パネルコンポーネント
```

**実装例**:
```typescript
// 親からのキー入力を処理
useEffect(() => {
  if (onKeyInput) {
    handleKeyInput(onKeyInput);
  }
}, [onKeyInput]);
```

### 2. 選択状態の管理パターン

```typescript
const [selectedIndex, setSelectedIndex] = useState(0);

// キーで選択移動
switch (key) {
  case "ArrowUp":
    setSelectedIndex(prev => prev > 0 ? prev - 1 : items.length - 1);
    break;
  case "Enter":
    onSelect(items[selectedIndex]);
    break;
}
```

### 3. Tailwindのカスタムカラー

```css
/* 使用されているカスタムカラー */
ghost-primary       /* メインカラー（紫系） */
ghost-primary-light /* 明るい紫 */
ghost-bg            /* 背景（暗いグレー） */
ghost-surface       /* サーフェス */
ghost-border        /* ボーダー */
ghost-text          /* テキスト */
ghost-text-bright   /* 明るいテキスト */
ghost-text-muted    /* 薄いテキスト */
```

### 4. data-testid パターン

```typescript
// テスト用属性の一貫した付与
<div
  data-testid="battle-screen"
  data-phase={phase}
  data-selected={isSelected}
  data-disabled={isDisabled}
>
```

### 5. Compound Components パターン

```typescript
// BattleScreenはcommandPanelを子要素として受け取る
<BattleScreen
  phase={phase}
  commandPanel={
    phase === "command_select" ? (
      <CommandPanel onSelectCommand={...} />
    ) : phase === "move_select" ? (
      <SkillSelectPanel ... />
    ) : undefined
  }
/>
```

---

## コンポーネント依存関係

```
App.tsx
├── GameContainer
│   ├── MapScreen ─────► MapGrid
│   ├── BattleScreen
│   │   ├── GhostDisplay (x2)
│   │   └── commandPanel (条件分岐)
│   │       ├── CommandPanel
│   │       ├── SkillSelectPanel
│   │       ├── ItemSelectPanel
│   │       └── CaptureSuccessPanel
│   ├── MenuScreen ────► SaveFeedback
│   └── PartyScreen
│       ├── GhostSummaryCard
│       └── GhostDetailPanel
├── LoadingScreen
├── ErrorScreen
└── WelcomeScreen
```

---

## スタイリングパターン

### 固定サイズコンテナ
```typescript
className="h-[600px] w-[800px]"  // ゲーム画面
className="h-[180px]"            // コマンドパネル
className="h-20 w-20"            // ゴーストスプライト
```

### 選択状態の視覚化
```typescript
className={`
  ${isSelected
    ? "border-ghost-primary bg-ghost-primary/20 text-ghost-text-bright"
    : "border-ghost-border bg-ghost-surface text-ghost-text"
  }
  ${isDisabled
    ? "cursor-not-allowed opacity-50"
    : "cursor-pointer hover:border-ghost-primary-light"
  }
`}
```

### アニメーション
```typescript
className="animate-pulse"           // ローディング
className="transition-all duration-300"  // HP バー変化
```

---

## 気づき・課題

### 良い点

1. **一貫したキー操作パターン**: 全コンポーネントで統一
2. **テスト容易性**: data-testid属性の一貫した付与
3. **アクセシビリティ**: role属性、適切なボタン要素の使用
4. **責務分離**: 各コンポーネントが単一責務

### 改善余地

1. **キー入力のuseEffect**: biome-ignoreコメントが多い
2. **スプライト表示**: 現状絵文字（将来的に画像？）
3. **アニメーション**: 最小限（エフェクト未実装）

---

## 調査完了

- [x] フェーズ1: エントリーポイント
- [x] フェーズ2: API層
- [x] フェーズ2.5: sharedパッケージ
- [x] フェーズ3: 状態管理フック
- [x] フェーズ4: UIコンポーネント
