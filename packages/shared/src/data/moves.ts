import type { Move } from "../schemas";

/**
 * ノーマル技
 */
export const MOVE_TACKLE: Move = {
  id: "tackle",
  name: "たいあたり",
  type: "normal",
  power: 40,
  accuracy: 100,
  pp: 35,
  description: "相手にぶつかって攻撃する。",
};

export const MOVE_SCRATCH: Move = {
  id: "scratch",
  name: "ひっかく",
  type: "normal",
  power: 40,
  accuracy: 100,
  pp: 35,
  description: "鋭い爪で相手を引っかく。",
};

export const MOVE_QUICK_ATTACK: Move = {
  id: "quick-attack",
  name: "でんこうせっか",
  type: "normal",
  power: 40,
  accuracy: 100,
  pp: 30,
  description: "素早く攻撃して必ず先制する。",
};

/**
 * 炎技
 */
export const MOVE_EMBER: Move = {
  id: "ember",
  name: "ひのこ",
  type: "fire",
  power: 40,
  accuracy: 100,
  pp: 25,
  description: "小さな炎を飛ばして攻撃する。",
};

export const MOVE_FIRE_SPIN: Move = {
  id: "fire-spin",
  name: "ほのおのうず",
  type: "fire",
  power: 35,
  accuracy: 85,
  pp: 15,
  description: "炎の渦で相手を包み込む。",
};

/**
 * 水技
 */
export const MOVE_WATER_GUN: Move = {
  id: "water-gun",
  name: "みずでっぽう",
  type: "water",
  power: 40,
  accuracy: 100,
  pp: 25,
  description: "水を勢いよく発射して攻撃する。",
};

export const MOVE_BUBBLE: Move = {
  id: "bubble",
  name: "あわ",
  type: "water",
  power: 40,
  accuracy: 100,
  pp: 30,
  description: "泡を飛ばして攻撃する。",
};

/**
 * 草技
 */
export const MOVE_VINE_WHIP: Move = {
  id: "vine-whip",
  name: "つるのムチ",
  type: "grass",
  power: 45,
  accuracy: 100,
  pp: 25,
  description: "つるで相手をムチのように叩く。",
};

export const MOVE_ABSORB: Move = {
  id: "absorb",
  name: "すいとる",
  type: "grass",
  power: 20,
  accuracy: 100,
  pp: 25,
  description: "相手の養分を吸い取る。",
};

/**
 * 電気技
 */
export const MOVE_THUNDER_SHOCK: Move = {
  id: "thunder-shock",
  name: "でんきショック",
  type: "electric",
  power: 40,
  accuracy: 100,
  pp: 30,
  description: "電気を浴びせて攻撃する。",
};

/**
 * 霊技
 */
export const MOVE_LICK: Move = {
  id: "lick",
  name: "したでなめる",
  type: "ghost",
  power: 30,
  accuracy: 100,
  pp: 30,
  description: "舌で相手をなめて攻撃する。",
};

export const MOVE_NIGHT_SHADE: Move = {
  id: "night-shade",
  name: "ナイトヘッド",
  type: "ghost",
  power: 40,
  accuracy: 100,
  pp: 15,
  description: "恐ろしい幻影を見せて攻撃する。",
};

/**
 * 全技マスタデータ
 */
export const ALL_MOVES: Move[] = [
  MOVE_TACKLE,
  MOVE_SCRATCH,
  MOVE_QUICK_ATTACK,
  MOVE_EMBER,
  MOVE_FIRE_SPIN,
  MOVE_WATER_GUN,
  MOVE_BUBBLE,
  MOVE_VINE_WHIP,
  MOVE_ABSORB,
  MOVE_THUNDER_SHOCK,
  MOVE_LICK,
  MOVE_NIGHT_SHADE,
];

/**
 * 技IDから技データを取得
 */
export function getMoveById(moveId: string): Move | undefined {
  return ALL_MOVES.find((move) => move.id === moveId);
}
