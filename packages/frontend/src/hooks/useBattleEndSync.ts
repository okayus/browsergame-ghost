import type { Party } from "@ghost-game/shared";
import { useCallback } from "react";
import type { BattleEndReason, BattleState } from "./useBattleState";
import type { UseGameStateReturn } from "./useGameState";

/**
 * HP同期結果
 */
export interface SyncResult {
  /** 更新後のパーティ */
  updatedParty: Party;
  /** セーブが必要か */
  saveRequired: boolean;
}

/**
 * バトル終了後のパーティHP同期を行う純粋関数
 *
 * - 勝利/逃走/捕獲時: バトル中のHPをパーティに反映
 * - 敗北時: パーティ全員のHPを最大HPまで回復
 */
export function syncPartyHpAfterBattle(
  battleState: BattleState,
  endReason: BattleEndReason,
  party: Party,
  activeGhostId: string,
): SyncResult {
  if (endReason === "player_lose") {
    // 敗北時: パーティ全員のHPを最大HPまで回復
    const updatedGhosts = party.ghosts.map((ghost) => ({
      ...ghost,
      currentHp: ghost.maxHp,
    }));

    return {
      updatedParty: { ...party, ghosts: updatedGhosts },
      saveRequired: true,
    };
  }

  // 勝利/逃走/捕獲時: バトル中のHPをパーティに反映
  if (!battleState.playerGhost) {
    // playerGhostがnullの場合は変更なし
    return {
      updatedParty: party,
      saveRequired: true,
    };
  }

  const battleHp = battleState.playerGhost.currentHp;

  const updatedGhosts = party.ghosts.map((ghost) => {
    if (ghost.id === activeGhostId) {
      return {
        ...ghost,
        currentHp: battleHp,
      };
    }
    return ghost;
  });

  return {
    updatedParty: { ...party, ghosts: updatedGhosts },
    saveRequired: true,
  };
}

/**
 * バトル終了時HP同期フックの戻り値
 */
export interface UseBattleEndSyncReturn {
  /**
   * バトル終了時のHP同期を実行
   * @param battleState 現在のバトル状態
   * @param endReason バトル終了理由
   * @param activeGhostId バトルに参加していたゴーストのID
   */
  syncPartyHp: (
    battleState: BattleState,
    endReason: BattleEndReason,
    activeGhostId: string,
  ) => void;
}

/**
 * バトル終了時にパーティHPを同期するフック
 *
 * 要件:
 * - 15.1: 勝利時にバトル中のHPをパーティに反映
 * - 15.2: 逃走成功時にバトル中のHPをパーティに反映
 * - 15.3: 捕獲成功時にバトル中のHPをパーティに反映
 * - 15.4: 敗北時にパーティ全員のHPを最大HPまで回復
 * - 15.5: HP更新時にセーブキューに追加
 */
export function useBattleEndSync(
  gameState: UseGameStateReturn,
  updatePendingSaveData: (data: { party?: Party }) => void,
): UseBattleEndSyncReturn {
  const { state, updatePartyGhost, setParty } = gameState;

  const syncPartyHp = useCallback(
    (
      battleState: BattleState,
      endReason: BattleEndReason,
      activeGhostId: string,
    ) => {
      if (!state.party) {
        return;
      }

      const result = syncPartyHpAfterBattle(
        battleState,
        endReason,
        state.party,
        activeGhostId,
      );

      // パーティを更新
      if (endReason === "player_lose") {
        // 敗北時は全員更新するのでsetPartyを使用
        setParty(result.updatedParty);
      } else {
        // それ以外は個別更新
        const battleHp = battleState.playerGhost?.currentHp;
        if (battleHp !== undefined) {
          updatePartyGhost(activeGhostId, { currentHp: battleHp });
        }
      }

      // セーブキューに追加
      if (result.saveRequired) {
        updatePendingSaveData({ party: result.updatedParty });
      }
    },
    [state.party, updatePartyGhost, setParty, updatePendingSaveData],
  );

  return {
    syncPartyHp,
  };
}
