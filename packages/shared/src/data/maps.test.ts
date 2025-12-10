import { describe, expect, it } from "vitest";
import { MapDataSchema } from "../schemas";
import { ALL_MAPS, getMapById, MAP_001 } from "./maps";

describe("MAP_001", () => {
  it("should have correct id and name", () => {
    expect(MAP_001.id).toBe("map-001");
    expect(MAP_001.name).toBe("はじまりの森");
  });

  it("should have correct dimensions", () => {
    expect(MAP_001.width).toBe(16);
    expect(MAP_001.height).toBe(12);
  });

  it("should have tiles array matching dimensions", () => {
    expect(MAP_001.tiles.length).toBe(MAP_001.height);
    for (const row of MAP_001.tiles) {
      expect(row.length).toBe(MAP_001.width);
    }
  });

  it("should have walls on all edges", () => {
    // Top edge
    for (let x = 0; x < MAP_001.width; x++) {
      expect(MAP_001.tiles[0][x].type).toBe("wall");
    }
    // Bottom edge
    for (let x = 0; x < MAP_001.width; x++) {
      expect(MAP_001.tiles[MAP_001.height - 1][x].type).toBe("wall");
    }
    // Left edge
    for (let y = 0; y < MAP_001.height; y++) {
      expect(MAP_001.tiles[y][0].type).toBe("wall");
    }
    // Right edge
    for (let y = 0; y < MAP_001.height; y++) {
      expect(MAP_001.tiles[y][MAP_001.width - 1].type).toBe("wall");
    }
  });

  it("should have walkable ground tiles", () => {
    const groundTile = MAP_001.tiles[5][5];
    expect(groundTile.type).toBe("ground");
    expect(groundTile.walkable).toBe(true);
    expect(groundTile.encounterRate).toBe(0);
  });

  it("should have grass tiles with encounter rate", () => {
    const grassTile = MAP_001.tiles[1][4];
    expect(grassTile.type).toBe("grass");
    expect(grassTile.walkable).toBe(true);
    expect(grassTile.encounterRate).toBe(0.15);
  });

  it("should have non-walkable wall tiles", () => {
    const wallTile = MAP_001.tiles[0][0];
    expect(wallTile.type).toBe("wall");
    expect(wallTile.walkable).toBe(false);
  });

  it("should have non-walkable water tiles", () => {
    const waterTile = MAP_001.tiles[4][13];
    expect(waterTile.type).toBe("water");
    expect(waterTile.walkable).toBe(false);
  });

  it("should have encounters defined", () => {
    expect(MAP_001.encounters.length).toBeGreaterThan(0);
  });

  it("should have valid encounter data", () => {
    for (const encounter of MAP_001.encounters) {
      expect(encounter.speciesId).toBeTruthy();
      expect(encounter.weight).toBeGreaterThan(0);
      expect(encounter.minLevel).toBeGreaterThanOrEqual(1);
      expect(encounter.maxLevel).toBeGreaterThanOrEqual(encounter.minLevel);
    }
  });

  it("should have encounter weights totaling 100", () => {
    const totalWeight = MAP_001.encounters.reduce((sum, e) => sum + e.weight, 0);
    expect(totalWeight).toBe(100);
  });

  it("should validate against MapDataSchema", () => {
    const result = MapDataSchema.safeParse(MAP_001);
    expect(result.success).toBe(true);
  });
});

describe("ALL_MAPS", () => {
  it("should contain MAP_001", () => {
    expect(ALL_MAPS).toContain(MAP_001);
  });

  it("should have at least one map", () => {
    expect(ALL_MAPS.length).toBeGreaterThanOrEqual(1);
  });
});

describe("getMapById", () => {
  it("should return MAP_001 for 'map-001'", () => {
    const map = getMapById("map-001");
    expect(map).toBe(MAP_001);
  });

  it("should return undefined for unknown map id", () => {
    const map = getMapById("unknown-map");
    expect(map).toBeUndefined();
  });
});
