/**
 * 捕獲判定結果
 */
export interface CaptureResult {
  /** 捕獲成功したか */
  success: boolean;
  /** 計算された成功率（0-1） */
  captureRate: number;
}

/**
 * 基本捕獲率（HP満タン時）
 */
export const BASE_CAPTURE_RATE = 0.1;

/**
 * HP減少による最大ボーナス（HP0%時に加算）
 */
export const HP_BONUS_MAX = 0.4;

/**
 * 最小捕獲率
 */
export const MIN_CAPTURE_RATE = 0.05;

/**
 * 最大捕獲率（マスターボール以外）
 */
export const MAX_CAPTURE_RATE = 0.9;

/**
 * 捕獲成功率を計算する
 *
 * 計算式:
 * 基本成功率 = 0.1 + (1 - 残りHP率) × 0.4 + アイテムボーナス / 100
 * - HPが減るほど捕獲しやすくなる
 * - アイテムボーナスは%単位で加算
 *
 * @param currentHp 対象ゴーストの現在HP
 * @param maxHp 対象ゴーストの最大HP
 * @param itemBonus 捕獲アイテムのボーナス値（%）- ゴーストボール: 0, スーパーボール: 20, etc.
 * @returns 捕獲成功率（0-1）
 */
export function calculateCaptureRate(currentHp: number, maxHp: number, itemBonus = 0): number {
  // マスターボール（itemBonus = 100）は確定捕獲
  if (itemBonus >= 100) {
    return 1.0;
  }

  // HP残量率（0-1）
  const hpRatio = Math.max(0, Math.min(1, currentHp / maxHp));

  // HPによるボーナス（HPが少ないほど高い）
  const hpBonus = (1 - hpRatio) * HP_BONUS_MAX;

  // アイテムボーナス（%を小数に変換）
  const itemBonusRate = itemBonus / 100;

  // 最終成功率
  let captureRate = BASE_CAPTURE_RATE + hpBonus + itemBonusRate;

  // 範囲制限
  captureRate = Math.max(MIN_CAPTURE_RATE, Math.min(MAX_CAPTURE_RATE, captureRate));

  return captureRate;
}

/**
 * 捕獲を試みる
 *
 * @param currentHp 対象ゴーストの現在HP
 * @param maxHp 対象ゴーストの最大HP
 * @param itemBonus 捕獲アイテムのボーナス値（%）
 * @param randomValue 乱数値（0-1、テスト用に外部から注入可能）
 * @returns 捕獲判定結果
 */
export function attemptCapture(
  currentHp: number,
  maxHp: number,
  itemBonus = 0,
  randomValue?: number,
): CaptureResult {
  const captureRate = calculateCaptureRate(currentHp, maxHp, itemBonus);
  const roll = randomValue ?? Math.random();

  return {
    success: roll < captureRate,
    captureRate,
  };
}
