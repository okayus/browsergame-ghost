import { useEffect } from "react";

/**
 * 手動セーブの状態
 */
export type ManualSaveStatus =
  | { type: "idle" }
  | { type: "saving" }
  | { type: "success" }
  | { type: "error"; message: string };

/**
 * SaveFeedbackコンポーネントのProps
 */
export interface SaveFeedbackProps {
  /** セーブ状態 */
  status: ManualSaveStatus;
  /** リトライコールバック */
  onRetry?: () => void;
  /** 自動消去コールバック（成功時2秒後に呼ばれる） */
  onDismiss?: () => void;
}

/**
 * セーブ処理のフィードバック表示コンポーネント
 *
 * - セーブ中: ローディングインジケーター表示
 * - セーブ成功: メッセージ表示（2秒後に自動消去）
 * - セーブ失敗: エラーメッセージとリトライボタン表示
 */
export function SaveFeedback({ status, onRetry, onDismiss }: SaveFeedbackProps) {
  // 成功時の自動消去
  useEffect(() => {
    if (status.type === "success" && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status.type, onDismiss]);

  // idle状態では何も表示しない
  if (status.type === "idle") {
    return null;
  }

  return (
    <div
      className="rounded-lg border-2 border-ghost-border bg-ghost-surface p-4"
      data-testid="save-feedback"
    >
      {status.type === "saving" && (
        <div className="flex items-center gap-3" data-testid="save-feedback-saving">
          {/* ローディングスピナー */}
          <div
            className="h-5 w-5 animate-spin rounded-full border-2 border-ghost-primary border-t-transparent"
            data-testid="save-spinner"
          />
          <span className="text-ghost-text">セーブ中...</span>
        </div>
      )}

      {status.type === "success" && (
        <div className="flex items-center gap-3 text-green-400" data-testid="save-feedback-success">
          {/* 成功アイコン */}
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            data-testid="save-success-icon"
            role="img"
            aria-label="成功"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>セーブしました</span>
        </div>
      )}

      {status.type === "error" && (
        <div className="flex flex-col gap-2 text-ghost-danger" data-testid="save-feedback-error">
          <div className="flex items-center gap-2">
            {/* エラーアイコン */}
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              data-testid="save-error-icon"
              role="img"
              aria-label="エラー"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>セーブに失敗しました</span>
          </div>
          <p className="text-sm text-ghost-text-muted">{status.message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 rounded border border-ghost-primary px-4 py-2 text-ghost-primary transition-colors hover:bg-ghost-primary hover:text-white"
              data-testid="save-retry-button"
            >
              リトライ
            </button>
          )}
        </div>
      )}
    </div>
  );
}
