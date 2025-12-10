import type { MapData } from "@ghost-game/shared";
import { useCallback } from "react";
import type { Direction, EncounterResult } from "../../hooks/useMapState";
import { MapGrid } from "./MapGrid";

/**
 * マップ画面のProps
 */
export interface MapScreenProps {
  /** マップデータ */
  mapData: MapData;
  /** プレイヤーのX座標 */
  playerX: number;
  /** プレイヤーのY座標 */
  playerY: number;
  /** 移動処理 */
  onMove: (direction: Direction) => { success: boolean; encounter: EncounterResult | null };
  /** エンカウント発生時のコールバック */
  onEncounter: (encounter: EncounterResult) => void;
  /** キー入力ハンドラ（親から受け取る） */
  onKeyInput?: string;
}

/**
 * キー入力から方向を取得
 */
function getDirectionFromKey(key: string): Direction | null {
  switch (key) {
    case "w":
    case "W":
    case "ArrowUp":
      return "up";
    case "s":
    case "S":
    case "ArrowDown":
      return "down";
    case "a":
    case "A":
    case "ArrowLeft":
      return "left";
    case "d":
    case "D":
    case "ArrowRight":
      return "right";
    default:
      return null;
  }
}

/**
 * マップ画面コンポーネント
 *
 * - マップグリッドとプレイヤーキャラクターの表示
 * - WASDキー入力による移動処理
 * - プレイヤー位置の視覚的識別
 * - エンカウント発生時のバトル画面遷移
 */
export function MapScreen({
  mapData,
  playerX,
  playerY,
  onMove,
  onEncounter,
  onKeyInput,
}: MapScreenProps) {
  // キー入力を処理
  const handleKeyInput = useCallback(
    (key: string) => {
      const direction = getDirectionFromKey(key);
      if (!direction) return;

      const result = onMove(direction);
      if (result.encounter) {
        onEncounter(result.encounter);
      }
    },
    [onMove, onEncounter],
  );

  // 親からのキー入力を処理
  if (onKeyInput) {
    handleKeyInput(onKeyInput);
  }

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center bg-ghost-bg"
      data-testid="map-screen"
    >
      {/* マップ名 */}
      <div className="mb-4 text-xl font-bold text-ghost-text-bright" data-testid="map-name">
        {mapData.name}
      </div>

      {/* マップグリッド */}
      <div className="rounded-lg border-2 border-ghost-primary p-2">
        <MapGrid mapData={mapData} playerX={playerX} playerY={playerY} tileSize={40} />
      </div>

      {/* 操作説明 */}
      <div className="mt-4 text-sm text-ghost-text-muted" data-testid="controls-hint">
        <span className="mr-4">移動: WASD または 矢印キー</span>
        <span>メニュー: ESC</span>
      </div>

      {/* 座標表示（デバッグ用） */}
      <div className="mt-2 text-xs text-ghost-text-muted" data-testid="position-display">
        位置: ({playerX}, {playerY})
      </div>
    </div>
  );
}

/**
 * キー入力から方向を取得するヘルパー関数（外部公開）
 */
export { getDirectionFromKey };
