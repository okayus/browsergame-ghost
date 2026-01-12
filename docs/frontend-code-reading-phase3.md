# フェーズ3: 状態管理フック調査結果

## 調査概要

| 項目 | 内容 |
|------|------|
| 調査日 | 2026-01-12 |
| 対象ファイル | `hooks/`配下 12ファイル |
| 総行数 | 約1,900行 |

---

## 調査目的（Why）

- ゲーム状態管理の全体像を理解する
- App.tsxで使われているフックの責務を明確にする
- フック間の依存関係・データフローを把握する

---

## 調査方法（How）

1. `hooks/index.ts`でエクスポート一覧を確認
2. 基礎フック（認証、ゲーム状態）から順に読み込み
3. バトル関連フックを集中的に分析
4. フック間の依存関係をマッピング

---

## 調査結果（What）

### フック一覧

| フック名 | 行数 | 責務 |
|----------|------|------|
| `useAuthState` | 64 | Clerk認証状態の管理 |
| `useGameState` | 224 | ゲーム全体状態（画面、パーティ、インベントリ） |
| `useMapState` | 249 | マップ移動・エンカウント判定 |
| `useBattleState` | 517 | **最大** バトルフェーズ・ターン実行 |
| `useBattleHandlers` | 375 | バトルコマンドのハンドラ集約 |
| `useBattleTransition` | 70 | バトル終了→マップ遷移 |
| `useBattleEndSync` | 133 | バトル終了時HP同期 |
| `useCaptureHandlers` | 115 | 捕獲成功時のハンドラ |
| `useBattleItem` | 195 | 回復・捕獲アイテム使用 |
| `useInventoryState` | 181 | インベントリ操作（未使用?） |
| `useScreenTransition` | 113 | 画面遷移アニメーション |

---

## 詳細分析

### 1. useAuthState（64行）

**責務**: Clerk認証状態から表示画面を決定

**状態**:
```typescript
interface AuthState {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  currentScreen: "welcome" | "loading" | "authenticated";
}
```

**ロジック**:
```
isLoaded=false → "loading"
isSignedIn=false → "welcome"
isSignedIn=true → "authenticated"
```

**設計**: 読み取り専用フック、副作用なし

---

### 2. useGameState（224行）

**責務**: ゲーム全体の状態を統合管理

**状態**:
```typescript
interface GameState {
  currentScreen: "map" | "battle" | "party" | "menu" | "shop";
  party: Party | null;
  inventory: Inventory;
  isLoaded: boolean;
}
```

**提供するアクション**:

| アクション | 説明 |
|------------|------|
| `setScreen` | 画面切り替え |
| `setParty` / `updatePartyGhost` | パーティ更新 |
| `addGhostToParty` / `swapPartyGhost` | パーティ操作 |
| `setInventory` / `useItem` / `addItem` | インベントリ操作 |
| `setLoaded` / `resetGame` | ライフサイクル |

**特徴**: 中央集権的な状態管理（Contextではなくフックで状態を持つ）

---

### 3. useMapState（249行）

**責務**: マップ移動とエンカウント判定

**状態**:
```typescript
interface MapState {
  currentMap: MapData | null;
  position: PlayerPosition;
}
```

**主要ロジック**:

1. **移動判定**: `canMoveTo(x, y)` → タイルのwalkableをチェック
2. **エンカウント判定**:
   - 草むら(`type === "grass"`)のみ
   - `encounterRate`確率でエンカウント発生
   - 重み付き抽選でゴースト種族決定
   - レベルはminLevel〜maxLevelでランダム

**設計**: テスト可能（乱数を外部注入可能）

---

### 4. useBattleState（517行）⚠️ 最大

**責務**: バトルのコア状態管理

**状態**:
```typescript
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

**フェーズ遷移**:
```
command_select ←→ move_select
      │        ←→ item_select
      │
      ▼ (アクション実行)
