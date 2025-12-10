import type { MapData, MapTile, PlayerPosition } from "@ghost-game/shared";
import { useCallback, useState } from "react";

/**
 * 移動方向
 */
export type Direction = "up" | "down" | "left" | "right";

/**
 * エンカウント結果
 */
export interface EncounterResult {
  /** エンカウントが発生したか */
  occurred: boolean;
  /** エンカウントしたゴースト種族ID */
  speciesId: string | null;
  /** 野生ゴーストのレベル */
  level: number | null;
}

/**
 * 移動結果
 */
export interface MoveResult {
  /** 移動が成功したか */
  success: boolean;
  /** 新しい位置 */
  newPosition: PlayerPosition;
  /** エンカウント結果（移動成功時のみ） */
  encounter: EncounterResult | null;
}

/**
 * マップ状態
 */
export interface MapState {
  /** 現在のマップデータ */
  currentMap: MapData | null;
  /** プレイヤーの現在位置 */
  position: PlayerPosition;
}

/**
 * マップ状態管理フックの戻り値
 */
export interface UseMapStateReturn {
  /** 現在の状態 */
  state: MapState;
  /** マップを設定する */
  setMap: (map: MapData) => void;
  /** プレイヤーを移動させる（方向指定） */
  move: (direction: Direction, randomValue?: number) => MoveResult;
  /** プレイヤーの位置を直接設定する */
  setPosition: (position: PlayerPosition) => void;
  /** 指定位置が移動可能かチェックする */
  canMoveTo: (x: number, y: number) => boolean;
  /** 指定位置のタイル情報を取得する */
  getTileAt: (x: number, y: number) => MapTile | null;
  /** 状態をリセットする */
  reset: () => void;
}

/**
 * 初期状態
 */
const initialState: MapState = {
  currentMap: null,
  position: { mapId: "", x: 0, y: 0 },
};

/**
 * 方向から移動量を計算
 */
function getDirectionDelta(direction: Direction): { dx: number; dy: number } {
  switch (direction) {
    case "up":
      return { dx: 0, dy: -1 };
    case "down":
      return { dx: 0, dy: 1 };
    case "left":
      return { dx: -1, dy: 0 };
    case "right":
      return { dx: 1, dy: 0 };
  }
}

/**
 * エンカウント判定を行う
 * @param tile 現在のタイル
 * @param encounters マップのエンカウント設定
 * @param randomValue 乱数値（0-1、テスト用）
 */
function checkEncounter(
  tile: MapTile,
  encounters: MapData["encounters"],
  randomValue: number,
): EncounterResult {
  // エンカウント率が0または草むら以外ならエンカウントしない
  if (tile.encounterRate === 0 || tile.type !== "grass") {
    return { occurred: false, speciesId: null, level: null };
  }

  // エンカウント判定
  if (randomValue >= tile.encounterRate) {
    return { occurred: false, speciesId: null, level: null };
  }

  // エンカウント発生 - 重み付け抽選でゴースト種族を決定
  const totalWeight = encounters.reduce((sum, e) => sum + e.weight, 0);
  if (totalWeight === 0 || encounters.length === 0) {
    return { occurred: false, speciesId: null, level: null };
  }

  // 別の乱数でゴースト種族を決定（randomValueを再利用してテスト可能に）
  const speciesRandom = (randomValue / tile.encounterRate) % 1;
  const targetWeight = speciesRandom * totalWeight;
  let cumulativeWeight = 0;

  for (const encounter of encounters) {
    cumulativeWeight += encounter.weight;
    if (targetWeight < cumulativeWeight) {
      // レベル決定（minLevel〜maxLevel）
      const levelRange = encounter.maxLevel - encounter.minLevel + 1;
      const level = encounter.minLevel + Math.floor(speciesRandom * levelRange);

      return {
        occurred: true,
        speciesId: encounter.speciesId,
        level: Math.min(level, encounter.maxLevel),
      };
    }
  }

  // フォールバック（通常到達しない）
  const fallback = encounters[0];
  return {
    occurred: true,
    speciesId: fallback.speciesId,
    level: fallback.minLevel,
  };
}

/**
 * マップ状態を管理するフック
 *
 * - 現在マップIDとプレイヤー位置の状態管理
 * - 移動アクション（方向を受け取り位置を更新）
 * - 移動可否判定（壁チェック）
 * - エンカウント判定（草むらでの乱数チェック）
 */
export function useMapState(): UseMapStateReturn {
  const [state, setState] = useState<MapState>(initialState);

  const setMap = useCallback((map: MapData) => {
    setState((prev) => ({
      ...prev,
      currentMap: map,
      position: { mapId: map.id, x: prev.position.x, y: prev.position.y },
    }));
  }, []);

  const setPosition = useCallback((position: PlayerPosition) => {
    setState((prev) => ({
      ...prev,
      position,
    }));
  }, []);

  const getTileAt = useCallback(
    (x: number, y: number): MapTile | null => {
      const map = state.currentMap;
      if (!map) return null;

      // 範囲外チェック
      if (x < 0 || x >= map.width || y < 0 || y >= map.height) {
        return null;
      }

      return map.tiles[y]?.[x] ?? null;
    },
    [state.currentMap],
  );

  const canMoveTo = useCallback(
    (x: number, y: number): boolean => {
      const tile = getTileAt(x, y);
      return tile?.walkable ?? false;
    },
    [getTileAt],
  );

  const move = useCallback(
    (direction: Direction, randomValue?: number): MoveResult => {
      const { dx, dy } = getDirectionDelta(direction);
      const newX = state.position.x + dx;
      const newY = state.position.y + dy;

      const newPosition: PlayerPosition = {
        mapId: state.position.mapId,
        x: newX,
        y: newY,
      };

      // 移動可否チェック
      if (!canMoveTo(newX, newY)) {
        return {
          success: false,
          newPosition: state.position,
          encounter: null,
        };
      }

      // 位置を更新
      setState((prev) => ({
        ...prev,
        position: newPosition,
      }));

      // エンカウント判定
      const tile = getTileAt(newX, newY);
      const encounter =
        tile && state.currentMap
          ? checkEncounter(tile, state.currentMap.encounters, randomValue ?? Math.random())
          : null;

      return {
        success: true,
        newPosition,
        encounter,
      };
    },
    [state.position, state.currentMap, canMoveTo, getTileAt],
  );

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    setMap,
    move,
    setPosition,
    canMoveTo,
    getTileAt,
    reset,
  };
}
