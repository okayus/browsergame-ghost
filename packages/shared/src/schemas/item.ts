import { z } from "zod";

/**
 * アイテム種別
 * 回復系、捕獲系、その他
 */
export const ItemCategorySchema = z.enum([
  "healing", // 回復系（ポーション等）
  "capture", // 捕獲系（ゴーストボール等）
  "other", // その他
]);

export type ItemCategory = z.infer<typeof ItemCategorySchema>;

/**
 * アイテムマスタ
 * ゲームに登場するアイテムの定義
 */
export const ItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  category: ItemCategorySchema,
  description: z.string().optional(),
  // 回復系の場合: HP回復量
  // 捕獲系の場合: 捕獲率ボーナス（%）
  effectValue: z.number().int().min(0),
  // 購入価格（0は非売品）
  price: z.number().int().min(0).default(0),
});

export type Item = z.infer<typeof ItemSchema>;

/**
 * インベントリエントリ
 * アイテムIDと所持数のペア
 */
export const InventoryEntrySchema = z.object({
  itemId: z.string(),
  quantity: z.number().int().min(0).max(99),
});

export type InventoryEntry = z.infer<typeof InventoryEntrySchema>;

/**
 * インベントリ
 * プレイヤーの所持アイテム一覧
 */
export const InventorySchema = z.object({
  items: z.array(InventoryEntrySchema),
});

export type Inventory = z.infer<typeof InventorySchema>;