executing → result / capture_success
```

**executePlayerAction()の処理フロー**:

```
アクション種別判定
├── escape: 逃走判定 → (成功)終了 / (失敗)敵ターン
├── item: HP回復 → 敵ターン
├── capture: 捕獲判定 → (成功)終了 / (失敗)敵ターン
└── attack: 素早さ順でターン実行
              ├── プレイヤー先攻 → 敵ターン
              └── 敵先攻 → プレイヤーターン
```

**敵AI**: `selectEnemyMove()` - PP残りの技からランダム選択

---

### 5. useBattleHandlers（375行）

**責務**: バトルコマンドのハンドラを集約

**App.tsxから抽出されたハンドラ**:

| ハンドラ | トリガー | 処理 |
|----------|----------|------|
| `handleBattleCommand` | コマンド選択 | fight/item/capture/run分岐 |
| `handleMoveSelect` | 技選択 | attack実行 |
| `handleMoveSelectBack` | 戻るボタン | command_selectへ |
| `handleItemSelect` | アイテム選択 | 回復/捕獲実行 |
| `handleItemSelectBack` | 戻るボタン | command_selectへ |

**ユーティリティ**:
- `getPlayerMoves()` - 表示用技リスト生成
- `getBattleItems()` - 表示用アイテムリスト生成（回復・捕獲のみ）

---

### 6. useBattleTransition（70行）

**責務**: バトル終了→マップ遷移の共通処理

```typescript
finishBattle(delay = 2000) {
  setTimeout(() => {
    resetBattle();
    setScreen("map");
    setPlayerGhostType(null);
    setEnemyGhostType(null);
  }, delay);
}
```

---

### 7. useBattleEndSync（133行）

**責務**: バトル終了時のHP同期

**ロジック**:
- 勝利/逃走/捕獲: バトル中HPをパーティに反映
- 敗北: パーティ全員をMAX HP回復

**セーブ連携**: `updatePendingSaveData({ party })`を呼び出し

---

### 8. useCaptureHandlers（115行）

**責務**: 捕獲成功後の処理

| ハンドラ | 処理 |
|----------|------|
| `handleAddCapturedToParty` | パーティに追加（上限6体） |
| `handleSendCapturedToBox` | ボックスに送る（未実装） |
| `handleSwapCapturedWithParty` | パーティと入れ替え |

---

### 9. useBattleItem（195行）

**責務**: アイテム使用ロジック

**純粋関数**:
- `applyHealingItem(item, ghost)` - HP回復計算
- `getCaptureBonus(item)` - 捕獲ボーナス計算

**フック関数**:
- `useHealingItem(item, ghostId)` - 回復アイテム使用（消費+HP更新+セーブ）
- `getCaptureItemBonus(item)` - 捕獲ボーナス取得

---

### 10. useInventoryState（181行）

**責務**: インベントリ単独管理（useGameStateと重複?）

**提供機能**:
- `useItem` / `addItem` / `removeItem`
- `getItemQuantity` / `hasItem`
- `getItemsByCategory`

**注**: useGameStateにも同様の機能があり、実際に使われているのはuseGameState側

---

### 11. useScreenTransition（113行）

**責務**: 画面遷移アニメーション管理

**状態**:
```typescript
interface ScreenTransitionState {
  isTransitioning: boolean;
  transitionType: "fade" | "battle" | "slide";
  pendingScreen: GameScreen | null;
}
```

**フロー**:
```
startTransition(toScreen)
  → isTransitioning=true
  → (アニメーション再生)
  → onTransitionComplete()
  → onScreenChange(pendingScreen)
  → isTransitioning=false
