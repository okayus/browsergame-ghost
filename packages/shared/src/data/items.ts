import type { Item } from "../schemas/item";

/**
 * ポーション - HP30回復
 */
export const ITEM_POTION: Item = {
  id: "potion",
  name: "ポーション",
  category: "healing",
  description: "HPを30回復する",
  effectValue: 30,
  price: 200,
};

/**
 * スーパーポーション - HP60回復
 */
export const ITEM_SUPER_POTION: Item = {
  id: "super-potion",
  name: "スーパーポーション",
  category: "healing",
  description: "HPを60回復する",
  effectValue: 60,
  price: 500,
};

/**
 * ハイパーポーション - HP120回復
 */
export const ITEM_HYPER_POTION: Item = {
  id: "hyper-potion",
  name: "ハイパーポーション",
  category: "healing",
  description: "HPを120回復する",
  effectValue: 120,
  price: 1000,
};

/**
 * ゴーストボール - 基本捕獲アイテム（ボーナス0%）
 */
export const ITEM_GHOST_BALL: Item = {
  id: "ghost-ball",
  name: "ゴーストボール",
  category: "capture",
  description: "野生のゴーストを捕まえるボール",
  effectValue: 0,
  price: 100,
};

/**
 * スーパーボール - 捕獲ボーナス+50%
 */
export const ITEM_SUPER_BALL: Item = {
  id: "super-ball",
  name: "スーパーボール",
  category: "capture",
  description: "ゴーストボールより捕まえやすい",
  effectValue: 50,
  price: 300,
};

/**
 * ハイパーボール - 捕獲ボーナス+100%
 */
export const ITEM_HYPER_BALL: Item = {
  id: "hyper-ball",
  name: "ハイパーボール",
  category: "capture",
  description: "スーパーボールより捕まえやすい",
  effectValue: 100,
  price: 600,
};

/**
 * 全アイテム一覧
 */
export const ALL_ITEMS: Item[] = [
  ITEM_POTION,
  ITEM_SUPER_POTION,
  ITEM_HYPER_POTION,
  ITEM_GHOST_BALL,
  ITEM_SUPER_BALL,
  ITEM_HYPER_BALL,
];

/**
 * IDからアイテムを取得する
 */
export function getItemById(id: string): Item | undefined {
  return ALL_ITEMS.find((item) => item.id === id);
}
