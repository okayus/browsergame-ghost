import { z } from "zod";

/**
 * ゴーストタイプ
 * 炎、水、草、電気、霊、ノーマルの6種類
 */
export const GhostTypeSchema = z.enum([
  "fire", // 炎
  "water", // 水
  "grass", // 草
  "electric", // 電気
  "ghost", // 霊
  "normal", // ノーマル
]);

export type GhostType = z.infer<typeof GhostTypeSchema>;

/**
 * 基礎能力値
 * HP、攻撃、防御、素早さの4種類
 */
export const BaseStatsSchema = z.object({
  hp: z.number().int().min(1).max(255),
  attack: z.number().int().min(1).max(255),
  defense: z.number().int().min(1).max(255),
  speed: z.number().int().min(1).max(255),
});

export type BaseStats = z.infer<typeof BaseStatsSchema>;

/**
 * 技の定義
 */
export const MoveSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: GhostTypeSchema,
  power: z.number().int().min(0).max(250), // 0はダメージなし技
  accuracy: z.number().int().min(0).max(100), // 命中率（%）
  pp: z.number().int().min(1).max(40), // 使用可能回数
  description: z.string().optional(),
});

export type Move = z.infer<typeof MoveSchema>;

/**
 * レベルごとの習得技
 */
export const LearnableMoveSchema = z.object({
  level: z.number().int().min(1).max(100),
  moveId: z.string(),
});

export type LearnableMove = z.infer<typeof LearnableMoveSchema>;

/**
 * ゴースト種族マスタ
 * ゲームに登場するゴーストの種族定義
 */
export const GhostSpeciesSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: GhostTypeSchema,
  baseStats: BaseStatsSchema,
  learnableMoves: z.array(LearnableMoveSchema),
  description: z.string().optional(),
  rarity: z.enum(["common", "uncommon", "rare", "epic", "legendary"]),
});

export type GhostSpecies = z.infer<typeof GhostSpeciesSchema>;

/**
 * プレイヤーが所持している技のインスタンス
 * 残りPPを管理
 */
export const OwnedMoveSchema = z.object({
  moveId: z.string(),
  currentPP: z.number().int().min(0),
  maxPP: z.number().int().min(1),
});

export type OwnedMove = z.infer<typeof OwnedMoveSchema>;

/**
 * プレイヤー所持ゴースト
 * 個体値、レベル、経験値、現在のステータスを持つ
 */
export const OwnedGhostSchema = z.object({
  id: z.string(), // ユニークID
  speciesId: z.string(), // 種族マスタID
  nickname: z.string().optional(), // ニックネーム
  level: z.number().int().min(1).max(100),
  experience: z.number().int().min(0),
  currentHp: z.number().int().min(0),
  maxHp: z.number().int().min(1),
  stats: BaseStatsSchema, // 現在の能力値（レベル計算後）
  moves: z.array(OwnedMoveSchema).max(4), // 最大4つの技
});

export type OwnedGhost = z.infer<typeof OwnedGhostSchema>;

/**
 * バトル中のゴースト状態
 */
export const BattleGhostSchema = OwnedGhostSchema.extend({
  // バトル中の一時的なステータス変化
  statModifiers: z
    .object({
      attack: z.number().int().min(-6).max(6).default(0),
      defense: z.number().int().min(-6).max(6).default(0),
      speed: z.number().int().min(-6).max(6).default(0),
    })
    .optional(),
});

export type BattleGhost = z.infer<typeof BattleGhostSchema>;
