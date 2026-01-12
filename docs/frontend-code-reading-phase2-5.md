# フェーズ2.5: @ghost-game/shared パッケージ調査結果

## 調査概要

| 項目 | 内容 |
|------|------|
| 調査日 | 2026-01-12 |
| パッケージパス | `packages/shared/` |
| 主要ディレクトリ | `schemas/`, `data/`, `logic/` |

---

## 調査目的（Why）

- フロントエンドとバックエンドで共有される型・ロジックを理解する
- ゲームの核心ロジック（ダメージ計算、タイプ相性など）を把握する
- App.tsxからの大量インポートの全体像を掴む

---

## 調査方法（How）

1. 各サブディレクトリのindex.tsでエクスポート一覧を確認
2. schemas/で定義されている型・スキーマを分析
3. logic/でゲームロジックの実装を確認
4. data/でマスタデータの構造を確認

---

## 調査結果（What）

### パッケージ構造

```
packages/shared/src/
├── index.ts           ← 全てを再エクスポート
├── schemas/           ← Zodスキーマ & TypeScript型
│   ├── ghost.ts       (ゴースト・技の型)
│   ├── battle.ts      (バトル状態の型)
│   ├── player.ts      (プレイヤー・マップの型)
│   ├── item.ts        (アイテムの型)
│   └── index.ts
├── data/              ← マスタデータ定義
│   ├── ghosts.ts      (ゴースト種族)
│   ├── moves.ts       (技)
│   ├── items.ts       (アイテム)
│   ├── maps.ts        (マップ)
│   └── index.ts
└── logic/             ← ゲームロジック（純粋関数）
    ├── damage.ts      (ダメージ計算)
    ├── typeEffectiveness.ts (タイプ相性)
    ├── capture.ts     (捕獲判定)
    ├── escape.ts      (逃走判定)
    ├── experience.ts  (経験値計算)
    ├── levelUp.ts     (レベルアップ処理)
    ├── turnOrder.ts   (行動順決定)
    └── index.ts
```

---

## schemas/ - 型定義

### ghost.ts - ゴースト関連の型

| 型名 | 説明 |
|------|------|
| `GhostType` | 6タイプ: fire, water, grass, electric, ghost, normal |
| `BaseStats` | HP, 攻撃, 防御, 素早さ（1-255） |
| `Move` | 技定義（id, name, type, power, accuracy, pp） |
| `GhostSpecies` | 種族マスタ（ポケモンでいう「種族」） |
| `OwnedGhost` | プレイヤー所持ゴースト（個体インスタンス） |
| `OwnedMove` | 所持技（残りPP管理） |

**ゴーストの階層構造**:
```
GhostSpecies (マスタ: ピカチュウ的な)
     │
     └── OwnedGhost (個体: 「僕のピカチュウ」)
              │
              ├── id: ユニークID
              ├── speciesId → GhostSpeciesへの参照
              ├── level, experience
              ├── currentHp, maxHp
              ├── stats: 計算済み能力値
              └── moves: OwnedMove[] (最大4つ)
```

### battle.ts - バトル状態

| 型名 | 説明 |
|------|------|
| `BattlePhase` | 6フェーズ: command_select, move_select, item_select, executing, result, capture_success |
| `StatModifiers` | 能力変化（-6〜+6段階） |
| `BattleGhostState` | バトル中のゴースト状態 |
| `BattleState` | バトル全体状態 |

**重要**: バトル状態はReact stateのみ、DBには保存しない

### player.ts - プレイヤー・マップ関連

| 型名 | 説明 |
|------|------|
| `Party` | パーティ（1-6体のゴースト） |
| `PlayerPosition` | 位置（mapId, x, y） |
| `TileType` | タイル種別: ground, grass, wall, water |
| `MapData` | マップ定義（タイル2D配列、エンカウント設定） |
| `PlayerData` | セーブデータ全体 |

**PlayerDataの構造**:
```typescript
{
  id: string,
  clerkUserId: string,
  name: string,
  party: Party,
  inventory: Inventory,
  position: PlayerPosition,
  createdAt: string,
  updatedAt: string,
}
```

---

## logic/ - ゲームロジック

### damage.ts - ダメージ計算

**定数**:
| 定数 | 値 | 説明 |
|------|-----|------|
| `CRITICAL_HIT_RATE` | 1/16 ≒ 6.25% | クリティカル率 |
| `CRITICAL_MULTIPLIER` | 1.5 | クリティカル倍率 |
| `STAB_MULTIPLIER` | 1.5 | タイプ一致ボーナス |
| `MIN_DAMAGE` | 1 | 最小ダメージ保証 |

**ダメージ計算式**（ポケモン簡略版）:
```
基本ダメージ = ((2 * レベル / 5 + 2) * 威力 * 攻撃 / 防御) / 50 + 2
最終ダメージ = 基本 × STAB × タイプ相性 × クリティカル
```

**関数**:
| 関数 | 用途 |
|------|------|
| `calculateBaseDamage()` | 基本ダメージ計算 |
| `calculateDamage()` | 最終ダメージ計算 |
| `isCriticalHit()` | クリティカル判定 |
| `getStabBonus()` | タイプ一致ボーナス取得 |

