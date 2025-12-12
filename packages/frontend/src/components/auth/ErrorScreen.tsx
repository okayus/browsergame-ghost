interface ErrorScreenProps {
  /** エラーメッセージ */
  error?: string | null;
  /** リトライボタンクリック時のコールバック */
  onRetry?: () => void;
}

/**
 * エラー画面コンポーネント
 *
 * エラー発生時に表示するエラー画面。
 * エラーメッセージとリトライボタンを表示する。
 */
export function ErrorScreen({
  error = "予期しないエラーが発生しました",
  onRetry,
}: ErrorScreenProps) {
  return (
    <div
      data-testid="error-screen"
      role="alert"
      className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-8"
    >
      {/* エラーアイコン */}
      <div className="mb-6 text-6xl text-red-500">⚠</div>

      {/* エラータイトル */}
      <h1 className="mb-4 text-2xl font-bold text-red-400">エラーが発生しました</h1>

      {/* エラーメッセージ */}
      <p className="mb-8 max-w-md text-center text-gray-400">{error}</p>

      {/* リトライボタン */}
      <button
        type="button"
        data-testid="retry-button"
        onClick={onRetry}
        className="rounded-lg bg-purple-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-purple-500"
      >
        もう一度試す
      </button>
    </div>
  );
}
