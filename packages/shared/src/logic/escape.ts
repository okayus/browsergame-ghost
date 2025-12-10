/**
 * 逃走判定結果
 */
export interface EscapeResult {
  /** 逃走成功したか */
  success: boolean;
  /** 計算された成功率（0-1） */
  escapeRate: number;
}

/**
 * 基本逃走成功率（素早さが同じ場合）
 */
export const BASE_ESCAPE_RATE = 0.5;

/**
 * 最小逃走成功率
 */
export const MIN_ESCAPE_RATE = 0.1;

/**
 * 最大逃走成功率
 */
export const MAX_ESCAPE_RATE = 0.9;

/**
 * 逃走試行回数によるボーナス（1回ごとに加算）
 */
export const ESCAPE_ATTEMPT_BONUS = 0.1;

/**
 * 逃走成功率を計算する
 *
 * 計算式:
 * 基本成功率 = 0.5 + (自分の素早さ - 相手の素早さ) / 100
 * 最終成功率 = 基本成功率 + (逃走試行回数 × 0.1)
 * 成功率は10%〜90%の範囲に制限
 *
 * @param mySpeed 自分のゴーストの素早さ
 * @param enemySpeed 敵ゴーストの素早さ
 * @param escapeAttempts これまでの逃走試行回数（デフォルト: 0）
 * @returns 逃走成功率（0-1）
 */
export function calculateEscapeRate(
  mySpeed: number,
  enemySpeed: number,
  escapeAttempts = 0,
): number {
  // 素早さの差による補正
  const speedDifference = mySpeed - enemySpeed;
  const speedBonus = speedDifference / 100;

  // 逃走試行回数によるボーナス
  const attemptBonus = escapeAttempts * ESCAPE_ATTEMPT_BONUS;

  // 基本成功率 + 各種ボーナス
  let escapeRate = BASE_ESCAPE_RATE + speedBonus + attemptBonus;

  // 成功率を範囲内に制限
  escapeRate = Math.max(MIN_ESCAPE_RATE, Math.min(MAX_ESCAPE_RATE, escapeRate));

  return escapeRate;
}

/**
 * 逃走を試みる
 *
 * @param mySpeed 自分のゴーストの素早さ
 * @param enemySpeed 敵ゴーストの素早さ
 * @param escapeAttempts これまでの逃走試行回数（デフォルト: 0）
 * @param randomValue 乱数値（0-1、テスト用に外部から注入可能）
 * @returns 逃走判定結果
 */
export function attemptEscape(
  mySpeed: number,
  enemySpeed: number,
  escapeAttempts = 0,
  randomValue?: number,
): EscapeResult {
  const escapeRate = calculateEscapeRate(mySpeed, enemySpeed, escapeAttempts);
  const roll = randomValue ?? Math.random();

  return {
    success: roll < escapeRate,
    escapeRate,
  };
}
