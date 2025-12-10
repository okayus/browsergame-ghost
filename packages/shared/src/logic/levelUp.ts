import type { BaseStats, LearnableMove } from "../schemas";

/**
 * レベルアップ結果
 */
export interface LevelUpResult {
  /** 新しいレベル */
  newLevel: number;
  /** 新しい能力値 */
  newStats: BaseStats;
  /** 新しい最大HP */
  newMaxHp: number;
  /** 習得可能になった技のIDリスト */
  learnableMoveIds: string[];
}

/**
 * レベルに基づいて能力値を計算する
 *
 * 計算式（ポケモン風の簡略版）:
 * HP = floor((2 * 種族値 * レベル) / 100) + レベル + 10
 * その他 = floor((2 * 種族値 * レベル) / 100) + 5
 *
 * @param baseStats 種族の基礎能力値
 * @param level 現在のレベル
 * @returns 計算された能力値
 */
export function calculateStats(baseStats: BaseStats, level: number): BaseStats {
  const calcStat = (base: number): number => {
    return Math.floor((2 * base * level) / 100) + 5;
  };

  const calcHp = (base: number): number => {
    return Math.floor((2 * base * level) / 100) + level + 10;
  };

  return {
    hp: calcHp(baseStats.hp),
    attack: calcStat(baseStats.attack),
    defense: calcStat(baseStats.defense),
    speed: calcStat(baseStats.speed),
  };
}

/**
 * 最大HPを計算する
 *
 * @param baseHp 種族の基礎HP
 * @param level 現在のレベル
 * @returns 最大HP
 */
export function calculateMaxHp(baseHp: number, level: number): number {
  return Math.floor((2 * baseHp * level) / 100) + level + 10;
}

/**
 * 指定レベルで習得可能な技を取得する
 *
 * @param learnableMoves 習得可能技リスト
 * @param fromLevel 開始レベル（このレベルより上）
 * @param toLevel 終了レベル（このレベル以下）
 * @returns 習得可能な技IDのリスト
 */
export function getNewLearnableMoves(
  learnableMoves: LearnableMove[],
  fromLevel: number,
  toLevel: number,
): string[] {
  return learnableMoves
    .filter((move) => move.level > fromLevel && move.level <= toLevel)
    .sort((a, b) => a.level - b.level)
    .map((move) => move.moveId);
}

/**
 * レベルアップ処理を行う
 *
 * @param oldLevel 元のレベル
 * @param newLevel 新しいレベル
 * @param baseStats 種族の基礎能力値
 * @param learnableMoves 習得可能技リスト
 * @returns レベルアップ結果
 */
export function processLevelUp(
  oldLevel: number,
  newLevel: number,
  baseStats: BaseStats,
  learnableMoves: LearnableMove[],
): LevelUpResult {
  const newStats = calculateStats(baseStats, newLevel);
  const newMaxHp = calculateMaxHp(baseStats.hp, newLevel);
  const learnableMoveIds = getNewLearnableMoves(learnableMoves, oldLevel, newLevel);

  return {
    newLevel,
    newStats,
    newMaxHp,
    learnableMoveIds,
  };
}

/**
 * レベル1のゴーストの初期能力値を計算する
 *
 * @param baseStats 種族の基礎能力値
 * @returns 初期能力値
 */
export function getInitialStats(baseStats: BaseStats): BaseStats {
  return calculateStats(baseStats, 1);
}

/**
 * レベル1のゴーストの初期最大HPを計算する
 *
 * @param baseHp 種族の基礎HP
 * @returns 初期最大HP
 */
export function getInitialMaxHp(baseHp: number): number {
  return calculateMaxHp(baseHp, 1);
}
