# Research & Design Decisions

---
**Purpose**: ゴーストRPGゲームの技術設計に向けた調査結果と設計判断の記録
---

## Summary
- **Feature**: ghost-game
- **Discovery Scope**: New Feature（フルゲーム新規開発）
- **Key Findings**:
  - React + useReducer/Contextによる軽量状態管理がゲーム開発に適している
  - GameObjectコンポーネントパターンでゲーム要素を構造化
  - ゲームロジックとUIの分離が保守性・テスト容易性を向上
  - Zod + Hono RPCで型安全なAPI通信を実現
  - Clerk認証でセーブデータを保護
  - Tailwind CSSでユーティリティファーストなスタイリング

## Research Log

### React ゲーム状態管理
- **Context**: ターン制RPGに最適な状態管理手法の調査
- **Sources Consulted**:
  - [React State Management in 2024](https://dev.to/nguyenhongphat0/react-state-management-in-2024-5e7l)
  - [State of React 2024](https://2024.stateofreact.com/en-US/libraries/state-management/)
- **Findings**:
  - Zustandはフック型の軽量状態管理でゲーム開発に適している
  - Atomicアプローチ（状態を小さな単位に分割）が推奨
  - React Concurrent Modeと相性が良い
- **Implications**: Zustandではなく、組み込みのuseReducer + Contextでシンプルに実装（外部依存最小化）

### ターン制RPGアーキテクチャ
- **Context**: React + TypeScriptでのRPGゲーム構造調査
- **Sources Consulted**:
  - [Elmcrest Game (GitHub)](https://github.com/coldi/elmcrest-game) - Redux使用のターン制RPG
  - [React-RPG.com](https://github.com/ASteinheiser/react-rpg.com) - ダンジョンクロールRPG
  - [Making a 2D RPG with react-three-fiber](https://dev.to/flagrede/making-a-2d-rpg-game-with-react-tree-fiber-4af1)
- **Findings**:
  - GameObjectパターン: 各ゲーム要素をコンポーネント化し、Scriptで振る舞いを合成
  - フィーチャー単位でモジュール分割（battle, map, inventory）
  - UIとロジックの明確な分離が保守性を向上
- **Implications**: ドメイン駆動でモジュール分割し、純粋関数でゲームロジックを実装

### グリッドベースマップ実装
- **Context**: 2Dグリッドマップの描画・移動処理
- **Findings**:
  - CSS Gridでタイルベースマップを描画（Canvas不要でシンプル）
  - キーボードイベントでWASD移動を実装
  - エンカウント判定はマップデータのタイルタイプで管理
- **Implications**: CSS Gridベースで実装し、マップデータはJSON形式で管理

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Feature-Sliced | 機能単位でコード分割 | 関心事の分離が明確 | 初期設計の負荷 | ゲームのドメイン境界と相性良い |
| MVC | Model-View-Controller | 古典的で理解しやすい | Reactとの親和性低 | 不採用 |
| Flux/Redux | 単方向データフロー | 状態追跡しやすい | ボイラープレート多い | 大規模向け |
| Component Composition | コンポーネント合成 | React標準パターン | 状態管理が分散しがち | 採用（useReducer併用） |

**選択**: Feature-Sliced + Component Composition（Reactネイティブパターン）

## Design Decisions

### Decision: 状態管理にuseReducer + Contextを採用
- **Context**: ゲーム状態（バトル、マップ、パーティ）の管理方法
- **Alternatives Considered**:
  1. Zustand — 軽量だが外部依存追加
  2. Redux Toolkit — 強力だがオーバースペック
  3. useReducer + Context — 組み込み機能のみ
- **Selected Approach**: useReducer + Context
- **Rationale**: 外部依存を最小化し、Reactの組み込み機能で十分対応可能
- **Trade-offs**: 複雑な状態でパフォーマンス低下の可能性あり（必要時にメモ化で対応）
- **Follow-up**: 状態更新頻度が高い場合はZustand移行を検討

### Decision: CSS Gridでマップ描画
- **Context**: 2Dグリッドマップの描画技術選定
- **Alternatives Considered**:
  1. Canvas API — 高パフォーマンスだが複雑
  2. CSS Grid — シンプルで宣言的
  3. SVG — ベクター向けでタイル不向き
- **Selected Approach**: CSS Grid
- **Rationale**: ブラウザゲームとしてシンプルさを優先、DOMベースでアクセシビリティも確保
- **Trade-offs**: 大規模マップでパフォーマンス低下の可能性
- **Follow-up**: 必要に応じてCanvas/WebGLへ移行可能な抽象化層を設計

### Decision: ゲームロジックを純粋関数として分離
- **Context**: ダメージ計算、タイプ相性などのロジック実装方針
- **Alternatives Considered**:
  1. クラスベースOOP — 状態とロジックを結合
  2. 純粋関数 — 入出力明確、テスト容易
- **Selected Approach**: 純粋関数（Functional Core, Imperative Shell）
- **Rationale**: テスト容易性、Reactとの親和性、steering.techの方針と一致
- **Trade-offs**: 状態管理が分離されるため、呼び出し側でのコーディネーションが必要
- **Follow-up**: なし

### 技術スタック追加調査

#### Zod + Hono RPC
- **Context**: 型安全なAPI通信の実現
- **Findings**:
  - Zodスキーマをフロント/バックエンドで共有可能
  - `@hono/zod-validator`でリクエストバリデーション
  - Hono RPCクライアント(`hc`)でエンドポイント型推論
- **Implications**: スキーマを`packages/shared`または`packages/frontend/src/schemas`に配置

#### Clerk認証
- **Context**: ユーザー認証とセーブデータ保護
- **Findings**:
  - `@hono/clerk-auth`でCloudflare Workersミドルウェア対応
  - React用の`@clerk/clerk-react`でフロントエンド統合
  - `userId`をセーブデータのキーとして使用
- **Implications**: 認証必須エンドポイントは`/api/save/*`に限定

#### Tailwind CSS
- **Context**: UIスタイリング手法
- **Findings**:
  - ユーティリティクラスでコンポーネント単位のスタイリング
  - JITコンパイルで未使用スタイル除去
  - CSS Gridとの併用でマップ描画にも対応
- **Implications**: `tailwind.config.js`でゲーム固有のカスタムカラー定義

#### GitHub Actions CI/CD
- **Context**: 自動テスト・デプロイパイプライン
- **Findings**:
  - 既存の`.github/workflows/ci.yml`を拡張
  - Cloudflare Pages/Workers へのデプロイを追加
  - ブランチ戦略: main→本番、develop→プレビュー
- **Implications**: Wrangler CLIのシークレット設定が必要

## Risks & Mitigations
- **パフォーマンス**: 大規模マップ・多数のゴーストで描画遅延 → 仮想化・メモ化で対応
- **状態複雑化**: バトル・マップ・UIの状態が絡み合う → 明確なドメイン境界で分離
- **データ整合性**: クライアント側のゲームデータ改ざん → 重要データはバックエンドで検証
- **認証エラー**: Clerkトークン期限切れ → 自動リフレッシュ + エラーハンドリング

---

## 要件15-17追加調査 (2026-01-11)

### Summary (Extension)
- **Discovery Scope**: Extension（既存システムへの機能追加）
- **Key Findings**:
  - `updatePartyGhost()`が実装済みで、バトル後HP同期に活用可能
  - `ItemSelectPanel`コンポーネントがUI実装済みだが、ロジック接続が欠落
  - `useSaveDataMutation()`が実装済みで、手動セーブに即利用可能

### バトル状態とゲーム状態の同期
- **Context**: バトル終了後にパーティHPが更新されない問題の調査
- **Sources Consulted**:
  - `packages/frontend/src/hooks/useBattleState.ts`
  - `packages/frontend/src/hooks/useGameState.ts`
  - `packages/frontend/src/App.tsx`
- **Findings**:
  - `BattleGhostState.currentHp`はバトル中のみ有効、パーティとは独立
  - `useGameState.updatePartyGhost()`が実装済みだが未使用
  - `resetBattle()`呼び出し前にHP同期が必要
- **Implications**: App.tsxのバトル終了ハンドラーに同期ロジックを追加

### アイテム選択UI接続
- **Context**: 「アイテム」コマンドが機能しない問題の調査
- **Sources Consulted**:
  - `packages/frontend/src/components/battle/ItemSelectPanel.tsx`
  - `packages/frontend/src/components/battle/CaptureItemPanel.tsx`
  - `packages/frontend/src/App.tsx` (handleBattleCommand)
- **Findings**:
  - `ItemSelectPanel`は完全に実装済み（カテゴリ表示、数量表示、選択不可制御）
  - `BattlePhase`に`"item_select"`が既に定義済み
  - `handleBattleCommand("item")`がstub実装（`break`のみ）
  - `executePlayerAction`には`itemBonus`パラメータが存在
- **Implications**:
  - `setPhase("item_select")`の呼び出し追加
  - 回復アイテム使用ロジックの新規実装が必要
  - 捕獲アイテムボーナスの計算ロジック接続が必要

### セーブ機能の現状
- **Context**: 手動セーブが機能しない問題の調査
- **Sources Consulted**:
  - `packages/frontend/src/api/useSaveData.ts`
  - `packages/frontend/src/App.tsx` (handleMenuSelect)
- **Findings**:
  - `useSaveDataMutation()`が完全に実装済み
  - `useAutoSave()`フックで30秒間隔の自動セーブが動作中
  - `handleMenuSelect("save")`がstub実装（`console.log`のみ）
  - 成功/失敗のフィードバック機構が未実装
- **Implications**: handleMenuSelectにmutation呼び出しを追加、フィードバックUIを追加

### 追加Design Decisions

#### Decision: バトル終了時のHP同期タイミング
- **Context**: バトル終了後、いつパーティHPを更新するか
- **Alternatives Considered**:
  1. バトル結果表示前に同期
  2. バトル結果表示後、マップ遷移前に同期
- **Selected Approach**: バトル結果表示後、`resetBattle()`呼び出し直前に同期
- **Rationale**: 結果表示中はバトル状態を保持する必要がある
- **Trade-offs**: 同期タイミングが遅延するが、UXへの影響なし

#### Decision: アイテム選択フローの設計
- **Context**: 回復アイテムと捕獲アイテムで処理が異なる
- **Alternatives Considered**:
  1. 単一のアイテム選択画面で両方処理
  2. カテゴリ選択→アイテム選択の2段階
- **Selected Approach**: 単一のアイテム選択画面、カテゴリはUIで視覚的に区別
- **Rationale**: 既存の`ItemSelectPanel`がカテゴリ表示をサポート済み

#### Decision: 手動セーブのフィードバック方式
- **Context**: セーブ成功/失敗をどのようにユーザーに伝えるか
- **Alternatives Considered**:
  1. トースト通知
  2. モーダルダイアログ
  3. インライン表示（メニュー画面内）
- **Selected Approach**: インライン表示（メニュー画面内）
- **Rationale**: 既存の`SaveStatus`コンポーネントパターンとの一貫性

### 追加Risks
- **HP同期漏れ**: 全バトル終了パスで同期処理を統一して対応
- **アイテム使用後のターン処理複雑化**: 回復は即時適用、捕獲は既存フローを活用
- **セーブ失敗時のデータ損失**: 自動セーブとの併用、ローカルキャッシュ活用

## References
- [React State Management in 2024](https://dev.to/nguyenhongphat0/react-state-management-in-2024-5e7l)
- [Elmcrest Game GitHub](https://github.com/coldi/elmcrest-game) — ターン制RPGの参考実装
- [React-RPG.com](https://github.com/ASteinheiser/react-rpg.com) — ダンジョンクロールRPG
- [Making a 2D RPG game with react-three-fiber](https://dev.to/flagrede/making-a-2d-rpg-game-with-react-tree-fiber-4af1)
