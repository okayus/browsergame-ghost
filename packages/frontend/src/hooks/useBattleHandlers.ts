import {
  type BattlePhase,
  type GhostType,
  getItemById,
  getMoveById,
  ITEMS_MAP,
  type Move,
  type OwnedGhost,
  type OwnedMove,
} from "@ghost-game/shared";
import { useCallback } from "react";
import type { BattleCommand } from "../components/battle/CommandPanel";
import type { DisplayItem } from "../components/battle/ItemSelectPanel";
import type { DisplayMove } from "../components/battle/SkillSelectPanel";
import { getCaptureBonus } from "./useBattleItem";
import type { BattleAction, BattleEndReason, BattleState, TurnResult } from "./useBattleState";

/**
 * バトルハンドラフックのProps
 */
export interface UseBattleHandlersProps {
  /** バトル状態 */
  battleState: BattleState;
  /** プレイヤーゴーストのタイプ */
  playerGhostType: GhostType | null;
  /** 敵ゴーストのタイプ */
  enemyGhostType: GhostType | null;
  /** フェーズを変更する */
  setPhase: (phase: BattlePhase) => void;
  /** プレイヤーのアクションを実行する */
  executePlayerAction: (
    action: BattleAction,
    playerType: GhostType,
    enemyType: GhostType,
  ) => TurnResult;
  /** パーティのHP同期を行う */
  syncPartyHp: (
    battleState: BattleState,
    endReason: BattleEndReason,
    activeGhostId: string,
  ) => void;
  /** バトルを終了してマップに遷移 */
  finishBattle: (delay?: number) => void;
  /** アイテムを消費する */
  consumeItem: (itemId: string) => boolean;
  /** 保存待ちデータを更新する */
  updatePendingSaveData: (data: {
    inventory?: { items: { itemId: string; quantity: number }[] };
  }) => void;
  /** 捕獲したゴーストをセットする */
  setCapturedGhost: (ghost: OwnedGhost | null) => void;
  /** パーティの先頭ゴーストのID */
  activeGhostId: string | undefined;
  /** インベントリのアイテム */
  inventoryItems: { itemId: string; quantity: number }[];
  /** 現在のインベントリ（セーブ用） */
  currentInventory: { items: { itemId: string; quantity: number }[] };
}

/**
 * バトルハンドラフックの戻り値
 */
export interface UseBattleHandlersReturn {
  /** バトルコマンド選択ハンドラ */
  handleBattleCommand: (command: BattleCommand) => void;
  /** 技選択ハンドラ */
  handleMoveSelect: (moveId: string) => void;
  /** 技選択から戻るハンドラ */
  handleMoveSelectBack: () => void;
  /** アイテム選択ハンドラ */
  handleItemSelect: (itemId: string) => void;
  /** アイテム選択から戻るハンドラ */
  handleItemSelectBack: () => void;
  /** プレイヤーゴーストの技情報を取得 */
  getPlayerMoves: () => DisplayMove[];
  /** バトル中のアイテム一覧を取得 */
  getBattleItems: () => DisplayItem[];
}

/**
 * バトル関連のハンドラを集約するフック
 *
 * App.tsxから以下のハンドラを抽出:
 * - handleBattleCommand: コマンド選択時の処理
 * - handleMoveSelect: 技選択時の処理
 * - handleMoveSelectBack: 技選択から戻る
 * - handleItemSelect: アイテム選択時の処理
 * - handleItemSelectBack: アイテム選択から戻る
 * - getPlayerMoves: 技一覧の取得
 * - getBattleItems: アイテム一覧の取得
 */
