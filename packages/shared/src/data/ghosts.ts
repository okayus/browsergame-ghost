import type { GhostSpecies } from "../schemas";

/**
 * ゴースト種族マスタデータ
 * 各タイプ1体以上、計6種類以上を定義
 */
export const GHOST_SPECIES: Record<string, GhostSpecies> = {
  // 炎タイプ
  fireling: {
    id: "fireling",
    name: "ヒダマリン",
    type: "fire",
    baseStats: {
      hp: 45,
      attack: 60,
      defense: 40,
      speed: 70,
    },
    learnableMoves: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "ember" },
      { level: 8, moveId: "flameCharge" },
      { level: 15, moveId: "scratch" },
      { level: 22, moveId: "flamethrower" },
    ],
    description: "体内で常に小さな炎が燃えている。寒い場所が苦手。",
    rarity: "common",
  },

  // 水タイプ
  aquaspirit: {
    id: "aquaspirit",
    name: "アクアゴースト",
    type: "water",
    baseStats: {
      hp: 55,
      attack: 50,
      defense: 55,
      speed: 55,
    },
    learnableMoves: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "bubble" },
      { level: 7, moveId: "waterGun" },
      { level: 14, moveId: "scratch" },
      { level: 25, moveId: "hydroPump" },
    ],
    description: "水辺に現れる霊体。雨の日は特に活発になる。",
    rarity: "common",
  },

  // 草タイプ
  leafshade: {
    id: "leafshade",
    name: "リーフシェイド",
    type: "grass",
    baseStats: {
      hp: 50,
      attack: 55,
      defense: 60,
      speed: 50,
    },
    learnableMoves: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "vineWhip" },
      { level: 9, moveId: "razorLeaf" },
      { level: 16, moveId: "scratch" },
      { level: 28, moveId: "solarBeam" },
    ],
    description: "森の中で葉っぱに擬態している。光合成でエネルギーを得る。",
    rarity: "common",
  },

  // 電気タイプ
  sparkghost: {
    id: "sparkghost",
    name: "スパークゴースト",
    type: "electric",
    baseStats: {
      hp: 40,
      attack: 55,
      defense: 35,
      speed: 90,
    },
    learnableMoves: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "thunderShock" },
      { level: 6, moveId: "spark" },
      { level: 12, moveId: "scratch" },
      { level: 20, moveId: "thunderbolt" },
    ],
    description: "電化製品に取り憑くことが多い。雷雨の日に活発化する。",
    rarity: "uncommon",
  },

  // 霊タイプ
  shadowwisp: {
    id: "shadowwisp",
    name: "シャドウウィスプ",
    type: "ghost",
    baseStats: {
      hp: 50,
      attack: 70,
      defense: 45,
      speed: 65,
    },
    learnableMoves: [
      { level: 1, moveId: "lick" },
      { level: 1, moveId: "tackle" },
      { level: 10, moveId: "shadowBall" },
      { level: 18, moveId: "scratch" },
      { level: 30, moveId: "phantomForce" },
    ],
    description: "暗闘に潜む謎多き霊体。実体を持たず壁をすり抜ける。",
    rarity: "rare",
  },

  // ノーマルタイプ
  spiritpuff: {
    id: "spiritpuff",
    name: "スピリパフ",
    type: "normal",
    baseStats: {
      hp: 60,
      attack: 45,
      defense: 50,
      speed: 55,
    },
    learnableMoves: [
      { level: 1, moveId: "tackle" },
      { level: 1, moveId: "scratch" },
      { level: 5, moveId: "slam" },
    ],
    description: "ふわふわした見た目の親しみやすいゴースト。初心者向け。",
    rarity: "common",
  },
};

/**
 * ゴースト種族IDからデータを取得する
 */
export function getGhostSpeciesById(speciesId: string): GhostSpecies | undefined {
  return GHOST_SPECIES[speciesId];
}

/**
 * 全てのゴースト種族IDを取得する
 */
export function getAllGhostSpeciesIds(): string[] {
  return Object.keys(GHOST_SPECIES);
}

/**
 * レアリティでゴースト種族をフィルタリングする
 */
export function getGhostSpeciesByRarity(
  rarity: "common" | "uncommon" | "rare" | "legendary",
): GhostSpecies[] {
  return Object.values(GHOST_SPECIES).filter((species) => species.rarity === rarity);
}
