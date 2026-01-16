# フロントエンドリファクタリング計画

## 概要

| 項目 | 内容 |
|------|------|
| 作成日 | 2026-01-16 |
| ベース | Vercel React Best Practices (v1.0.0) |
| 対象 | packages/frontend |

---

## レビュー結果サマリー

### 発見された問題の優先度別分類

| 優先度 | カテゴリ | 問題数 | 影響 |
|--------|----------|--------|------|
| CRITICAL | Re-render最適化 | 5件 | パフォーマンス低下、バグリスク |
| HIGH | データ構造最適化 | 3件 | O(n)ルックアップの累積 |
| MEDIUM | イベントハンドラ最適化 | 4件 | 再サブスクライブコスト |
| LOW | コード構成 | 2件 | 保守性 |

---

## 詳細レビュー結果

### 1. CRITICAL: Re-render最適化問題

#### 1.1 Functional setState未使用（Rule: rerender-functional-setstate）

**問題箇所**: `useGameState.ts:94-113, 115-138`

```typescript
// 問題: state.partyを依存配列に含むため、partyが変わるたびにコールバック再生成
const addGhostToParty = useCallback(
  (ghost: OwnedGhost): boolean => {
    if (!state.party || state.party.ghosts.length >= 6) {
      return false;
    }
    setState((prev) => { /* ... */ });
    return true;
  },
  [state.party], // ← 問題: 毎回再生成
);
```

**推奨修正**:
```typescript
const addGhostToParty = useCallback(
  (ghost: OwnedGhost): boolean => {
    let added = false;
    setState((prev) => {
      if (!prev.party || prev.party.ghosts.length >= 6) {
        return prev; // 変更なし
      }
      added = true;
      return {
        ...prev,
        party: { ghosts: [...prev.party.ghosts, ghost] },
      };
    });
    return added;
  },
  [], // ← 依存なし、安定したコールバック
);
```

**影響**: 5箇所（addGhostToParty, swapPartyGhost, useItem）

---

#### 1.2 キー入力パターンの問題（Rule: rerender-dependencies）

**問題箇所**: 全パネルコンポーネント（CommandPanel, SkillSelectPanel, ItemSelectPanel等）

```typescript
// 問題: biome-ignoreでdependency警告を抑制
// biome-ignore lint/correctness/useExhaustiveDependencies: ...
useEffect(() => {
  if (onKeyInput) {
    handleKeyInput(onKeyInput);
  }
}, [onKeyInput]); // handleKeyInputが欠落 → stale closure
```

**現在のアンチパターン**:
```
App.tsx → keyInput state → setTimeout → 各パネル → useEffect → handleKeyInput
```

**推奨修正（useEffectEvent使用）**:
```typescript
import { useEffectEvent } from 'react';

function CommandPanel({ onKeyInput, onSelectCommand, ... }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 安定したイベントハンドラ
  const handleKeyInput = useEffectEvent((key: string) => {
    switch (key) {
      case "ArrowUp":
        setSelectedIndex((prev) => /* ... */);
        break;
      // ...
    }
  });

  useEffect(() => {
    if (onKeyInput) {
      handleKeyInput(onKeyInput);
    }
  }, [onKeyInput]); // handleKeyInputは依存不要（useEffectEvent）
}
```

**影響**: 6コンポーネント

---

#### 1.3 不必要な状態経由のキー入力（Rule: rerender-defer-reads）

**問題箇所**: `App.tsx:86, 296-320`

```typescript
// 問題: キー入力のたびにApp全体が再レンダー
const [keyInput, setKeyInput] = useState<string | undefined>(undefined);

const handleKeyDown = (key: string) => {
  if (gameState.currentScreen === "battle") {
    setKeyInput(key);                    // ← 再レンダートリガー
    setTimeout(() => setKeyInput(undefined), 0); // ← さらに再レンダー
    return;
  }
  // ...
};
```

**推奨修正（Refパターン）**:
```typescript
const keyInputRef = useRef<string | undefined>(undefined);
const keyInputSubscribers = useRef<Set<(key: string) => void>>(new Set());

const handleKeyDown = useCallback((key: string) => {
  keyInputRef.current = key;
  keyInputSubscribers.current.forEach(cb => cb(key));
}, []);

// カスタムフックで購読
function useKeyInput(handler: (key: string) => void) {
  useEffect(() => {
    keyInputSubscribers.current.add(handler);
    return () => { keyInputSubscribers.current.delete(handler); };
  }, [handler]);
}
```

