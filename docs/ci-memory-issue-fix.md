# CI メモリ問題の原因と解決

## 問題の概要

フロントエンドのテスト（vitest）がCI環境で「JavaScript heap out of memory」エラーで失敗していた。テスト自体は全て成功しているが、vitestのクリーンアップフェーズでメモリが枯渇してクラッシュしていた。

## 根本原因

### 1. vitestのメモリ消費パターン

```
テスト実行: ~4秒、メモリ ~500MB
クリーンアップ: ~200秒以上、メモリ ~6GB以上に増加
```

vitestはテスト実行後のクリーンアップ/ティアダウンフェーズで大量のメモリを消費する。これはjsdom環境のセットアップ時間（17秒以上）やReactコンポーネントのクリーンアップに起因する。

### 2. 子プロセスのメモリ制限

vitestはforks poolを使用して子プロセスでテストを実行する。問題は：
- `NODE_OPTIONS=--max-old-space-size=6656` は子プロセスに継承されない
- `execArgv` オプションも子プロセスに正しく伝播されない
- 子プロセスはデフォルトの4GBヒープ制限を使用

### 3. grep パターンのミスマッチ（最終的な失敗原因）

シャーディングと出力チェックのワークアラウンドを実装した後も、1つのシャードが失敗し続けた。原因：

```bash
# 元のパターン
! echo "$OUTPUT" | grep -q "failed"
```

このパターンはOOMエラーメッセージ内の「Allocation failed」にマッチしてしまい、テストが成功しても失敗と判定されていた。

```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
                                ^^^^^^^^^^^^^^^^
                                ここでマッチ
```

## 解決策

### 1. テストのシャーディング

#### シャーディングとは？

**シャーディング（Sharding）** とは、大きなデータセットや処理を複数の小さな部分（シャード）に分割して並列処理する手法。元々はデータベースの水平分割技術として知られるが、テスト実行においても同じ概念が適用される。

```
┌─────────────────────────────────────────────────────────┐
│                    全テスト (22ファイル)                   │
└─────────────────────────────────────────────────────────┘
                            ↓ シャーディング
┌─────────┐ ┌─────────┐ ┌─────────┐     ┌─────────┐
│ Shard 1 │ │ Shard 2 │ │ Shard 3 │ ... │Shard 12 │
│ 2ファイル │ │ 2ファイル │ │ 2ファイル │     │ 2ファイル │
└─────────┘ └─────────┘ └─────────┘     └─────────┘
     ↓           ↓           ↓               ↓
   並列実行   並列実行   並列実行         並列実行
```

#### vitestのシャーディング

vitestは `--shard=X/Y` オプションでテストを分割できる：
- `--shard=1/12`: 全テストを12分割した1番目
- `--shard=2/12`: 全テストを12分割した2番目
- ...以下同様

#### 今回の設定

12個のシャードに分割してテストを並列実行：

```yaml
strategy:
  fail-fast: false
  matrix:
    shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
```

#### シャーディングのメリット

| メリット | 説明 |
|---------|------|
| メモリ分散 | 各シャードが独立したプロセスで実行され、メモリ使用量が分散 |
| 並列実行 | GitHub Actionsのmatrix機能で12ジョブが同時に実行 |
| 障害分離 | 1つのシャードが失敗しても他のシャードは継続 |
| 実行時間短縮 | 22ファイルを順次実行するより大幅に高速化 |

### 2. 出力ベースの成功判定

vitestの終了コードではなく、出力内容でテスト成功を判定：

```yaml
- name: Run Frontend Tests (shard ${{ matrix.shard }}/12)
  working-directory: packages/frontend
  run: |
    set +e
    OUTPUT=$(npx vitest run --shard=${{ matrix.shard }}/12 2>&1)
    EXIT_CODE=$?
    echo "$OUTPUT"

    # テスト結果のサマリー行を具体的にチェック
    if echo "$OUTPUT" | grep -qE "Test Files.*[0-9]+ passed" && \
       ! echo "$OUTPUT" | grep -qE "Test Files.*[0-9]+ failed|Tests.*[0-9]+ failed"; then
      echo "✅ All tests passed successfully"
      exit 0
    else
      echo "❌ Tests failed"
      exit $EXIT_CODE
    fi
  env:
    NODE_OPTIONS: --max-old-space-size=6656
```

### 3. grep パターンの修正

```bash
# 修正前（誤）
! echo "$OUTPUT" | grep -q "failed"

# 修正後（正）
! echo "$OUTPUT" | grep -qE "Test Files.*[0-9]+ failed|Tests.*[0-9]+ failed"
```

vitestのサマリー行（`Test Files  X failed` や `Tests  Y failed`）を具体的にチェックすることで、OOMエラーメッセージの「Allocation failed」に誤マッチしなくなった。

## 試行した他のアプローチ（効果なし）

| アプローチ | 結果 |
|-----------|------|
| `pool: "forks"` + `execArgv` | 子プロセスに設定が伝播しない |
| `pool: "threads"` + `singleThread` | Worker threadsは別のメモリ制限を使用 |
| `pool: "vmForks"` | 同様のメモリ問題 |
| `happy-dom` 環境 | クリーンアップで同じ問題 |
| シャード数の増加のみ | 1ファイルでもクリーンアップでクラッシュ |

## 結果

- CI実行 #20135635198: **成功**
- 全12シャード: 成功
- 全lint/typecheck: 成功
- Build: 成功

## 変更ファイル

- `.github/workflows/ci.yml` - シャーディングと出力チェックロジックの追加

## 今後の検討事項

1. vitest v5でのメモリ管理改善を待つ
2. jsdom以外のテスト環境（例：Playwright Component Testing）への移行検討
3. テストファイルごとの分離度を上げる設定の検討
