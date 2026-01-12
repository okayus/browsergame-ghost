import type { GhostType, OwnedGhost, Party } from "@ghost-game/shared";
import { useCallback } from "react";
import type { GameScreen } from "./useGameState";

/**
 * 捕獲ハンドラフックのProps
 */
export interface UseCaptureHandlersProps {
  /** 捕獲したゴースト */
  capturedGhost: OwnedGhost | null;
  /** 捕獲ゴーストをセットする */
  setCapturedGhost: (ghost: OwnedGhost | null) => void;
  /** パーティにゴーストを追加する */
  addGhostToParty: (ghost: OwnedGhost) => boolean;
  /** パーティのゴーストを入れ替える */
  swapPartyGhost: (index: number, newGhost: OwnedGhost) => OwnedGhost | null;
  /** 現在のパーティ */
  party: Party | null;
  /** 保存待ちデータを更新する */
  updatePendingSaveData: (data: { party?: Party }) => void;
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
 * 捕獲ハンドラフックの戻り値
 */
export interface UseCaptureHandlersReturn {
  /** 捕獲完了後のバトル終了処理 */
  finishCaptureAndBattle: () => void;
  /** 捕獲したゴーストをパーティに追加 */
  handleAddCapturedToParty: () => void;
  /** 捕獲したゴーストをボックスに送る */
  handleSendCapturedToBox: () => void;
  /** 捕獲したゴーストとパーティのゴーストを入れ替え */
  handleSwapCapturedWithParty: (partyIndex: number) => void;
}

/**
 * 捕獲関連のハンドラを集約するフック
 *
 * CaptureSuccessPanelで使用されるハンドラを提供:
 * - finishCaptureAndBattle: 捕獲完了後のクリーンアップ
 * - handleAddCapturedToParty: パーティに追加
 * - handleSendCapturedToBox: ボックスに送る（未実装、単純に終了）
 * - handleSwapCapturedWithParty: パーティと入れ替え
 */
export function useCaptureHandlers({
  capturedGhost,
  setCapturedGhost,
  addGhostToParty,
  swapPartyGhost,
  party,
  updatePendingSaveData,
  resetBattle,
  setScreen,
  setPlayerGhostType,
  setEnemyGhostType,
}: UseCaptureHandlersProps): UseCaptureHandlersReturn {
  // 捕獲完了後のバトル終了処理
  const finishCaptureAndBattle = useCallback(() => {
    setCapturedGhost(null);
    resetBattle();
    setScreen("map");
    setPlayerGhostType(null);
    setEnemyGhostType(null);
  }, [resetBattle, setScreen, setCapturedGhost, setPlayerGhostType, setEnemyGhostType]);

  // 捕獲したゴーストをパーティに追加
  const handleAddCapturedToParty = useCallback(() => {
    if (capturedGhost) {
      addGhostToParty(capturedGhost);
      // パーティ更新をセーブキューに追加
      if (party) {
        updatePendingSaveData({ party });
      }
    }
    finishCaptureAndBattle();
  }, [capturedGhost, addGhostToParty, party, updatePendingSaveData, finishCaptureAndBattle]);

  // 捕獲したゴーストをボックスに送る（未実装のため単純に終了）
  const handleSendCapturedToBox = useCallback(() => {
    // ボックス機能は未実装なので単純に終了
    finishCaptureAndBattle();
  }, [finishCaptureAndBattle]);

  // 捕獲したゴーストとパーティのゴーストを入れ替え
  const handleSwapCapturedWithParty = useCallback(
    (partyIndex: number) => {
      if (capturedGhost) {
        swapPartyGhost(partyIndex, capturedGhost);
        // パーティ更新をセーブキューに追加
        if (party) {
          updatePendingSaveData({ party });
        }
      }
      finishCaptureAndBattle();
    },
    [capturedGhost, swapPartyGhost, party, updatePendingSaveData, finishCaptureAndBattle],
  );

  return {
    finishCaptureAndBattle,
    handleAddCapturedToParty,
    handleSendCapturedToBox,
    handleSwapCapturedWithParty,
  };
}
