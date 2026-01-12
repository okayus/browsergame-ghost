import { z } from "zod";
import { OwnedGhostSchema } from "./ghost";

/**
 * バトル中のステータス変化（-6〜+6段階）
 * React stateで管理、DBには保存しない
 */
export const StatModifiersSchema = z.object({
  attack: z.number().int().min(-6).max(6).default(0),
  defense: z.number().int().min(-6).max(6).default(0),
  speed: z.number().int().min(-6).max(6).default(0),
});

export type StatModifiers = z.infer<typeof StatModifiersSchema>;

/**
 * バトル中のゴースト状態
 * React stateで管理、DBには保存しない
 * バトル終了時にOwnedGhostのcurrentHp, movesのcurrentPPを更新
 */
export const BattleGhostStateSchema = z.object({
  ghost: OwnedGhostSchema,
  currentHp: z.number().int().min(0), // バトル中のHP（変動する）
  statModifiers: StatModifiersSchema,
});

export type BattleGhostState = z.infer<typeof BattleGhostStateSchema>;

/**
 * バトルのフェーズ
 */
export const BattlePhaseSchema = z.enum([
  "command_select", // コマンド選択中
  "move_select", // 技選択中
  "item_select", // アイテム選択中
  "executing", // ターン実行中
  "result", // 結果表示中
  "capture_success", // 捕獲成功
]);

export type BattlePhase = z.infer<typeof BattlePhaseSchema>;

/**
 * バトル全体の状態
 * React stateで管理、DBには保存しない
 */
export const BattleStateSchema = z.object({
  phase: BattlePhaseSchema,
  playerGhost: BattleGhostStateSchema,
  enemyGhost: BattleGhostStateSchema,
  isPlayerTurn: z.boolean(),
  turnCount: z.number().int().min(1),
  messages: z.array(z.string()), // バトルメッセージキュー
});

export type BattleState = z.infer<typeof BattleStateSchema>;
