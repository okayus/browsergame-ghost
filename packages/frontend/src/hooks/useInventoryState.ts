import type { Inventory, InventoryEntry, Item, ItemCategory } from "@ghost-game/shared";
import { useCallback, useState } from "react";

/**
 * アイテム使用結果
 */
export interface UseItemResult {
  /** 使用成功したか */
  success: boolean;
  /** 残り数量（使用後） */
  remainingQuantity: number;
}

/**
 * インベントリ状態
 */
export interface InventoryState {
  /** アイテム一覧 */
  items: InventoryEntry[];
}

/**
 * インベントリ状態管理フックの戻り値
 */
export interface UseInventoryStateReturn {
  /** 現在の状態 */
  state: InventoryState;
  /** インベントリを設定する */
  setInventory: (inventory: Inventory) => void;
  /** アイテムを使用する（数量を減らす） */
  useItem: (itemId: string, quantity?: number) => UseItemResult;
  /** アイテムを追加する */
  addItem: (itemId: string, quantity?: number) => void;
  /** アイテムを削除する */
  removeItem: (itemId: string) => void;
  /** アイテムの所持数を取得する */
  getItemQuantity: (itemId: string) => number;
  /** アイテムを所持しているか確認する */
  hasItem: (itemId: string, minQuantity?: number) => boolean;
  /** カテゴリ別にアイテムを取得する（マスタデータが必要） */
  getItemsByCategory: (category: ItemCategory, itemMaster: Item[]) => InventoryEntry[];
  /** インベントリをクリアする */
  clear: () => void;
}

/**
 * 最大所持数
 */
export const MAX_ITEM_QUANTITY = 99;

/**
 * 初期状態
 */
const initialState: InventoryState = {
  items: [],
};

/**
 * インベントリ状態を管理するフック
 *
 * - 所持アイテム一覧の状態管理
 * - アイテム使用アクション（所持数減少）
 * - アイテム追加アクション
 * - カテゴリ別アイテム取得
 */
export function useInventoryState(): UseInventoryStateReturn {
  const [state, setState] = useState<InventoryState>(initialState);

  const setInventory = useCallback((inventory: Inventory) => {
    setState({ items: inventory.items });
  }, []);

  const useItem = useCallback(
    (itemId: string, quantity = 1): UseItemResult => {
      const itemIndex = state.items.findIndex((item) => item.itemId === itemId);

      if (itemIndex === -1) {
        return { success: false, remainingQuantity: 0 };
      }

      const item = state.items[itemIndex];
      if (item.quantity < quantity) {
        return { success: false, remainingQuantity: item.quantity };
      }

      const newQuantity = item.quantity - quantity;

      setState((prev) => {
        const currentIndex = prev.items.findIndex((i) => i.itemId === itemId);
        if (currentIndex === -1) return prev;

        const currentItem = prev.items[currentIndex];
        if (currentItem.quantity < quantity) return prev;

        const updatedQuantity = currentItem.quantity - quantity;
        const updatedItems =
          updatedQuantity > 0
            ? prev.items.map((i, idx) =>
                idx === currentIndex ? { ...i, quantity: updatedQuantity } : i,
              )
            : prev.items.filter((_, idx) => idx !== currentIndex);

        return { items: updatedItems };
      });

      return { success: true, remainingQuantity: newQuantity };
    },
    [state.items],
  );

  const addItem = useCallback((itemId: string, quantity = 1) => {
    setState((prev) => {
      const itemIndex = prev.items.findIndex((item) => item.itemId === itemId);

      if (itemIndex !== -1) {
        // 既存アイテムの数量を増やす
        const updatedItems = prev.items.map((item, idx) =>
          idx === itemIndex
            ? { ...item, quantity: Math.min(MAX_ITEM_QUANTITY, item.quantity + quantity) }
            : item,
        );
        return { items: updatedItems };
      }

      // 新規アイテムを追加
      return {
        items: [...prev.items, { itemId, quantity: Math.min(MAX_ITEM_QUANTITY, quantity) }],
      };
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setState((prev) => ({
      items: prev.items.filter((item) => item.itemId !== itemId),
    }));
  }, []);

  const getItemQuantity = useCallback(
    (itemId: string): number => {
      const item = state.items.find((i) => i.itemId === itemId);
      return item?.quantity ?? 0;
    },
    [state.items],
  );

  const hasItem = useCallback(
    (itemId: string, minQuantity = 1): boolean => {
      const quantity = getItemQuantity(itemId);
      return quantity >= minQuantity;
    },
    [getItemQuantity],
  );

  const getItemsByCategory = useCallback(
    (category: ItemCategory, itemMaster: Item[]): InventoryEntry[] => {
      const categoryItemIds = new Set(
        itemMaster.filter((item) => item.category === category).map((item) => item.id),
      );

      return state.items.filter((entry) => categoryItemIds.has(entry.itemId));
    },
    [state.items],
  );

  const clear = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    setInventory,
    useItem,
    addItem,
    removeItem,
    getItemQuantity,
    hasItem,
    getItemsByCategory,
    clear,
  };
}
