interface LoadingScreenProps {
  /** 表示するメッセージ（デフォルト: "読み込み中..."） */
  message?: string;
}

/**
 * ローディング画面コンポーネント
 *
 * セーブデータ読み込み中などに表示するローディング画面。
 * Tailwind CSSのアニメーションユーティリティを使用したスピナーと
 * カスタマイズ可能なメッセージを表示する。
 */
export function LoadingScreen({ message = "読み込み中..." }: LoadingScreenProps) {
  return (
    <output
      data-testid="loading-screen"
      aria-live="polite"
      aria-busy="true"
      className="flex min-h-screen flex-col items-center justify-center bg-gray-900"
    >
      {/* スピナー */}
      <div
        data-testid="loading-spinner"
        className="h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-purple-500"
      />

      {/* ローディングメッセージ */}
      <p className="mt-4 text-lg text-gray-300">{message}</p>
    </output>
  );
}
