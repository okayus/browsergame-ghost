# 調査: App.tsxのコード量が多い問題

## 問題概要
App.tsxのコード量が多く、メンテナンス性に懸念がある。

## 調査日時
2026-01-12

## 調査プロセス

### 1. 仮説の設定

**初期仮説**: App.tsxに複数の責務が集中している可能性

考えられる原因:
1. 1つのコンポーネントに多くの責務が集中している
2. 重複コードが存在している
3. ハンドラ関数が肥大化している
4. 状態管理ロジックがコンポーネント内に散在している

### 2. 調査手順

#### Step 1: 行数の確認

```bash
wc -l packages/frontend/src/App.tsx
```

**結果**: 775行

#### Step 2: 他ファイルとの比較

```bash
wc -l packages/frontend/src/**/*.tsx | sort -n
```

**発見事項**:
- App.tsx (775行) は、テストファイルを除くと最大のファイル
- 次に大きいファイルは約200-300行程度

#### Step 3: コンポーネント構造の分析

**ファイル構造**:
```
App.tsx
├── AuthenticatedContent (行50-739) - 689行
└── App (行747-773) - 26行
```

→ `AuthenticatedContent`が全体の約89%を占めている

#### Step 4: AuthenticatedContentの責務分析

1. **セーブデータ管理** (行51-57)
   - useSaveDataQuery, useAutoSave, useSaveDataMutation

2. **ゲーム状態管理** (行59-77)
   - useGameState, useMapState, useBattleState

3. **バトル終了時のHP同期** (行79-80)
   - useBattleEndSync

4. **ローカル状態管理** (行83-98)
   - playerGhostType, enemyGhostType, keyInput, capturedGhost, speciesMap

5. **データロード処理** (行101-131)
   - applyLoadedData, useEffect for initialization

6. **移動・エンカウント処理** (行133-176)
   - handleMove, handleEncounter

7. **バトルコマンド処理** (行178-250)
   - handleBattleCommand

8. **技選択処理** (行253-322)
   - handleMoveSelect, handleMoveSelectBack, getPlayerMoves

9. **アイテム処理** (行324-468)
   - getBattleItems, handleItemSelect, handleItemSelectBack

10. **捕獲完了処理** (行470-512)
    - finishCaptureAndBattle, handleAddCapturedToParty, handleSendCapturedToBox, handleSwapCapturedWithParty

11. **メニュー処理** (行514-582)
    - handleOpenMenu, handleCloseMenu, handleSave, handleSaveRetry, handleDismissSave, handleMenuSelect, handleCloseParty

12. **キー入力処理** (行584-644)
    - handleKeyDown

13. **レンダリング** (行646-738)
    - 条件付きコンポーネント表示

#### Step 5: 重複パターンの検出

```bash
grep -n "setTimeout" packages/frontend/src/App.tsx
```

**発見: バトル終了時の遷移処理が5箇所で重複**

| 行番号 | 処理場所 | 遅延時間 |
|-------|---------|---------|
| 208 | handleBattleCommand "capture" (player_lose時) | 2000ms |
| 229 | handleBattleCommand "run" | 1500ms |
| 278 | handleMoveSelect | 2000ms |
| 382 | handleItemSelect 回復アイテム | 2000ms |
| 431 | handleItemSelect 捕獲アイテム (player_lose時) | 2000ms |

**重複コード例**:
```typescript
// 5箇所でほぼ同じコード
setTimeout(() => {
  resetBattle();
  setScreen("map");
  setPlayerGhostType(null);
  setEnemyGhostType(null);
}, 2000);
```

**追加発見: keyInputリセットも3箇所で重複**

```typescript
// 行590, 598, 606
setTimeout(() => setKeyInput(undefined), 0);
```

### 3. 根本原因の特定

**原因1: 単一コンポーネントへの責務集中**

`AuthenticatedContent`が以下の責務を全て担っている:
- ゲーム状態の管理
- バトルロジックのオーケストレーション
- 画面遷移ロジック
- キー入力のハンドリング
- UI表示の制御

**原因2: 重複コードの存在**

バトル終了時の遷移処理が5箇所で重複しており、DRY原則に違反している。

**原因3: 抽象化レベルの混在**

低レベルの処理（setTimeoutによる遅延）と高レベルの処理（画面遷移）が同じ場所に混在している。

### 4. 影響分析

| 問題点 | 影響 | 重大度 |
|-------|------|--------|
| 責務の集中 | 変更時の影響範囲が大きい | 中 |
| 重複コード | 修正漏れのリスク（PR#80で実際に発生） | 高 |
| テストの困難さ | 単体テストが書きにくい | 中 |
| 可読性の低下 | コードの理解に時間がかかる | 低 |

## 結論

### 発見事項

1. **App.tsxは775行**で、frontendパッケージで最大の非テストファイル
2. **AuthenticatedContentが689行**（約89%）を占有
3. **バトル終了時の遷移処理が5箇所で重複**している
4. **13以上の責務**が1つのコンポーネントに集中している

### リファクタリング提案

#### 優先度: 高

1. **バトル終了処理の共通化**
   ```typescript
   // useBattleTransition.ts などに抽出
   const finishBattle = useCallback((delay: number = 2000) => {
     setTimeout(() => {
       resetBattle();
       setScreen("map");
       setPlayerGhostType(null);
       setEnemyGhostType(null);
     }, delay);
   }, [resetBattle, setScreen, setPlayerGhostType, setEnemyGhostType]);
   ```

#### 優先度: 中

2. **バトルハンドラの分離**
   - `useBattleHandlers.ts`: handleBattleCommand, handleMoveSelect, handleItemSelect

3. **メニューハンドラの分離**
   - `useMenuHandlers.ts`: handleOpenMenu, handleCloseMenu, handleSave等

4. **キー入力処理の分離**
   - `useKeyboardInput.ts`: handleKeyDown, keyInputステート管理

#### 優先度: 低

5. **画面ごとのコンテナコンポーネント作成**
   - `BattleContainer.tsx`: バトル画面のロジックとレンダリング
   - `MapContainer.tsx`: マップ画面のロジックとレンダリング

### 定量的目標

| 指標 | 現状 | 目標 |
|-----|------|------|
| App.tsx行数 | 775行 | 300行以下 |
| AuthenticatedContent行数 | 689行 | 200行以下 |
| 重複コード箇所 | 5箇所 | 0箇所 |

