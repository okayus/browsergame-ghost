import type { MapData, TileType } from "@ghost-game/shared";

/**
 * マップグリッドのProps
 */
export interface MapGridProps {
  /** マップデータ */
  mapData: MapData;
  /** プレイヤーのX座標 */
  playerX: number;
  /** プレイヤーのY座標 */
  playerY: number;
  /** タイルサイズ（px） */
  tileSize?: number;
}

/**
 * タイルタイプに応じたスタイルを取得
 */
function getTileStyle(tileType: TileType): string {
  switch (tileType) {
    case "ground":
      return "bg-amber-700";
    case "grass":
      return "bg-green-600";
    case "wall":
      return "bg-stone-600";
    case "water":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
}

/**
 * タイルタイプに応じたアイコンを取得
 */
function getTileIcon(tileType: TileType): string {
  switch (tileType) {
    case "ground":
      return "";
    case "grass":
      return "🌿";
    case "wall":
      return "🪨";
    case "water":
      return "💧";
    default:
      return "";
  }
}

/**
 * マップグリッドコンポーネント
 *
 * CSS Gridでタイル配列を描画し、タイルタイプに応じた表示を行う
 */
export function MapGrid({ mapData, playerX, playerY, tileSize = 40 }: MapGridProps) {
  const { width, height, tiles } = mapData;

  return (
    <div
      className="relative inline-grid"
      style={{
        gridTemplateColumns: `repeat(${width}, ${tileSize}px)`,
        gridTemplateRows: `repeat(${height}, ${tileSize}px)`,
      }}
      data-testid="map-grid"
      data-width={width}
      data-height={height}
    >
      {tiles.map((row, y) =>
        row.map((tile, x) => {
          const isPlayerPosition = x === playerX && y === playerY;

          return (
            <div
              key={`tile-${x}-${y}`}
              className={`flex items-center justify-center border border-black/20 text-sm ${getTileStyle(tile.type)}`}
              style={{ width: tileSize, height: tileSize }}
              data-testid={`tile-${x}-${y}`}
              data-tile-type={tile.type}
              data-walkable={tile.walkable}
            >
              {isPlayerPosition ? (
                <span
                  className="z-10 text-lg drop-shadow-lg"
                  data-testid="player-marker"
                  role="img"
                  aria-label="Player"
                >
                  🧑
                </span>
              ) : (
                <span className="opacity-50">{getTileIcon(tile.type)}</span>
              )}
            </div>
          );
        }),
      )}
    </div>
  );
}
