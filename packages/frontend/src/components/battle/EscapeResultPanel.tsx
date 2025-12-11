import { useCallback, useEffect } from "react";

/**
 * 逃走結果パネルのProps
 */
export interface EscapeResultPanelProps {
  /** 逃走成功したかどうか */
  success: boolean;
  /** 逃走試行回数 */
  attemptCount?: number;
  /** 成功時のコールバック（マップ画面へ遷移） */
  onSuccess: () => void;
  /** 失敗時のコールバック（バトル継続、敵のターンへ） */
  onFailure: () => void;
  /** キー入力（親からの入力） */
  onKeyInput?: string;
}

/**
 * 逃走結果パネルコンポーネント
 *
 * - 逃走成功時: メッセージを表示してマップ画面へ遷移
 * - 逃走失敗時: メッセージを表示してバトル継続（敵のターン）
 */
export function EscapeResultPanel({
  success,
  attemptCount,
  onSuccess,
  onFailure,
  onKeyInput,
}: EscapeResultPanelProps) {
  // 続行処理
  const handleContinue = useCallback(() => {
    if (success) {
      onSuccess();
    } else {
      onFailure();
    }
  }, [success, onSuccess, onFailure]);

  // キー入力処理
  const handleKeyInput = useCallback(
    (key: string) => {
      if (key === "Enter" || key === " ") {
        handleContinue();
      }
    },
    [handleContinue],
  );

  // 親からのキー入力を処理
  // biome-ignore lint/correctness/useExhaustiveDependencies: handleKeyInputは意図的に除外（onKeyInputの変更時のみ実行、無限ループ防止）
  useEffect(() => {
    if (onKeyInput) {
      handleKeyInput(onKeyInput);
    }
  }, [onKeyInput]);

  // 逃走成功
  if (success) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center p-4"
        data-testid="escape-result-panel"
        data-success="true"
      >
        <div className="mb-6 text-center">
          <p className="mb-4 text-2xl font-bold text-ghost-success" data-testid="escape-message">
            逃げ切れた！
          </p>
          <p className="text-ghost-text">うまく逃げることができた</p>
        </div>
        <button
          type="button"
          onClick={handleContinue}
          className="rounded-lg border-2 border-ghost-primary bg-ghost-primary/20 px-8 py-3 font-bold text-ghost-text-bright transition-all hover:bg-ghost-primary/30"
          data-testid="continue-button"
        >
          マップに戻る
        </button>
      </div>
    );
  }

  // 逃走失敗
  return (
    <div
      className="flex h-full flex-col items-center justify-center p-4"
      data-testid="escape-result-panel"
      data-success="false"
    >
      <div className="mb-6 text-center">
        <p className="mb-4 text-2xl font-bold text-ghost-danger" data-testid="escape-message">
          逃げられなかった！
        </p>
        <p className="text-ghost-text">回り込まれてしまった...</p>
        {attemptCount !== undefined && attemptCount > 1 && (
          <p className="mt-2 text-sm text-ghost-text-muted" data-testid="attempt-count">
            逃走試行: {attemptCount}回目
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={handleContinue}
        className="rounded-lg border-2 border-ghost-primary bg-ghost-primary/20 px-8 py-3 font-bold text-ghost-text-bright transition-all hover:bg-ghost-primary/30"
        data-testid="continue-button"
      >
        続ける
      </button>
    </div>
  );
}