```

---

## フック依存関係図

```
App.tsx
   │
   ├── useAuthState ─────────────────────────────────┐
   │                                                 │
   ├── useGameState ◄────────────────────────────────┤
   │       │                                         │
   │       ├── (party, inventory, screen)            │
   │       │                                         │
   ├── useMapState                                   │
   │       │                                         │
   │       ├── (position, currentMap)                │
   │       │                                         │
   ├── useBattleState ◄──────────────────────────────┤
   │       │                                         │
   │       ├── (phase, playerGhost, enemyGhost)      │
   │       │                                         │
   ├── useBattleEndSync ────► useGameState           │
   │       │                                         │
   │       └── syncPartyHp()                         │
   │                                                 │
   ├── useBattleTransition ──► useGameState          │
   │       │                                         │
   │       └── finishBattle()                        │
   │                                                 │
   ├── useBattleHandlers ───► useBattleState         │
   │       │                  useGameState           │
   │       │                  useBattleEndSync       │
   │       │                  useBattleTransition    │
   │       │                                         │
   │       ├── handleBattleCommand()                 │
   │       ├── handleMoveSelect()                    │
   │       └── handleItemSelect()                    │
   │                                                 │
   └── useCaptureHandlers ──► useGameState           │
           │                  useBattleState         │
           │                                         │
           └── handleAddCapturedToParty()            │
                                                     │
                           API層 ◄───────────────────┘
                           useSaveDataQuery
                           useAutoSave
```

---

## 設計パターン

### 1. Reducer的パターン（useState + useCallback）

```typescript
const [state, setState] = useState(initialState);

const setScreen = useCallback((screen) => {
  setState(prev => ({ ...prev, currentScreen: screen }));
}, []);
```

**特徴**: Context不使用、各フックがローカル状態を持つ

### 2. テスト可能な設計

```typescript
// 乱数を外部注入可能
function move(direction: Direction, randomValue?: number) {
  const roll = randomValue ?? Math.random();
  // ...
}
```

### 3. Handler集約パターン

```typescript
// App.tsxからハンドラを抽出
function useBattleHandlers(props: Props) {
  const handleBattleCommand = useCallback(...);
  const handleMoveSelect = useCallback(...);
  // ...
  return { handleBattleCommand, handleMoveSelect, ... };
}
```

---

## データフロー図

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.tsx                                 │
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐              │
│  │ Auth     │    │ Game     │    │ Map          │              │
│  │ State    │    │ State    │    │ State        │              │
│  │          │    │          │    │              │              │
│  │ isAuth   │    │ party    │◄───│ position     │              │
│  │ screen   │    │ inventory│    │ currentMap   │              │
│  └──────────┘    │ screen   │    └──────────────┘              │
│                  └──────────┘            │                      │
│                       ▲                  │ エンカウント         │
│                       │                  ▼                      │
│                       │         ┌──────────────┐               │
│                       │         │ Battle       │               │
│                       │         │ State        │               │
│                       │         │              │               │
│  ┌──────────────┐    │         │ phase        │               │
│  │ Battle      │◄────┼─────────│ playerGhost  │               │
│  │ Handlers    │     │         │ enemyGhost   │               │
│  │             │     │         │ messages     │               │
│  │ command()   │     │         └──────────────┘               │
│  │ move()      │     │                │                        │
│  │ item()      │     │                │ HP同期                 │
│  └──────────────┘    │                ▼                        │
│                      │         ┌──────────────┐               │
│                      └─────────│ BattleEnd    │               │
│                                │ Sync         │               │
│                                └──────────────┘               │
│                                       │                        │
│                                       ▼                        │
│                                ┌──────────────┐               │
│                                │ AutoSave     │───► Backend    │
│                                │ (API層)      │                │
│                                └──────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 気づき・課題

### 良い点

1. **関心の分離**: 各フックが明確な責務を持つ
2. **テスタビリティ**: 乱数を外部注入可能、純粋関数の抽出
3. **リファクタリング済み**: App.tsxから適切にロジックが抽出されている

### 改善余地

1. **useBattleStateの肥大化**: 517行は大きい、さらに分割可能
2. **useInventoryStateの重複**: useGameStateと機能重複
3. **Context未使用**: prop drillingが多い（意図的かもしれない）
4. **敵AI**: 現状ランダム選択のみ、戦略性なし

---

## 次のステップ

- [x] フェーズ1完了
- [x] フェーズ2完了
- [x] フェーズ2.5完了
- [x] フェーズ3完了
- [ ] フェーズ4: UIコンポーネント調査