### typeEffectiveness.ts - タイプ相性

**タイプ相性表**:
```
          fire  water grass elec  ghost normal
fire      0.5   0.5   2.0   1.0   1.0   1.0
water     2.0   0.5   0.5   1.0   1.0   1.0
grass     0.5   2.0   0.5   1.0   1.0   1.0
electric  1.0   2.0   0.5   0.5   1.0   1.0
ghost     1.0   1.0   1.0   1.0   2.0   0.0   ← ghostはnormalに無効
normal    1.0   1.0   1.0   1.0   0.0   1.0   ← normalはghostに無効
```

**相性の設計思想**:
- 三すくみ: fire > grass > water > fire
- electric > water（感電）
- ghost ↔ normal（互いに効果なし）

### その他のロジック

| ファイル | 主要関数 | 説明 |
|----------|----------|------|
| capture.ts | `attemptCapture()`, `calculateCaptureRate()` | 捕獲成功判定 |
| escape.ts | `attemptEscape()`, `calculateEscapeRate()` | 逃走成功判定 |
| experience.ts | `calculateExpGain()`, `addExperience()` | 経験値計算 |
| levelUp.ts | `processLevelUp()`, `calculateStats()` | レベルアップ処理 |
| turnOrder.ts | `determineTurnOrder()`, `goesFirst()` | 素早さによる行動順 |

---

## data/ - マスタデータ

### ghosts.ts - ゴースト種族

4種族が定義:
| ID | 名前 | タイプ |
|----|------|--------|
| `GHOST_FIRELING` | ファイアリング | fire |
| `GHOST_AQUASPIRIT` | アクアスピリット | water |
| `GHOST_LEAFSHADE` | リーフシェイド | grass |
| `GHOST_SPIRITPUFF` | スピリットパフ | ghost |

**関数**:
- `getGhostSpeciesById(id)` - ID → 種族データ
- `generateWildGhost(speciesId, level)` - 野生ゴースト生成

### moves.ts - 技

12種類の技が定義:
| 技 | タイプ | 威力 |
|----|--------|------|
| TACKLE | normal | 40 |
| SCRATCH | normal | 40 |
| QUICK_ATTACK | normal | 40 |
| EMBER | fire | 40 |
| FIRE_SPIN | fire | 35 |
| WATER_GUN | water | 40 |
| BUBBLE | water | 40 |
| VINE_WHIP | grass | 45 |
| ABSORB | grass | 20 |
| THUNDER_SHOCK | electric | 40 |
| LICK | ghost | 30 |
| NIGHT_SHADE | ghost | - |

### items.ts - アイテム

6種類:
| カテゴリ | アイテム |
|----------|----------|
| 回復系 | Potion, Super Potion, Hyper Potion |
| 捕獲系 | Ghost Ball, Super Ball, Hyper Ball |

### maps.ts - マップ

`MAP_001`が定義（草むらエリア、エンカウント設定付き）

---

## 設計パターンまとめ

### 1. Zodによるスキーマファースト設計

```typescript
// スキーマ定義
export const GhostTypeSchema = z.enum(["fire", "water", ...]);

// 型の導出
export type GhostType = z.infer<typeof GhostTypeSchema>;
```

**メリット**:
- ランタイムバリデーションと型定義を一元化
- フロント/バックエンドで同じスキーマを共有

### 2. 純粋関数によるロジック分離

```typescript
// 依存なし、副作用なし → テストしやすい
export function calculateDamage(params: DamageParams): DamageResult {
  // ...
}
```

**特徴**:
- 乱数を引数で受け取れる（テスト用DI）
- React/DBに依存しない

### 3. マスタデータの静的定義

```typescript
export const ALL_GHOST_SPECIES: GhostSpecies[] = [
  GHOST_FIRELING,
  GHOST_AQUASPIRIT,
  // ...
];

export const getGhostSpeciesById = (id: string) =>
  ALL_GHOST_SPECIES.find(s => s.id === id);
```

**特徴**:
- DBから取得せず、コード内で定義
- 変更時は再デプロイが必要

---

## フロントエンドへの影響

### App.tsxでのインポート

```typescript
import {
  ALL_GHOST_SPECIES,
  ALL_MOVES,
  type GhostSpecies,
  type GhostType,
  generateWildGhost,
  getGhostSpeciesById,
  getMapById,
  type OwnedGhost,
  type PlayerData,
} from "@ghost-game/shared";
```

**使用箇所**:
- `generateWildGhost`: エンカウント時の野生ゴースト生成
- `getGhostSpeciesById`: 種族データの取得（名前表示など）
- `getMapById`: マップデータの取得
- 型: コンポーネントのprops型定義

---

## 気づき・課題

1. **よく整理された設計**: スキーマ、データ、ロジックが明確に分離
2. **テスタビリティ**: 全ロジックに`.test.ts`ファイルが存在
3. **拡張性**: 新種族・新技の追加はdata/に追記するだけ
4. **課題**: マスタデータがコード内定義 → 将来的にDB化の余地

---

## 次のステップ

- [x] フェーズ1完了
- [x] フェーズ2完了
- [x] フェーズ2.5完了
- [ ] フェーズ3: 状態管理フック
- [ ] フェーズ4: UIコンポーネント
