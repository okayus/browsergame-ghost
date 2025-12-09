import type { Move } from "../schemas";

/**
 * 技マスタデータ
 * 各タイプの技を複数定義
 */
export const MOVES: Record<string, Move> = {
  // ノーマルタイプの技
  tackle: {
    id: "tackle",
    name: "たいあたり",
    type: "normal",
    power: 40,
    accuracy: 100,
    pp: 35,
    description: "体当たりで攻撃する基本技",
  },
  scratch: {
    id: "scratch",
    name: "ひっかく",
    type: "normal",
    power: 40,
    accuracy: 100,
    pp: 35,
    description: "鋭い爪でひっかく",
  },
  slam: {
    id: "slam",
    name: "たたきつける",
    type: "normal",
    power: 80,
    accuracy: 75,
    pp: 20,
    description: "体全体で叩きつける強力な技",
  },

  // 炎タイプの技
  ember: {
    id: "ember",
    name: "ひのこ",
    type: "fire",
    power: 40,
    accuracy: 100,
    pp: 25,
    description: "小さな炎を放つ基本技",
  },
  flameCharge: {
    id: "flameCharge",
    name: "ニトロチャージ",
    type: "fire",
    power: 50,
    accuracy: 100,
    pp: 20,
    description: "炎をまといながら突進する",
  },
  flamethrower: {
    id: "flamethrower",
    name: "かえんほうしゃ",
    type: "fire",
    power: 90,
    accuracy: 100,
    pp: 15,
    description: "激しい炎を放射する強力な技",
  },

  // 水タイプの技
  bubble: {
    id: "bubble",
    name: "あわ",
    type: "water",
    power: 40,
    accuracy: 100,
    pp: 30,
    description: "泡を飛ばして攻撃する基本技",
  },
  waterGun: {
    id: "waterGun",
    name: "みずでっぽう",
    type: "water",
    power: 40,
    accuracy: 100,
    pp: 25,
    description: "水を勢いよく発射する",
  },
  hydroPump: {
    id: "hydroPump",
    name: "ハイドロポンプ",
    type: "water",
    power: 110,
    accuracy: 80,
    pp: 5,
    description: "超高圧の水流で攻撃する必殺技",
  },

  // 草タイプの技
  vineWhip: {
    id: "vineWhip",
    name: "つるのムチ",
    type: "grass",
    power: 45,
    accuracy: 100,
    pp: 25,
    description: "ツルで叩いて攻撃する",
  },
  razorLeaf: {
    id: "razorLeaf",
    name: "はっぱカッター",
    type: "grass",
    power: 55,
    accuracy: 95,
    pp: 25,
    description: "鋭い葉っぱを飛ばして攻撃",
  },
  solarBeam: {
    id: "solarBeam",
    name: "ソーラービーム",
    type: "grass",
    power: 120,
    accuracy: 100,
    pp: 10,
    description: "太陽光を集めて放つ強力な光線",
  },

  // 電気タイプの技
  thunderShock: {
    id: "thunderShock",
    name: "でんきショック",
    type: "electric",
    power: 40,
    accuracy: 100,
    pp: 30,
    description: "電気を放って攻撃する基本技",
  },
  spark: {
    id: "spark",
    name: "スパーク",
    type: "electric",
    power: 65,
    accuracy: 100,
    pp: 20,
    description: "電気をまといながら体当たり",
  },
  thunderbolt: {
    id: "thunderbolt",
    name: "10まんボルト",
    type: "electric",
    power: 90,
    accuracy: 100,
    pp: 15,
    description: "強力な電撃を浴びせる",
  },

  // 霊タイプの技
  lick: {
    id: "lick",
    name: "したでなめる",
    type: "ghost",
    power: 30,
    accuracy: 100,
    pp: 30,
    description: "長い舌で舐めて攻撃する",
  },
  shadowBall: {
    id: "shadowBall",
    name: "シャドーボール",
    type: "ghost",
    power: 80,
    accuracy: 100,
    pp: 15,
    description: "影の塊を投げつける",
  },
  phantomForce: {
    id: "phantomForce",
    name: "ゴーストダイブ",
    type: "ghost",
    power: 90,
    accuracy: 100,
    pp: 10,
    description: "異次元から攻撃する強力な技",
  },
};

/**
 * 技IDから技データを取得する
 */
export function getMoveById(moveId: string): Move | undefined {
  return MOVES[moveId];
}

/**
 * 全ての技IDを取得する
 */
export function getAllMoveIds(): string[] {
  return Object.keys(MOVES);
}
