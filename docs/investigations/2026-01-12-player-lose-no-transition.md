# 調査: プレイヤーHP0時にマップ画面に遷移しない問題

## 問題概要
バトル中にプレイヤーのHPが0になった場合、マップ画面に遷移しない。

## 調査日時
2026-01-12

## 調査プロセス

### 1. 仮説の設定

**初期仮説**: バトル終了時の画面遷移処理に問題がある可能性

考えられる原因:
1. `player_lose`の終了理由が正しく設定されていない
2. `player_lose`時の画面遷移処理が欠落している
3. 特定のアクション（捕獲など）でのみ問題が発生している

### 2. 調査手順

#### Step 1: `player_lose`のキーワード検索

```bash
grep -n "player_lose" packages/frontend/src/**/*.ts
```

**発見事項**:
- `useBattleState.ts`: 複数箇所で`endReason = "player_lose"`が設定されている（行264, 312, 356, 440, 449）
- `useBattleEndSync.ts`: `player_lose`時のHP回復処理が実装されている

→ `player_lose`の設定自体は正しく行われている

#### Step 2: バトル終了時の画面遷移処理を確認

**App.tsx内の各アクションハンドラを調査**

##### handleMoveSelect（技選択後の処理）- 行263-275
```typescript
if (result.battleEnded && result.endReason) {
  // HP同期（勝利/敗北時）
  syncPartyHp(battleState, result.endReason, activeGhostId);
  // バトル終了処理
  setTimeout(() => {
    resetBattle();
    setScreen("map");  // ← 遷移処理あり
  }, 2000);
}
```
→ 正常に遷移処理がある

##### handleBattleCommand - "capture"（捕獲コマンド）- 行189-208
```typescript
if (result.battleEnded && result.endReason) {
  syncPartyHp(battleState, result.endReason, activeGhostId);
  // 捕獲成功時は捕獲ゴーストをセット
  if (result.endReason === "capture" && battleState.enemyGhost) {
    setCapturedGhost(battleState.enemyGhost.ghost);
  }
  // ← player_lose時の遷移処理がない！
}
```

##### handleItemSelect - 捕獲アイテム（行412-425）
```typescript
if (result.battleEnded && result.endReason) {
  syncPartyHp(battleState, result.endReason, activeGhostId);
  if (result.endReason === "capture" && battleState.enemyGhost) {
    setCapturedGhost(battleState.enemyGhost.ghost);
  }
  // ← player_lose時の遷移処理がない！
} else {
  setPhase("command_select");
}
```

### 3. 根本原因の特定

**原因**: PR #79で捕獲成功時の処理を`CaptureSuccessPanel`に移行した際、`player_lose`時の画面遷移処理が欠落した。

**詳細な流れ**:

1. プレイヤーが「捕まえる」コマンド or 捕獲アイテムを使用
2. 捕獲に失敗（`endReason !== "capture"`）
3. 敵ゴーストの反撃でプレイヤーのHPが0になる
4. `result.battleEnded = true`, `result.endReason = "player_lose"`
5. HP同期は実行される
6. しかし`if (result.endReason === "capture")`の条件に合致しないため、`setCapturedGhost`は呼ばれない
7. **画面遷移のための`setTimeout`もないため、バトル画面のまま停止**

### 4. 影響範囲

| アクション | player_win | player_lose | escape | capture |
|-----------|------------|-------------|--------|---------|
| 技選択 (handleMoveSelect) | ✅ 遷移する | ✅ 遷移する | - | - |
| 逃走 (handleBattleCommand) | - | - | ✅ 遷移する | - |
| 捕まえる (handleBattleCommand) | - | ❌ 遷移しない | - | ✅ CaptureSuccessPanelで処理 |
| 捕獲アイテム (handleItemSelect) | - | ❌ 遷移しない | - | ✅ CaptureSuccessPanelで処理 |

→ 「捕まえる」コマンドと捕獲アイテム使用時のみ、`player_lose`の遷移処理が欠落

## 結論

### 原因
PR #79で捕獲成功時の処理を`CaptureSuccessPanel`経由に変更した際、`capture`以外の終了理由（特に`player_lose`）に対する画面遷移処理を追加し忘れた。

### 修正方針
`handleBattleCommand`の"capture"と`handleItemSelect`の捕獲アイテム処理で、`result.endReason !== "capture"`の場合にも`setTimeout`で画面遷移を行うように修正する。

```typescript
if (result.battleEnded && result.endReason) {
  syncPartyHp(battleState, result.endReason, activeGhostId);
  if (result.endReason === "capture" && battleState.enemyGhost) {
    setCapturedGhost(battleState.enemyGhost.ghost);
  } else {
    // 捕獲以外の終了理由（player_lose等）の場合
    setTimeout(() => {
      resetBattle();
      setScreen("map");
      setPlayerGhostType(null);
      setEnemyGhostType(null);
    }, 2000);
  }
}
```
