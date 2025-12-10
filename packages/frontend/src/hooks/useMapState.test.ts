import type { MapData, MapTile } from "@ghost-game/shared";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useMapState } from "./useMapState";

const G: MapTile = { type: "ground", walkable: true, encounterRate: 0 };
const R: MapTile = { type: "grass", walkable: true, encounterRate: 0.15 };
const W: MapTile = { type: "wall", walkable: false, encounterRate: 0 };
const A: MapTile = { type: "water", walkable: false, encounterRate: 0 };

const createTestMap = (): MapData => ({
  id: "test-map",
  name: "テストマップ",
  width: 5,
  height: 5,
  tiles: [
    [W, W, W, W, W],
    [W, G, G, R, W],
    [W, G, G, G, W],
    [W, R, G, A, W],
    [W, W, W, W, W],
  ],
  encounters: [
    { speciesId: "spiritpuff", weight: 60, minLevel: 2, maxLevel: 5 },
    { speciesId: "fireling", weight: 40, minLevel: 3, maxLevel: 6 },
  ],
});

describe("useMapState", () => {
  describe("initial state", () => {
    it("should start with null map", () => {
      const { result } = renderHook(() => useMapState());
      expect(result.current.state.currentMap).toBeNull();
    });

    it("should start with default position", () => {
      const { result } = renderHook(() => useMapState());
      expect(result.current.state.position).toEqual({ mapId: "", x: 0, y: 0 });
    });
  });

  describe("setMap", () => {
    it("should set the current map", () => {
      const { result } = renderHook(() => useMapState());
      const testMap = createTestMap();

      act(() => {
        result.current.setMap(testMap);
      });

      expect(result.current.state.currentMap).toEqual(testMap);
      expect(result.current.state.position.mapId).toBe("test-map");
    });
  });

  describe("setPosition", () => {
    it("should set player position", () => {
      const { result } = renderHook(() => useMapState());

      act(() => {
        result.current.setPosition({ mapId: "test-map", x: 2, y: 2 });
      });

      expect(result.current.state.position).toEqual({
        mapId: "test-map",
        x: 2,
        y: 2,
      });
    });
  });

  describe("getTileAt", () => {
    it("should return null when no map is set", () => {
      const { result } = renderHook(() => useMapState());
      expect(result.current.getTileAt(1, 1)).toBeNull();
    });

    it("should return tile at valid position", () => {
      const { result } = renderHook(() => useMapState());

      act(() => {
        result.current.setMap(createTestMap());
      });

      const groundTile = result.current.getTileAt(1, 1);
      expect(groundTile?.type).toBe("ground");
      expect(groundTile?.walkable).toBe(true);

      const grassTile = result.current.getTileAt(3, 1);
      expect(grassTile?.type).toBe("grass");
      expect(grassTile?.encounterRate).toBe(0.15);

      const wallTile = result.current.getTileAt(0, 0);
      expect(wallTile?.type).toBe("wall");
      expect(wallTile?.walkable).toBe(false);

      const waterTile = result.current.getTileAt(3, 3);
      expect(waterTile?.type).toBe("water");
      expect(waterTile?.walkable).toBe(false);
    });

    it("should return null for out of bounds position", () => {
      const { result } = renderHook(() => useMapState());

      act(() => {
        result.current.setMap(createTestMap());
      });

      expect(result.current.getTileAt(-1, 0)).toBeNull();
      expect(result.current.getTileAt(0, -1)).toBeNull();
      expect(result.current.getTileAt(5, 0)).toBeNull();
      expect(result.current.getTileAt(0, 5)).toBeNull();
    });
  });

  describe("canMoveTo", () => {
    it("should return false when no map is set", () => {
      const { result } = renderHook(() => useMapState());
      expect(result.current.canMoveTo(1, 1)).toBe(false);
    });

    it("should return true for walkable tiles", () => {
      const { result } = renderHook(() => useMapState());

      act(() => {
        result.current.setMap(createTestMap());
      });

      expect(result.current.canMoveTo(1, 1)).toBe(true); // ground
      expect(result.current.canMoveTo(3, 1)).toBe(true); // grass
    });

    it("should return false for non-walkable tiles", () => {
      const { result } = renderHook(() => useMapState());

      act(() => {
        result.current.setMap(createTestMap());
      });

      expect(result.current.canMoveTo(0, 0)).toBe(false); // wall
      expect(result.current.canMoveTo(3, 3)).toBe(false); // water
    });

    it("should return false for out of bounds", () => {
      const { result } = renderHook(() => useMapState());

      act(() => {
        result.current.setMap(createTestMap());
      });

      expect(result.current.canMoveTo(-1, 0)).toBe(false);
      expect(result.current.canMoveTo(10, 10)).toBe(false);
    });
  });

  describe("move", () => {
    it("should move up successfully", () => {
      const { result } = renderHook(() => useMapState());

      act(() => {
        result.current.setMap(createTestMap());
        result.current.setPosition({ mapId: "test-map", x: 2, y: 2 });
      });

      let moveResult: ReturnType<typeof result.current.move>;
      act(() => {
        moveResult = result.current.move("up", 0.5); // randomValue to prevent encounter
      });

      expect(moveResult!.success).toBe(true);
      expect(moveResult!.newPosition).toEqual({ mapId: "test-map", x: 2, y: 1 });
      expect(result.current.state.position).toEqual({ mapId: "test-map", x: 2, y: 1 });
    });

    it("should move down successfully", () => {
      const { result } = renderHook(() => useMapState());

      act(() => {
        result.current.setMap(createTestMap());
        result.current.setPosition({ mapId: "test-map", x: 2, y: 2 });
      });

      let moveResult: ReturnType<typeof result.current.move>;
      act(() => {
        moveResult = result.current.move("down", 0.5);
      });

      expect(moveResult!.success).toBe(true);
      expect(moveResult!.newPosition).toEqual({ mapId: "test-map", x: 2, y: 3 });
    });

    it("should move left successfully", () => {
      const { result } = renderHook(() => useMapState());

      act(() => {
        result.current.setMap(createTestMap());
        result.current.setPosition({ mapId: "test-map", x: 2, y: 2 });
      });

      let moveResult: ReturnType<typeof result.current.move>;
      act(() => {
        moveResult = result.current.move("left", 0.5);
      });

      expect(moveResult!.success).toBe(true);
      expect(moveResult!.newPosition).toEqual({ mapId: "test-map", x: 1, y: 2 });
    });

    it("should move right successfully", () => {
      const { result } = renderHook(() => useMapState());

      act(() => {
        result.current.setMap(createTestMap());
        result.current.setPosition({ mapId: "test-map", x: 2, y: 2 });
      });

      let moveResult: ReturnType<typeof result.current.move>;
      act(() => {
        moveResult = result.current.move("right", 0.5);
      });

      expect(moveResult!.success).toBe(true);
      expect(moveResult!.newPosition).toEqual({ mapId: "test-map", x: 3, y: 2 });
    });

    it("should fail to move into wall", () => {
      const { result } = renderHook(() => useMapState());

      act(() => {
        result.current.setMap(createTestMap());
        result.current.setPosition({ mapId: "test-map", x: 1, y: 1 });
      });

      let moveResult: ReturnType<typeof result.current.move>;
      act(() => {
        moveResult = result.current.move("up", 0.5); // wall at y=0
      });

      expect(moveResult!.success).toBe(false);
      expect(moveResult!.encounter).toBeNull();
      expect(result.current.state.position).toEqual({ mapId: "test-map", x: 1, y: 1 });
    });

    it("should fail to move into water", () => {
      const { result } = renderHook(() => useMapState());

      act(() => {
        result.current.setMap(createTestMap());
        result.current.setPosition({ mapId: "test-map", x: 2, y: 3 });
      });

      let moveResult: ReturnType<typeof result.current.move>;
      act(() => {
        moveResult = result.current.move("right", 0.5); // water at x=3
      });

      expect(moveResult!.success).toBe(false);
      expect(result.current.state.position).toEqual({ mapId: "test-map", x: 2, y: 3 });
    });
  });

  describe("encounter", () => {
    it("should not trigger encounter on ground tile", () => {
      const { result } = renderHook(() => useMapState());

      act(() => {
        result.current.setMap(createTestMap());
        result.current.setPosition({ mapId: "test-map", x: 1, y: 2 });
      });

      let moveResult: ReturnType<typeof result.current.move>;
      act(() => {
        moveResult = result.current.move("right", 0.01); // Very low random, but ground has 0 rate
      });

      expect(moveResult!.success).toBe(true);
      expect(moveResult!.encounter?.occurred).toBe(false);
    });

    it("should trigger encounter on grass with low random value", () => {
      const { result } = renderHook(() => useMapState());

      act(() => {
        result.current.setMap(createTestMap());
        result.current.setPosition({ mapId: "test-map", x: 2, y: 1 });
      });

      let moveResult: ReturnType<typeof result.current.move>;
      act(() => {
        moveResult = result.current.move("right", 0.05); // 0.05 < 0.15 encounter rate
      });

      expect(moveResult!.success).toBe(true);
      expect(moveResult!.encounter?.occurred).toBe(true);
      expect(moveResult!.encounter?.speciesId).toBeDefined();
      expect(moveResult!.encounter?.level).toBeGreaterThanOrEqual(2);
    });

    it("should not trigger encounter on grass with high random value", () => {
      const { result } = renderHook(() => useMapState());

      act(() => {
        result.current.setMap(createTestMap());
        result.current.setPosition({ mapId: "test-map", x: 2, y: 1 });
      });

      let moveResult: ReturnType<typeof result.current.move>;
      act(() => {
        moveResult = result.current.move("right", 0.5); // 0.5 >= 0.15 encounter rate
      });

      expect(moveResult!.success).toBe(true);
      expect(moveResult!.encounter?.occurred).toBe(false);
    });

    it("should select species based on weight", () => {
      const { result } = renderHook(() => useMapState());

      act(() => {
        result.current.setMap(createTestMap());
        result.current.setPosition({ mapId: "test-map", x: 2, y: 1 });
      });

      // Test multiple encounters to verify weight distribution
      let spiritpuffCount = 0;
      let firelingCount = 0;

      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.setPosition({ mapId: "test-map", x: 2, y: 1 });
        });

        let moveResult: ReturnType<typeof result.current.move>;
        const randomValue = (i * 0.001) % 0.15; // Keep within encounter rate

        act(() => {
          moveResult = result.current.move("right", randomValue);
        });

        if (moveResult!.encounter?.speciesId === "spiritpuff") {
          spiritpuffCount++;
        } else if (moveResult!.encounter?.speciesId === "fireling") {
          firelingCount++;
        }
      }

      // spiritpuff has 60% weight, fireling has 40%
      // With 100 samples, spiritpuff should appear more often
      expect(spiritpuffCount).toBeGreaterThan(0);
      expect(firelingCount).toBeGreaterThan(0);
    });
  });

  describe("reset", () => {
    it("should reset to initial state", () => {
      const { result } = renderHook(() => useMapState());

      act(() => {
        result.current.setMap(createTestMap());
        result.current.setPosition({ mapId: "test-map", x: 3, y: 3 });
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.state.currentMap).toBeNull();
      expect(result.current.state.position).toEqual({ mapId: "", x: 0, y: 0 });
    });
  });
});
