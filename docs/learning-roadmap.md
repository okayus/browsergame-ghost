# React学習ロードマップ - TODOリスト

このリポジトリでReactを学習するためのロードマップです。
上から順番に進めてください。

---

## 前提知識

- [ ] **React基礎フラッシュカード** (`react-flashcards.md`)
  - JSX, コンポーネント, Props, State, useEffect, カスタムフック

---

## Step 1: エントリーポイントを理解する

**目的**: アプリの起動から画面表示までの流れを把握

### 読むファイル
- [ ] `packages/frontend/src/main.tsx` - アプリの起動点
- [ ] `packages/frontend/src/App.tsx` - メインコンポーネント

### 学習資料
- [ ] **Step1 フラッシュカード** (`flashcards-step1-entry.md`)

### 理解すべきポイント
- [ ] ReactDOM.createRoot でアプリを起動する仕組み
- [ ] ClerkProvider の役割（認証）
- [ ] App.tsx での画面切り替えロジック

---

## Step 2: 状態管理（カスタムフック）

**目的**: アプリ全体の状態がどう管理されているか理解

### 読むファイル（シンプル→複雑の順）
- [ ] `packages/frontend/src/hooks/useGameState.ts` - 最もシンプル
- [ ] `packages/frontend/src/hooks/useMapState.ts` - 移動とエンカウント
- [ ] `packages/frontend/src/hooks/useAuthState.ts` - 認証連携
- [ ] `packages/frontend/src/hooks/useBattleState.ts` - 複雑な状態遷移

### 学習資料
- [ ] **Step2 フラッシュカード** (`flashcards-step2-hooks.md`)

### 理解すべきポイント
- [ ] useCallback で関数をメモ化する理由
- [ ] 複数の useState をまとめて管理する方法
- [ ] フックから返す値と関数の設計

---

## Step 3: 画面コンポーネント

**目的**: コンポーネント設計パターンを習得

### 読むファイル（シンプル→複雑の順）
- [ ] `packages/frontend/src/components/auth/LoadingScreen.tsx` - 最小限
- [ ] `packages/frontend/src/components/auth/ErrorScreen.tsx` - Props活用
- [ ] `packages/frontend/src/components/menu/MenuScreen.tsx` - キーボード操作
- [ ] `packages/frontend/src/components/party/PartyScreen.tsx` - 一覧/詳細切替
- [ ] `packages/frontend/src/components/map/MapScreen.tsx` - グリッド描画

### 学習資料
- [ ] **Step3 フラッシュカード** (`flashcards-step3-components.md`)

### 理解すべきポイント
- [ ] Propsで受け取るデータとコールバックの設計
- [ ] useStateで画面内の状態を管理
- [ ] 配列データをmapでUI化する方法

---

## Step 4: API通信

**目的**: フロントエンドとバックエンドの連携を理解

### 読むファイル
- [ ] `packages/frontend/src/api/client.ts` - HTTPクライアント
- [ ] `packages/frontend/src/api/useSaveData.ts` - セーブ/ロード

### 学習資料
- [ ] **Step4 フラッシュカード** (`flashcards-step4-api.md`)

### 理解すべきポイント
- [ ] Hono clientの使い方
- [ ] async/awaitでの非同期処理
- [ ] エラーハンドリングとリトライ

---

## Step 5: 応用（バトル画面）

**目的**: 複雑なUIとロジックの組み合わせを理解

### 読むファイル
- [ ] `packages/frontend/src/components/battle/BattleScreen.tsx` - 複合画面
- [ ] `packages/frontend/src/components/battle/GhostDisplay.tsx` - 再利用部品
- [ ] `packages/frontend/src/components/battle/CommandPanel.tsx` - 入力処理

### 学習資料
- [ ] **Step5 フラッシュカード** (`flashcards-step5-advanced.md`)

### 理解すべきポイント
- [ ] 子コンポーネントへのProps設計
- [ ] 状態のリフトアップ
- [ ] 複数コンポーネントの連携

---

## 学習完了チェック

以下ができるようになったら、このリポジトリのReact学習は完了です：

- [ ] 新しい画面コンポーネントを追加できる
- [ ] 新しいカスタムフックを作成できる
- [ ] 既存のコンポーネントを読んで理解できる
- [ ] Propsの設計意図を説明できる
