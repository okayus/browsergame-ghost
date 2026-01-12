import type { GhostType } from "@ghost-game/shared";
import { useCallback } from "react";
import type { GameScreen } from "./useGameState";

/**
 * バトル終了遷移フックのProps
 */
export interface UseBattleTransitionProps {
  /** バトル状態をリセットする */
  resetBattle: () => void;
  /** 画面を切り替える */
  setScreen: (screen: GameScreen) => void;
  /** プレイヤーゴーストのタイプをクリアする */
  setPlayerGhostType: (type: GhostType | null) => void;
  /** 敵ゴーストのタイプをクリアする */
  setEnemyGhostType: (type: GhostType | null) => void;
}

/**
 * バトル終了遷移フックの戻り値
 */
export interface UseBattleTransitionReturn {
  /** バトルを終了してマップ画面に遷移する */
  finishBattle: (delay?: number) => void;
}

/**
 * バトル終了時の画面遷移処理を共通化するフック
 *
 * - バトル状態のリセット
 * - マップ画面への遷移
 * - ゴーストタイプのクリア
 *
 * 使用例:
 * ```typescript
 * const { finishBattle } = useBattleTransition({
 *   resetBattle,
 *   setScreen,
 *   setPlayerGhostType,
 *   setEnemyGhostType,
 * });
 *
 * // バトル終了時に呼び出し（デフォルト2000ms遅延）
 * finishBattle();
 *
 * // 逃走時は短い遅延
 * finishBattle(1500);
 * ```
 */
export function useBattleTransition({
  resetBattle,
  setScreen,
  setPlayerGhostType,
  setEnemyGhostType,
}: UseBattleTransitionProps): UseBattleTransitionReturn {
  const finishBattle = useCallback(
    (delay = 2000) => {
      setTimeout(() => {
        resetBattle();
        setScreen("map");
        setPlayerGhostType(null);
        setEnemyGhostType(null);
      }, delay);
    },
    [resetBattle, setScreen, setPlayerGhostType, setEnemyGhostType],
  );

  return { finishBattle };
}
