import { useEffect, useState } from "react";
import type { GameScreen } from "../../hooks/useGameState";

/**
 * トランジションタイプ
 */
export type TransitionType = "fade" | "battle-enter" | "battle-exit" | "slide-up";

/**
 * トランジションの状態
 */
export type TransitionState = "idle" | "entering" | "active" | "exiting";

/**
 * ScreenTransitionのProps
 */
export interface ScreenTransitionProps {
  /** トランジションのタイプ */
  type: TransitionType;
  /** トランジションがアクティブかどうか */
  isActive: boolean;
  /** トランジション完了時のコールバック */
  onComplete?: () => void;
  /** トランジションの継続時間（ミリ秒） */
  duration?: number;
}

/**
 * トランジション効果の設定
 */
const TRANSITION_CONFIGS: Record<
  TransitionType,
  {
    enterDuration: number;
    activeDuration: number;
    exitDuration: number;
    enterClass: string;
    activeClass: string;
    exitClass: string;
  }
> = {
  fade: {
    enterDuration: 200,
    activeDuration: 100,
    exitDuration: 200,
    enterClass: "animate-fade-in",
    activeClass: "opacity-100",
    exitClass: "animate-fade-out",
  },
  "battle-enter": {
    enterDuration: 300,
    activeDuration: 200,
    exitDuration: 300,
    enterClass: "animate-battle-flash-in",
    activeClass: "bg-white",
    exitClass: "animate-battle-flash-out",
  },
  "battle-exit": {
    enterDuration: 200,
    activeDuration: 100,
    exitDuration: 200,
    enterClass: "animate-fade-in",
    activeClass: "opacity-100",
    exitClass: "animate-fade-out",
  },
  "slide-up": {
    enterDuration: 200,
    activeDuration: 0,
    exitDuration: 200,
    enterClass: "animate-slide-up",
    activeClass: "",
    exitClass: "animate-slide-down",
  },
};

/**
 * 画面遷移トランジションコンポーネント
 *
 * - マップ→バトル: バトル開始のフラッシュ効果
 * - バトル→マップ: フェードアウト/フェードイン
 * - メニュー画面: スライドアップ
 */
export function ScreenTransition({ type, isActive, onComplete, duration }: ScreenTransitionProps) {
  const [state, setState] = useState<TransitionState>("idle");

  const config = TRANSITION_CONFIGS[type];
  const totalDuration =
    duration ?? config.enterDuration + config.activeDuration + config.exitDuration;

  useEffect(() => {
    if (!isActive) {
      setState("idle");
      return;
    }

    // トランジション開始
    setState("entering");

    const enterTimer = setTimeout(() => {
      setState("active");
    }, config.enterDuration);

    const activeTimer = setTimeout(() => {
      setState("exiting");
    }, config.enterDuration + config.activeDuration);

    const exitTimer = setTimeout(() => {
      setState("idle");
      onComplete?.();
    }, totalDuration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(activeTimer);
      clearTimeout(exitTimer);
    };
  }, [isActive, config, totalDuration, onComplete]);

  if (state === "idle") {
    return null;
  }

  const getAnimationClass = () => {
    switch (state) {
      case "entering":
        return config.enterClass;
      case "active":
        return config.activeClass;
      case "exiting":
        return config.exitClass;
      default:
        return "";
    }
  };

  return (
    <div
      data-testid="screen-transition"
      data-state={state}
      data-type={type}
      className={`pointer-events-none absolute inset-0 z-50 ${getAnimationClass()}`}
      aria-hidden="true"
    />
  );
}

/**
 * 画面遷移に応じたトランジションタイプを取得
 */
export function getTransitionType(
  fromScreen: GameScreen | null,
  toScreen: GameScreen,
): TransitionType {
  // マップからバトルへの遷移
  if (fromScreen === "map" && toScreen === "battle") {
    return "battle-enter";
  }

  // バトルからマップへの遷移
  if (fromScreen === "battle" && toScreen === "map") {
    return "battle-exit";
  }

  // メニュー画面への遷移
  if (toScreen === "menu" || toScreen === "party") {
    return "slide-up";
  }

  // その他のデフォルト遷移
  return "fade";
}