**影響**: App.tsx再レンダー回数の大幅削減

---

#### 1.4 静的データの動的計算（Rule: rendering-hoist-jsx / js-cache-function-results）

**問題箇所**: `App.tsx:139-147`

```typescript
// 問題: コンポーネント内でuseMemoしているが、データは完全に静的
const speciesMap = useMemo(() => {
  return ALL_GHOST_SPECIES.reduce(
    (acc, species) => {
      acc[species.id] = species;
      return acc;
    },
    {} as Record<string, GhostSpecies>,
  );
}, []); // 依存なし = 完全に静的
```

**推奨修正（モジュールレベル）**:
```typescript
// lib/masterData.ts
import { ALL_GHOST_SPECIES, ALL_ITEMS, ALL_MOVES } from "@ghost-game/shared";

// モジュールレベルで一度だけ計算
export const SPECIES_MAP = new Map(
  ALL_GHOST_SPECIES.map(s => [s.id, s])
);

export const ITEMS_MAP = new Map(
  ALL_ITEMS.map(i => [i.id, i])
);

export const MOVES_MAP = new Map(
  ALL_MOVES.map(m => [m.id, m])
);
```

**影響**: 毎レンダーでのuseMemo評価コスト削減

---

#### 1.5 大規模コンポーネント分割（コード構成）

**問題箇所**: `App.tsx` (487行), `useBattleState.ts` (517行)

**AuthenticatedContent責務**:
1. セーブデータ管理
2. ゲーム状態管理
3. マップ状態管理
4. バトル状態管理
5. キー入力ハンドリング
6. 画面レンダリング

**推奨分割**:
```
App.tsx
├── AuthenticatedContent.tsx (メインコンテナ)
├── screens/
│   ├── MapScreenContainer.tsx
│   ├── BattleScreenContainer.tsx
│   ├── MenuScreenContainer.tsx
│   └── PartyScreenContainer.tsx
└── hooks/
    └── useKeyboardNavigation.ts (キー入力統合)
```

---

### 2. HIGH: データ構造最適化問題

#### 2.1 O(n)ルックアップの繰り返し（Rule: js-index-maps）

**問題箇所**: `useBattleHandlers.ts:234-248`

```typescript
// 問題: inventoryItemsの各要素に対してALL_ITEMS.find() = O(n²)
const getBattleItems = useCallback((): DisplayItem[] => {
  return inventoryItems
    .map((entry) => {
      const itemData = ALL_ITEMS.find((item) => item.id === entry.itemId);
      // ...
    });
}, [inventoryItems]);
```

**推奨修正**:
```typescript
import { ITEMS_MAP } from "../lib/masterData";

const getBattleItems = useCallback((): DisplayItem[] => {
  return inventoryItems
    .map((entry) => {
      const itemData = ITEMS_MAP.get(entry.itemId); // O(1)
      // ...
    });
}, [inventoryItems]);
```

**影響箇所**:
- `useBattleHandlers.ts:234-248` (getBattleItems)
- `useBattleHandlers.ts:254` (handleItemSelect内)
- `App.tsx` (getGhostSpeciesById呼び出し複数箇所)

---

#### 2.2 配列イテレーション結合（Rule: js-combine-iterations）

**問題箇所**: `useBattleHandlers.ts:234-248`

```typescript
// 問題: map + filter の2回イテレーション
return inventoryItems
  .map((entry) => { /* ... */ })
  .filter((i): i is DisplayItem => i !== null);
```

**推奨修正**:
```typescript
const result: DisplayItem[] = [];
for (const entry of inventoryItems) {
  const itemData = ITEMS_MAP.get(entry.itemId);
  if (!itemData) continue;
  if (itemData.category !== "healing" && itemData.category !== "capture") continue;
  result.push({ item: itemData, entry });
}
return result;
```

---

### 3. MEDIUM: イベントハンドラ最適化問題

#### 3.1 キーボードリスナー再サブスクライブ（Rule: advanced-event-handler-refs）

