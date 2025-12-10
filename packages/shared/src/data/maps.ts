import type { MapData, MapTile } from "../schemas";

/**
 * タイルショートカット
 */
const G: MapTile = { type: "ground", walkable: true, encounterRate: 0 };
const R: MapTile = { type: "grass", walkable: true, encounterRate: 0.15 };
const W: MapTile = { type: "wall", walkable: false, encounterRate: 0 };
const A: MapTile = { type: "water", walkable: false, encounterRate: 0 };

/**
 * 初期マップ: はじまりの森
 * 16x12のグリッドマップ
 *
 * 凡例:
 * W = 壁（木や岩）
 * G = 地面（移動可能）
 * R = 草むら（エンカウント可能）
 * A = 水（移動不可）
 */
export const MAP_001: MapData = {
  id: "map-001",
  name: "はじまりの森",
  width: 16,
  height: 12,
  tiles: [
    // y=0 (上端)
    [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
    // y=1
    [W, G, G, G, R, R, G, G, G, G, R, R, R, G, G, W],
    // y=2
    [W, G, G, R, R, R, R, G, G, R, R, R, R, G, G, W],
    // y=3
    [W, G, G, R, R, R, G, G, G, G, R, R, G, G, G, W],
    // y=4
    [W, G, G, G, G, G, G, G, G, G, G, G, G, A, A, W],
    // y=5 (プレイヤー初期位置 x=5)
    [W, G, G, G, G, G, G, G, G, G, G, G, G, A, A, W],
    // y=6
    [W, G, G, G, G, G, G, G, G, G, G, G, G, A, A, W],
    // y=7
    [W, G, R, R, G, G, G, G, G, G, R, R, G, G, G, W],
    // y=8
    [W, G, R, R, R, G, G, G, G, R, R, R, R, G, G, W],
    // y=9
    [W, G, R, R, R, R, G, G, R, R, R, R, R, G, G, W],
    // y=10
    [W, G, G, R, R, G, G, G, G, R, R, G, G, G, G, W],
    // y=11 (下端)
    [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
  ],
  encounters: [
    { speciesId: "spiritpuff", weight: 40, minLevel: 2, maxLevel: 5 },
    { speciesId: "fireling", weight: 20, minLevel: 3, maxLevel: 5 },
    { speciesId: "aquaspirit", weight: 20, minLevel: 3, maxLevel: 5 },
    { speciesId: "leafshade", weight: 20, minLevel: 3, maxLevel: 5 },
  ],
};

/**
 * 全マップデータ
 */
export const ALL_MAPS: MapData[] = [MAP_001];

/**
 * マップIDからマップデータを取得
 */
export function getMapById(mapId: string): MapData | undefined {
  return ALL_MAPS.find((map) => map.id === mapId);
}
