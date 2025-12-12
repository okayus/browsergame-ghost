interface WelcomeScreenProps {
  /** サインインボタンクリック時のコールバック */
  onSignIn?: () => void;
  /** サインアップボタンクリック時のコールバック */
  onSignUp?: () => void;
}

/**
 * ウェルカム画面コンポーネント
 *
 * 未認証ユーザーに表示するウェルカム画面。
 * ゲームの紹介とサインイン/サインアップボタンを表示する。
 */
export function WelcomeScreen({ onSignIn, onSignUp }: WelcomeScreenProps) {
  return (
    <div
      data-testid="welcome-screen"
      className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-8"
    >
      {/* ゲームタイトル */}
      <h1 className="mb-4 text-5xl font-bold text-purple-400">Ghost Game</h1>

      {/* サブタイトル */}
      <p className="mb-8 text-xl text-gray-300">ゴーストを捕まえて、育てて、バトルしよう！</p>

      {/* ゲーム説明 */}
      <div className="mb-8 max-w-md text-center text-gray-400">
        <p className="mb-2">神秘的なゴーストたちが住む世界を冒険しよう。</p>
        <p>野生のゴーストを捕まえて、最強のパーティを作ろう！</p>
      </div>

      {/* 認証ボタン */}
      <div className="flex gap-4">
        <button
          type="button"
          data-testid="signin-button"
          onClick={onSignIn}
          className="rounded-lg bg-purple-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-purple-500"
        >
          サインイン
        </button>
        <button
          type="button"
          data-testid="signup-button"
          onClick={onSignUp}
          className="rounded-lg border-2 border-purple-600 px-8 py-3 text-lg font-semibold text-purple-400 transition-colors hover:bg-purple-600/20"
        >
          新規登録
        </button>
      </div>
    </div>
  );
}
