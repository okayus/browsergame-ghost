import { useCallback, useEffect, useRef, useState } from "react";
import type { TransitionType } from "../components/game/ScreenTransition";
import { getTransitionType } from "../components/game/ScreenTransition";
import type { GameScreen } from "./useGameState";

/**
 * 画面遷移トランジションの状態
 */
export interface ScreenTransitionState {
  /** トランジションがアクティブかどうか */
  isTransitioning: boolean;
  /** 現在のトランジションタイプ */
  transitionType: TransitionType;
  /** 遷移先の画面 */
  pendingScreen: GameScreen | null;
}

/**
 * useScreenTransitionの戻り値
 */
export interface UseScreenTransitionReturn {
  /** トランジション状態 */
  state: ScreenTransitionState;
  /** 画面遷移を開始する（トランジション付き） */
  startTransition: (toScreen: GameScreen) => void;
  /** トランジション完了時に呼ばれるコールバックを設定 */
  onTransitionComplete: () => void;
  /** 即座に画面を変更（トランジションなし） */
  skipTransition: (toScreen: GameScreen) => void;
}

/**
 * 画面遷移トランジションを管理するフック
 *
 * @param currentScreen - 現在の画面
 * @param onScreenChange - 画面変更時のコールバック
 */
export function useScreenTransition(
  currentScreen: GameScreen,
  onScreenChange: (screen: GameScreen) => void,
): UseScreenTransitionReturn {
  const [state, setState] = useState<ScreenTransitionState>({
    isTransitioning: false,
    transitionType: "fade",
    pendingScreen: null,
  });

  const previousScreenRef = useRef<GameScreen | null>(null);

  // 前回の画面を記録
  useEffect(() => {
    previousScreenRef.current = currentScreen;
  }, [currentScreen]);

  /**
   * 画面遷移を開始する
   */
  const startTransition = useCallback(
    (toScreen: GameScreen) => {
      // 同じ画面への遷移は無視
      if (toScreen === currentScreen) {
        return;
      }

      const transitionType = getTransitionType(currentScreen, toScreen);

      setState({
        isTransitioning: true,
        transitionType,
        pendingScreen: toScreen,
      });
    },
    [currentScreen],
  );

  /**
   * トランジション完了時の処理
   */
  const onTransitionComplete = useCallback(() => {
    if (state.pendingScreen) {
      onScreenChange(state.pendingScreen);
    }

    setState({
      isTransitioning: false,
      transitionType: "fade",
      pendingScreen: null,
    });
  }, [state.pendingScreen, onScreenChange]);

  /**
   * トランジションをスキップして即座に画面変更
   */
  const skipTransition = useCallback(
    (toScreen: GameScreen) => {
      setState({
        isTransitioning: false,
        transitionType: "fade",
        pendingScreen: null,
      });
      onScreenChange(toScreen);
    },
    [onScreenChange],
  );

  return {
    state,
    startTransition,
    onTransitionComplete,
    skipTransition,
  };
}