**問題箇所**: `GameContainer.tsx:96-101`

```typescript
// 問題: handleKeyDownが変わるたびに再サブスクライブ
useEffect(() => {
  window.addEventListener("keydown", handleKeyDown);
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [handleKeyDown]); // handleKeyDown変更時に再実行
```

**推奨修正**:
```typescript
import { useEffectEvent } from 'react';

function GameContainer({ onKeyDown, ... }) {
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (isTransitioning) return;
    // ... 処理
    onKeyDown?.(event.key);
  });

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []); // 依存なし、一度だけサブスクライブ
}
```

---

#### 3.2 グローバルイベントリスナー重複（Rule: client-event-listeners）

**現状**: GameContainerが唯一のリスナー（問題なし）

**将来的懸念**: 複数コンポーネントがwindowイベントを購読する場合の対策

```typescript
// 将来的に必要になる可能性のあるパターン
import useSWRSubscription from 'swr/subscription';

function useKeyboardShortcut(key: string, callback: () => void) {
  useSWRSubscription('global-keydown', () => {
    // シングルトンリスナー
  });
}
```

---

### 4. LOW: その他の改善点

#### 4.1 条件付きレンダリング（Rule: rendering-conditional-render）

**現状**: 主に `&&` と三項演算子を適切に使用

**確認箇所**: 数値条件での `&&` 使用なし（問題なし）

---

#### 4.2 toSorted()の活用（Rule: js-tosorted-immutable）

**現状**: ソート処理が少ないため大きな問題なし

**将来的改善**: パーティソート機能追加時に考慮

---

## リファクタリング実行計画

### Phase 1: 基盤整備（推定作業: 小）

1. **マスターデータMap化**
   - `lib/masterData.ts` 作成
   - SPECIES_MAP, ITEMS_MAP, MOVES_MAP エクスポート
   - 既存の `find()` 呼び出しを `Map.get()` に置換

2. **useEffectEventポリフィル追加**（React 19で利用可能か確認）
   - 利用不可の場合は `useLatest` パターンで代替

### Phase 2: Hook最適化（推定作業: 中）

1. **useGameState リファクタ**
   - `addGhostToParty`, `swapPartyGhost`, `useItem` を functional setState化
   - state依存を削除
   - 単体テスト追加

2. **useKeyboardInput カスタムフック作成**
   - Refベースのキー入力配信システム
   - App.tsxの `keyInput` state削除
   - 各パネルのuseEffect + biome-ignore削除

### Phase 3: コンポーネント分割（推定作業: 大）

1. **画面コンテナ抽出**
   - `BattleScreenContainer.tsx` 作成
   - `MapScreenContainer.tsx` 作成
   - App.tsx → AuthenticatedContent.tsx リネーム

2. **useBattleState分割**
   - `useBattleActions.ts` (アクション実行ロジック)
   - `useBattleMessages.ts` (メッセージ管理)
   - `useBattleState.ts` (状態のみ)

### Phase 4: イベントハンドラ最適化（推定作業: 小）

1. **GameContainer最適化**
   - キーボードリスナー安定化
   - useEffectEvent or useLatest適用

---

## 優先度マトリックス

```
            影響大
              │
    Phase 1   │   Phase 2
   (基盤整備)  │  (Hook最適化)
              │
  ─────────────┼─────────────── 作業量
              │
    Phase 4   │   Phase 3
  (イベント)   │ (コンポーネント)
              │
            影響小
```

**推奨実行順序**: Phase 1 → Phase 2 → Phase 4 → Phase 3

---

## 期待効果

| 項目 | Before | After | 改善率 |
|------|--------|-------|--------|
| App.tsx再レンダー/キー入力 | 2回 | 0回 | 100% |
| マスターデータルックアップ | O(n) | O(1) | 大幅改善 |
| useCallback再生成頻度 | 高 | 低 | 中程度 |
| コード可読性 | 487行/ファイル | <200行/ファイル | 60%改善 |

---

## 参考資料

- [Vercel React Best Practices](https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast)
- [React Compiler](https://react.dev/learn/react-compiler)
- [useEffectEvent RFC](https://github.com/reactjs/rfcs/pull/220)
