import { z } from "zod";
import { OwnedGhostSchema } from "./ghost";
import { InventorySchema } from "./item";

/**
 * パーティ
 * 最大6体のゴースト
 */
export const PartySchema = z.object({
  ghosts: z.array(OwnedGhostSchema).min(1).max(6),
});

export type Party = z.infer<typeof PartySchema>;

/**
 * プレイヤー位置
 */
export const PlayerPositionSchema = z.object({
  mapId: z.string(),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
});

export type PlayerPosition = z.infer<typeof PlayerPositionSchema>;

/**
 * マップタイルタイプ
 */
export const TileTypeSchema = z.enum([
  "ground", // 地面（移動可能）
  "grass", // 草むら（移動可能、エンカウントあり）
  "wall", // 壁（移動不可）
  "water", // 水（移動不可）
]);

export type TileType = z.infer<typeof TileTypeSchema>;

/**
 * マップタイル
 */
export const MapTileSchema = z.object({
  type: TileTypeSchema,
  walkable: z.boolean(),
  encounterRate: z.number().min(0).max(1).default(0), // 0〜1の確率
});

export type MapTile = z.infer<typeof MapTileSchema>;

/**
 * マップデータ
 */
export const MapDataSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  width: z.number().int().min(1),
  height: z.number().int().min(1),
  tiles: z.array(z.array(MapTileSchema)), // 2次元配列 [y][x]
  // エンカウント可能なゴースト種族IDと出現率
  encounters: z.array(
    z.object({
      speciesId: z.string(),
      weight: z.number().min(0), // 相対確率
      minLevel: z.number().int().min(1),
      maxLevel: z.number().int().min(1),
    }),
  ),
});

export type MapData = z.infer<typeof MapDataSchema>;

/**
 * プレイヤーデータ（セーブデータ）
 */
export const PlayerDataSchema = z.object({
  id: z.string(),
  clerkUserId: z.string(),
  name: z.string().min(1),
  party: PartySchema,
  inventory: InventorySchema,
  position: PlayerPositionSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type PlayerData = z.infer<typeof PlayerDataSchema>;
