import type { GhostType } from "../schemas";
import { type EffectivenessMultiplier, getTypeEffectiveness } from "./typeEffectiveness";

/**
 * ダメージ計算結果
 */
export interface DamageResult {
  /** 最終ダメージ値 */
  damage: number;
  /** クリティカルヒットしたか */
  isCritical: boolean;
  /** タイプ相性倍率 */
  effectiveness: EffectivenessMultiplier;
}

/**
 * ダメージ計算に必要なパラメータ
 */
export interface DamageParams {
  /** 技の威力 */
  movePower: number;
  /** 技のタイプ */
  moveType: GhostType;
  /** 攻撃側の攻撃力 */
  attackerAttack: number;
  /** 攻撃側のタイプ */
  attackerType: GhostType;
  /** 攻撃側のレベル */
  attackerLevel: number;
  /** 防御側の防御力 */
  defenderDefense: number;
  /** 防御側のタイプ */
  defenderType: GhostType;
}

/**
 * クリティカルヒット率（デフォルト: 1/16 ≒ 6.25%）
 */
export const CRITICAL_HIT_RATE = 1 / 16;

/**
 * クリティカルヒット時のダメージ倍率
 */
export const CRITICAL_MULTIPLIER = 1.5;

/**
 * タイプ一致ボーナス（STAB: Same Type Attack Bonus）
 */
export const STAB_MULTIPLIER = 1.5;

/**
 * 最小ダメージ（0にはならない）
 */
export const MIN_DAMAGE = 1;

/**
 * クリティカルヒット判定
 * @param randomValue 0-1の乱数値（テスト用に外部から注入可能）
 * @returns クリティカルかどうか
 */
export function isCriticalHit(randomValue?: number): boolean {
  const roll = randomValue ?? Math.random();
  return roll < CRITICAL_HIT_RATE;
}

/**
 * タイプ一致ボーナスを計算
 * @param moveType 技のタイプ
 * @param attackerType 攻撃側のタイプ
 * @returns タイプ一致なら1.5、そうでなければ1.0
 */
export function getStabBonus(moveType: GhostType, attackerType: GhostType): number {
  return moveType === attackerType ? STAB_MULTIPLIER : 1.0;
}

/**
 * 基本ダメージを計算する
 * ポケモンの計算式を簡略化したもの:
 * ダメージ = ((2 * レベル / 5 + 2) * 威力 * 攻撃 / 防御) / 50 + 2
 *
 * @param level 攻撃側のレベル
 * @param power 技の威力
 * @param attack 攻撃側の攻撃力
 * @param defense 防御側の防御力
 * @returns 基本ダメージ値
 */
export function calculateBaseDamage(
  level: number,
  power: number,
  attack: number,
  defense: number,
): number {
  const levelFactor = (2 * level) / 5 + 2;
  const baseDamage = (levelFactor * power * attack) / defense / 50 + 2;
  return Math.floor(baseDamage);
}

/**
 * 最終ダメージを計算する
 *
 * 計算順序:
 * 1. 基本ダメージ = ((2*Lv/5+2) * 威力 * 攻撃 / 防御) / 50 + 2
 * 2. タイプ一致ボーナス (STAB) を適用
 * 3. タイプ相性倍率を適用
 * 4. クリティカルヒット倍率を適用
 * 5. 最小ダメージ保証（効果なしの場合は0）
 *
 * @param params ダメージ計算パラメータ
 * @param criticalRoll クリティカル判定用の乱数（テスト用）
 * @returns ダメージ計算結果
 */
export function calculateDamage(params: DamageParams, criticalRoll?: number): DamageResult {
  const {
    movePower,
    moveType,
    attackerAttack,
    attackerType,
    attackerLevel,
    defenderDefense,
    defenderType,
  } = params;

  // タイプ相性を取得
  const effectiveness = getTypeEffectiveness(moveType, defenderType);

  // 効果なしの場合は即座に0ダメージを返す
  if (effectiveness === 0) {
    return {
      damage: 0,
      isCritical: false,
      effectiveness,
    };
  }

  // 基本ダメージを計算
  let damage = calculateBaseDamage(attackerLevel, movePower, attackerAttack, defenderDefense);

  // タイプ一致ボーナス (STAB) を適用
  const stabBonus = getStabBonus(moveType, attackerType);
  damage = Math.floor(damage * stabBonus);

  // タイプ相性倍率を適用
  damage = Math.floor(damage * effectiveness);

  // クリティカルヒット判定
  const isCritical = isCriticalHit(criticalRoll);
  if (isCritical) {
    damage = Math.floor(damage * CRITICAL_MULTIPLIER);
  }

  // 最小ダメージ保証
  damage = Math.max(damage, MIN_DAMAGE);

  return {
    damage,
    isCritical,
    effectiveness,
  };
}
