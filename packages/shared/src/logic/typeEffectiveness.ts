import type { GhostType } from "../schemas";

/**
 * タイプ相性倍率
 * 2.0: 効果抜群
 * 1.0: 通常
 * 0.5: 今ひとつ
 * 0.0: 効果なし
 */
export type EffectivenessMultiplier = 0 | 0.5 | 1 | 2;

/**
 * タイプ相性表
 * TYPE_CHART[攻撃側タイプ][防御側タイプ] = 倍率
 *
 * 相性設計:
 * - fire > grass (炎は草を燃やす)
 * - water > fire (水は炎を消す)
 * - grass > water (草は水を吸収)
 * - electric > water (電気は水に効く)
 * - ghost > ghost (霊は霊に効く)
 * - normal ↔ ghost (互いに効果なし)
 */
export const TYPE_CHART: Record<GhostType, Record<GhostType, EffectivenessMultiplier>> = {
  fire: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    electric: 1,
    ghost: 1,
    normal: 1,
  },
  water: {
    fire: 2,
    water: 0.5,
    grass: 0.5,
    electric: 1,
    ghost: 1,
    normal: 1,
  },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    electric: 1,
    ghost: 1,
    normal: 1,
  },
  electric: {
    fire: 1,
    water: 2,
    grass: 0.5,
    electric: 0.5,
    ghost: 1,
    normal: 1,
  },
  ghost: {
    fire: 1,
    water: 1,
    grass: 1,
    electric: 1,
    ghost: 2,
    normal: 0,
  },
  normal: {
    fire: 1,
    water: 1,
    grass: 1,
    electric: 1,
    ghost: 0,
    normal: 1,
  },
};

/**
 * タイプ相性倍率を取得する
 * @param attackType 攻撃側の技タイプ
 * @param defenseType 防御側のゴーストタイプ
 * @returns 相性倍率 (0, 0.5, 1, 2)
 */
export function getTypeEffectiveness(
  attackType: GhostType,
  defenseType: GhostType,
): EffectivenessMultiplier {
  return TYPE_CHART[attackType][defenseType];
}

/**
 * 相性メッセージを取得する
 * @param multiplier 相性倍率
 * @returns メッセージ文字列（1.0の場合は空文字）
 */
export function getEffectivenessMessage(multiplier: EffectivenessMultiplier): string {
  switch (multiplier) {
    case 2:
      return "効果は抜群だ！";
    case 0.5:
      return "効果は今ひとつのようだ...";
    case 0:
      return "効果がないようだ...";
    default:
      return "";
  }
}

/**
 * タイプの日本語名を取得する
 */
export function getTypeNameJa(type: GhostType): string {
  const names: Record<GhostType, string> = {
    fire: "ほのお",
    water: "みず",
    grass: "くさ",
    electric: "でんき",
    ghost: "ゴースト",
    normal: "ノーマル",
  };
  return names[type];
}
