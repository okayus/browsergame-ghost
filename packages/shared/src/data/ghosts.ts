import { calculateMaxHp, calculateStats } from "../logic/levelUp";
import type { GhostSpecies, OwnedGhost, OwnedMove } from "../schemas";
import { getMoveById } from "./moves";

/**
 * スピリットパフ - ノーマルタイプの基本ゴースト
 * 出現率が高く、バランスの取れた能力値を持つ
 */
export const GHOST_SPIRITPUFF: GhostSpecies = {
  id: "spiritpuff",
  name: "スピリットパフ",
  type: "normal",
  baseStats: {
    hp: 45,
    attack: 40,
    defense: 35,
    speed: 45,
  },
  learnableMoves: [
    { level: 1, moveId: "tackle" },
    { level: 5, moveId: "scratch" },
    { level: 10, moveId: "quick-attack" },
  ],
  description: "ふわふわした体を持つ霊。好奇心旺盛で人懐っこい。",
  rarity: "common",
};

/**
 * ファイアリング - 炎タイプのゴースト
 * 攻撃力が高めだが防御が低い
 */
export const GHOST_FIRELING: GhostSpecies = {
  id: "fireling",
  name: "ファイアリング",
  type: "fire",
  baseStats: {
    hp: 40,
    attack: 55,
    defense: 30,
    speed: 50,
  },
  learnableMoves: [
    { level: 1, moveId: "tackle" },
    { level: 1, moveId: "ember" },
    { level: 8, moveId: "fire-spin" },
  ],
  description: "小さな炎を身にまとう霊。怒ると炎が大きくなる。",
  rarity: "uncommon",
};

/**
 * アクアスピリット - 水タイプのゴースト
 * HPと防御が高め
 */
export const GHOST_AQUASPIRIT: GhostSpecies = {
  id: "aquaspirit",
  name: "アクアスピリット",
  type: "water",
  baseStats: {
    hp: 55,
    attack: 40,
    defense: 45,
    speed: 35,
  },
  learnableMoves: [
    { level: 1, moveId: "tackle" },
    { level: 1, moveId: "bubble" },
    { level: 7, moveId: "water-gun" },
  ],
  description: "水滴のような体を持つ霊。雨の日に活発になる。",
  rarity: "uncommon",
};

/**
 * リーフシェイド - 草タイプのゴースト
 * バランス型で素早さがやや高い
 */
export const GHOST_LEAFSHADE: GhostSpecies = {
  id: "leafshade",
  name: "リーフシェイド",
  type: "grass",
  baseStats: {
    hp: 45,
    attack: 45,
    defense: 40,
    speed: 45,
  },
  learnableMoves: [
    { level: 1, moveId: "tackle" },
    { level: 1, moveId: "absorb" },
    { level: 6, moveId: "vine-whip" },
  ],
  description: "木の葉に宿る霊。森の中で静かに暮らしている。",
  rarity: "uncommon",
};

/**
 * 全ゴースト種族マスタデータ
 */
export const ALL_GHOST_SPECIES: GhostSpecies[] = [
  GHOST_SPIRITPUFF,
  GHOST_FIRELING,
  GHOST_AQUASPIRIT,
  GHOST_LEAFSHADE,
];

/**
 * ゴースト種族IDからデータへのMap（O(1)ルックアップ用）
 */
export const GHOST_SPECIES_MAP: ReadonlyMap<string, GhostSpecies> = new Map(
  ALL_GHOST_SPECIES.map((species) => [species.id, species]),
);

/**
 * 種族IDからゴースト種族データを取得
 */
export function getGhostSpeciesById(speciesId: string): GhostSpecies | undefined {
  return GHOST_SPECIES_MAP.get(speciesId);
}

/**
 * ユニークIDを生成（簡易版）
 */
function generateUniqueId(): string {
  return `ghost-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 指定レベルで習得している技を取得
 */
function getMovesAtLevel(species: GhostSpecies, level: number): OwnedMove[] {
  // レベル以下の習得可能技を取得（最大4つ）
  const learnedMoves = species.learnableMoves
    .filter((lm) => lm.level <= level)
    .sort((a, b) => b.level - a.level) // 高レベルで習得した技を優先
    .slice(0, 4);

  return learnedMoves.map((lm) => {
    const move = getMoveById(lm.moveId);
    return {
      moveId: lm.moveId,
      currentPP: move?.pp ?? 10,
      maxPP: move?.pp ?? 10,
    };
  });
}

/**
 * 野生ゴーストを生成する
 *
 * @param speciesId ゴースト種族ID
 * @param level ゴーストのレベル
 * @returns 生成されたOwnedGhost、または種族が見つからない場合はnull
 */
export function generateWildGhost(speciesId: string, level: number): OwnedGhost | null {
  const species = getGhostSpeciesById(speciesId);
  if (!species) {
    return null;
  }

  const stats = calculateStats(species.baseStats, level);
  const maxHp = calculateMaxHp(species.baseStats.hp, level);
  const moves = getMovesAtLevel(species, level);

  return {
    id: generateUniqueId(),
    speciesId: species.id,
    level,
    experience: 0,
    currentHp: maxHp,
    maxHp,
    stats,
    moves,
  };
}
