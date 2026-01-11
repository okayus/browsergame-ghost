import type { Inventory, Item, OwnedGhost, Party } from "@ghost-game/shared";
import { useCallback } from "react";
import type { UseGameStateReturn } from "./useGameState";

/**
 * 回復アイテム使用結果
 */
export interface HealingResult {
  /** 使用成功したか */
  success: boolean;
  /** 実際に回復した量 */
  healedAmount: number;
  /** 回復後のHP */
  newHp: number;
}

/**
 * 捕獲アイテム結果
 */
export interface CaptureItemResult {
  /** 捕獲ボーナス（1.0 = 100%、1.5 = 150%など） */
  captureBonus: number;
}

/**
 * バトル中アイテム使用結果
 */
export interface BattleItemUseResult {
  /** 使用成功したか */
  success: boolean;
  /** アイテムカテゴリ */
  category: "healing" | "capture" | "other";
  /** 回復結果（回復アイテムの場合） */
  healingResult?: HealingResult;
  /** 捕獲ボーナス（捕獲アイテムの場合） */
  captureBonus?: number;
  /** メッセージ */
  message: string;
}

/**
 * 回復アイテムを適用する純粋関数
 *
 * @param item アイテムデータ
 * @param ghost 対象ゴースト
 * @returns 回復結果
 */
export function applyHealingItem(item: Item, ghost: OwnedGhost): HealingResult {
  // 回復アイテムでない場合は失敗
  if (item.category !== "healing") {
    return {
      success: false,
      healedAmount: 0,
      newHp: ghost.currentHp,
    };
  }

  // 回復量を計算（最大HPを超えない）
  const maxHealAmount = ghost.maxHp - ghost.currentHp;
  const actualHealAmount = Math.min(item.effectValue, maxHealAmount);
  const newHp = ghost.currentHp + actualHealAmount;

  return {
    success: true,
    healedAmount: actualHealAmount,
    newHp,
  };
}

/**
 * 捕獲アイテムのボーナスを取得する純粋関数
 *
 * @param item アイテムデータ
 * @returns 捕獲ボーナス（1.0 = 100%、1.5 = 150%など）
 */
export function getCaptureBonus(item: Item): number {
  // 捕獲アイテムでない場合は基本値
  if (item.category !== "capture") {
    return 1.0;
  }

  // effectValueは%表記（0, 50, 100など）なので変換
  return 1.0 + item.effectValue / 100;
}

/**
 * バトル中アイテム使用フックの戻り値
 */
export interface UseBattleItemReturn {
  /**
   * 回復アイテムを使用する
   * @param item アイテムデータ
   * @param ghostId 対象ゴーストID
   * @returns 使用結果
   */
  useHealingItem: (item: Item, ghostId: string) => BattleItemUseResult;

  /**
   * 捕獲アイテムのボーナスを取得する
   * @param item アイテムデータ
   * @returns 捕獲ボーナス
   */
  getCaptureItemBonus: (item: Item) => number;
}

/**
 * バトル中のアイテム使用ロジックを管理するフック
 *
 * 要件:
 * - 16.3: 回復アイテム使用時にプレイヤーゴーストのHPを回復
 * - 16.4: 回復量はアイテム効果に準じる（最大HPを超えない）
 * - 16.6: 捕獲アイテム使用時にアイテムごとのボーナスを適用
 * - 16.7: アイテム使用後は所持数が1減る
 */
export function useBattleItem(
  gameState: UseGameStateReturn,
  consumeItem: (itemId: string) => boolean,
  updatePendingSaveData: (data: { party?: Party; inventory?: Inventory }) => void,
): UseBattleItemReturn {
  const { state, updatePartyGhost } = gameState;

  const useHealingItem = useCallback(
    (item: Item, ghostId: string): BattleItemUseResult => {
      // パーティからゴーストを取得
      const ghost = state.party?.ghosts.find((g) => g.id === ghostId);
      if (!ghost) {
        return {
          success: false,
          category: "healing",
          message: "ゴーストが見つかりません",
        };
      }

      // 回復アイテムでない場合
      if (item.category !== "healing") {
        return {
          success: false,
          category: item.category,
          message: "このアイテムは回復アイテムではありません",
        };
      }

      // アイテムを消費
      const consumed = consumeItem(item.id);
      if (!consumed) {
        return {
          success: false,
          category: "healing",
          message: "アイテムを使用できませんでした",
        };
      }

      // 回復を適用
      const healingResult = applyHealingItem(item, ghost);

      // パーティのゴーストHPを更新
      updatePartyGhost(ghostId, { currentHp: healingResult.newHp });

      // セーブデータを更新
      if (state.party) {
        const updatedGhosts = state.party.ghosts.map((g) =>
          g.id === ghostId ? { ...g, currentHp: healingResult.newHp } : g,
        );
        updatePendingSaveData({
          party: { ...state.party, ghosts: updatedGhosts },
          inventory: { items: state.inventory.items },
        });
      }

      // メッセージを生成
      const message =
        healingResult.healedAmount > 0
          ? `${item.name}を使った！HPが${healingResult.healedAmount}回復した！`
          : `${item.name}を使った！しかしHPは満タンだ！`;

      return {
        success: true,
        category: "healing",
        healingResult,
        message,
      };
    },
    [state.party, state.inventory.items, updatePartyGhost, consumeItem, updatePendingSaveData],
  );

  const getCaptureItemBonus = useCallback((item: Item): number => {
    return getCaptureBonus(item);
  }, []);

  return {
    useHealingItem,
    getCaptureItemBonus,
  };
}
