import { useCallback, useEffect, useRef } from "react";
import type { GameScreen } from "../../hooks/useGameState";
import { ScreenTransition, type TransitionType } from "./ScreenTransition";

/**
 * ゲームコンテナのProps
 */
export interface GameContainerProps {
  /** 現在の画面 */
  currentScreen: GameScreen;
  /** キー入力ハンドラ */
  onKeyDown?: (key: string) => void;
  /** 子要素（各画面コンポーネント） */
  children: React.ReactNode;
  /** トランジションがアクティブかどうか */
  isTransitioning?: boolean;
  /** トランジションのタイプ */
  transitionType?: TransitionType;
  /** トランジション完了時のコールバック */
  onTransitionComplete?: () => void;
}

/**
 * サポートされるキー入力のリスト
 */
const SUPPORTED_KEYS = [
  // 移動キー
  "w",
  "a",
  "s",
  "d",
  "W",
  "A",
  "S",
  "D",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  // 決定・キャンセル
  "Enter",
  "Escape",
  " ", // Space
  // 数字キー（メニュー選択用）
  "1",
  "2",
  "3",
  "4",
];

/**
 * ゲーム全体のコンテナコンポーネント
 *
 * - 画面状態に応じた表示制御
 * - キーボードイベントリスナーの設定
 * - ゲーム全体のレイアウト
 */
export function GameContainer({
  currentScreen,
  onKeyDown,
  children,
  isTransitioning = false,
  transitionType = "fade",
  onTransitionComplete,
}: GameContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // トランジション中はキー入力を無効化
      if (isTransitioning) {
        return;
      }

      // サポートされるキーのみ処理
      if (!SUPPORTED_KEYS.includes(event.key)) {
        return;
      }

      // 入力フィールド内ではゲームのキー入力を無効化
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // デフォルトの動作を防止（スクロール等）
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
        event.preventDefault();
      }

      onKeyDown?.(event.key);
    },
    [onKeyDown, isTransitioning],
  );

  // キーボードイベントリスナーの設定
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // コンテナにフォーカスを当てる（キーボード入力を受け付けるため）
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Ghost Game"
      className="relative mx-auto h-[600px] w-[800px] overflow-hidden rounded-lg border-4 border-ghost-primary bg-ghost-surface shadow-2xl outline-none"
      tabIndex={0}
      data-testid="game-container"
      data-screen={currentScreen}
      data-transitioning={isTransitioning}
    >
      {/* ゲームコンテンツエリア */}
      <div className="h-full w-full">{children}</div>

      {/* 画面遷移トランジション */}
      <ScreenTransition
        type={transitionType}
        isActive={isTransitioning}
        onComplete={onTransitionComplete}
      />
    </div>
  );
}