export function useBattleHandlers({
  battleState,
  playerGhostType,
  enemyGhostType,
  setPhase,
  executePlayerAction,
  syncPartyHp,
  finishBattle,
  consumeItem,
  updatePendingSaveData,
  setCapturedGhost,
  activeGhostId,
  inventoryItems,
  currentInventory,
}: UseBattleHandlersProps): UseBattleHandlersReturn {
  // バトルコマンド選択ハンドラ
  const handleBattleCommand = useCallback(
    (command: BattleCommand) => {
      switch (command) {
        case "fight":
          setPhase("move_select");
          break;
        case "item":
          setPhase("item_select");
          break;
        case "capture":
          // 捕獲処理
          if (playerGhostType && enemyGhostType) {
            const result = executePlayerAction(
              { type: "capture", itemBonus: 1.0 },
              playerGhostType,
              enemyGhostType,
            );
            if (result.battleEnded && result.endReason) {
              // HP同期
              if (activeGhostId) {
                syncPartyHp(battleState, result.endReason, activeGhostId);
              }
              // 捕獲成功時は捕獲ゴーストをセット（CaptureSuccessPanelで処理）
              if (result.endReason === "capture" && battleState.enemyGhost) {
                setCapturedGhost(battleState.enemyGhost.ghost);
              } else {
                // 捕獲以外の終了理由（player_lose等）の場合
                finishBattle();
              }
            }
          }
          break;
        case "run":
          // 逃走処理
          if (playerGhostType && enemyGhostType) {
            const result = executePlayerAction({ type: "escape" }, playerGhostType, enemyGhostType);
            if (result.battleEnded && result.endReason) {
              // HP同期（逃走成功時）
              if (activeGhostId) {
                syncPartyHp(battleState, result.endReason, activeGhostId);
              }
              // 逃走成功
              finishBattle(1500);
            }
          }
          break;
      }
    },
    [
      playerGhostType,
      enemyGhostType,
      battleState,
      activeGhostId,
      setPhase,
      executePlayerAction,
      syncPartyHp,
      finishBattle,
      setCapturedGhost,
    ],
  );

  // 技選択ハンドラ
  const handleMoveSelect = useCallback(
    (moveId: string) => {
      if (!battleState.playerGhost || !playerGhostType || !enemyGhostType) {
        return;
      }

      const moveIndex = battleState.playerGhost.ghost.moves.findIndex((m) => m.moveId === moveId);
      if (moveIndex === -1) {
        return;
      }

      const result = executePlayerAction(
        { type: "attack", moveIndex },
        playerGhostType,
        enemyGhostType,
      );

      if (result.battleEnded && result.endReason) {
        // HP同期（勝利/敗北時）
        if (activeGhostId) {
          syncPartyHp(battleState, result.endReason, activeGhostId);
        }
        // バトル終了処理
        finishBattle();
      } else {
        // コマンド選択に戻る
        setPhase("command_select");
      }
    },
    [
      battleState,
      activeGhostId,
      playerGhostType,
      enemyGhostType,
      executePlayerAction,
      syncPartyHp,
      finishBattle,
      setPhase,
    ],
  );

  // 技選択から戻る
  const handleMoveSelectBack = useCallback(() => {
    setPhase("command_select");
  }, [setPhase]);

  // プレイヤーゴーストの技情報を取得
  const getPlayerMoves = useCallback((): DisplayMove[] => {
    if (!battleState.playerGhost) {
      return [];
    }

    return battleState.playerGhost.ghost.moves
      .map((ownedMove: OwnedMove) => {
        const moveData = getMoveById(ownedMove.moveId);
        if (!moveData) {
          return null;
        }
        return { move: moveData as Move, ownedMove };
      })
      .filter((m): m is DisplayMove => m !== null);
  }, [battleState.playerGhost]);

  // バトル中のアイテム一覧を取得（回復系と捕獲系のみ）
  const getBattleItems = useCallback((): DisplayItem[] => {
    const result: DisplayItem[] = [];
    for (const entry of inventoryItems) {
      const itemData = ITEMS_MAP.get(entry.itemId);
      if (!itemData) continue;
      // バトル中は回復系と捕獲系のみ表示
      if (itemData.category !== "healing" && itemData.category !== "capture") continue;
      result.push({ item: itemData, entry });
    }
    return result;
  }, [inventoryItems]);

  // アイテム選択ハンドラ
  const handleItemSelect = useCallback(
    (itemId: string) => {
      // アイテムマスタから情報取得
      const itemData = getItemById(itemId);
      if (!itemData) {
        console.error("Item not found:", itemId);
        setPhase("command_select");
        return;
      }

      // 回復アイテムの場合
      if (itemData.category === "healing") {
        // アイテムを消費
        const consumed = consumeItem(itemId);
        if (!consumed) {
          console.error("Failed to consume item:", itemId);
          setPhase("command_select");
          return;
        }

        // インベントリ更新をセーブキューに追加
        updatePendingSaveData({ inventory: currentInventory });

        // バトルアクション実行（敵ターン込み）
        if (playerGhostType && enemyGhostType) {
          const result = executePlayerAction(
            { type: "item", itemId, healAmount: itemData.effectValue },
            playerGhostType,
            enemyGhostType,
          );

          if (result.battleEnded && result.endReason) {
            // HP同期（敗北時）
            if (activeGhostId) {
              syncPartyHp(battleState, result.endReason, activeGhostId);
            }
            // バトル終了処理
            finishBattle();
          } else {
            // バトル継続 - コマンド選択に戻る
            setPhase("command_select");
          }
        }
        return;
      }

      // 捕獲アイテムの場合
      if (itemData.category === "capture") {
        // アイテムを消費
        const consumed = consumeItem(itemId);
        if (!consumed) {
          console.error("Failed to consume capture item:", itemId);
          setPhase("command_select");
          return;
        }

        // 捕獲ボーナスを計算
        const itemBonus = getCaptureBonus(itemData);

        // インベントリ更新をセーブキューに追加
        updatePendingSaveData({ inventory: currentInventory });

        // 捕獲アクション実行
        if (playerGhostType && enemyGhostType) {
          const result = executePlayerAction(
            { type: "capture", itemBonus },
            playerGhostType,
            enemyGhostType,
          );

          if (result.battleEnded && result.endReason) {
            // HP同期
            if (activeGhostId) {
              syncPartyHp(battleState, result.endReason, activeGhostId);
            }
            // 捕獲成功時は捕獲ゴーストをセット（CaptureSuccessPanelで処理）
            if (result.endReason === "capture" && battleState.enemyGhost) {
              setCapturedGhost(battleState.enemyGhost.ghost);
            } else {
              // 捕獲以外の終了理由（player_lose等）の場合
              finishBattle();
            }
          } else {
            // 捕獲失敗でバトル継続 - コマンド選択に戻る
            setPhase("command_select");
          }
        }
        return;
      }

      // その他のアイテム
      setPhase("command_select");
    },
    [
      playerGhostType,
      enemyGhostType,
      battleState,
      activeGhostId,
      currentInventory,
      consumeItem,
      executePlayerAction,
      syncPartyHp,
      updatePendingSaveData,
      finishBattle,
      setPhase,
      setCapturedGhost,
    ],
  );

  // アイテム選択から戻る
  const handleItemSelectBack = useCallback(() => {
    setPhase("command_select");
  }, [setPhase]);

  return {
    handleBattleCommand,
    handleMoveSelect,
    handleMoveSelectBack,
    handleItemSelect,
    handleItemSelectBack,
    getPlayerMoves,
    getBattleItems,
  };
}
