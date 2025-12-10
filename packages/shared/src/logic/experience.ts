/**
 * 経験値計算の基本倍率
 */
export const BASE_EXP_MULTIPLIER = 10;

/**
 * 獲得経験値を計算する
 *
 * 計算式: 倒したゴーストのレベル × 基本倍率
 *
 * @param defeatedLevel 倒したゴーストのレベル
 * @returns 獲得経験値
 */
export function calculateExpGain(defeatedLevel: number): number {
  return Math.floor(defeatedLevel * BASE_EXP_MULTIPLIER);
}

/**
 * 次のレベルに必要な累計経験値を計算する
 *
 * 計算式: レベル^3 (シンプルな3乗式)
 * - Lv2: 8
 * - Lv5: 125
 * - Lv10: 1000
 * - Lv50: 125000
 *
 * @param level 目標レベル
 * @returns 累計必要経験値
 */
export function getExpForLevel(level: number): number {
  if (level <= 1) {
    return 0;
  }
  return Math.floor(level ** 3);
}

/**
 * 現在レベルから次のレベルアップに必要な経験値を計算する
 *
 * @param currentLevel 現在のレベル
 * @param currentExp 現在の累計経験値
 * @returns 次のレベルまでに必要な経験値
 */
export function getExpToNextLevel(currentLevel: number, currentExp: number): number {
  const nextLevelExp = getExpForLevel(currentLevel + 1);
  return Math.max(0, nextLevelExp - currentExp);
}

/**
 * 経験値からレベルを計算する
 *
 * @param totalExp 累計経験値
 * @param maxLevel 最大レベル（デフォルト: 100）
 * @returns 現在のレベル
 */
export function getLevelFromExp(totalExp: number, maxLevel = 100): number {
  let level = 1;
  while (level < maxLevel && getExpForLevel(level + 1) <= totalExp) {
    level++;
  }
  return level;
}

/**
 * 経験値を加算した結果を計算する
 *
 * @param currentLevel 現在のレベル
 * @param currentExp 現在の累計経験値
 * @param gainedExp 獲得した経験値
 * @param maxLevel 最大レベル（デフォルト: 100）
 * @returns 新しいレベルと経験値
 */
export function addExperience(
  currentLevel: number,
  currentExp: number,
  gainedExp: number,
  maxLevel = 100,
): { newLevel: number; newExp: number; leveledUp: boolean; levelsGained: number } {
  const newExp = currentExp + gainedExp;
  const newLevel = Math.min(getLevelFromExp(newExp, maxLevel), maxLevel);
  const leveledUp = newLevel > currentLevel;
  const levelsGained = newLevel - currentLevel;

  return {
    newLevel,
    newExp,
    leveledUp,
    levelsGained,
  };
}
