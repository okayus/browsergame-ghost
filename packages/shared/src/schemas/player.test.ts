import { describe, expect, it } from "vitest";
import {
  MapDataSchema,
  MapTileSchema,
  PartySchema,
  PlayerDataSchema,
  PlayerPositionSchema,
  TileTypeSchema,
} from "./player";

const sampleGhost = {
  id: "ghost-001",
  speciesId: "fireling",
  level: 10,
  experience: 1000,
  currentHp: 45,
  maxHp: 50,
  stats: { hp: 50, attack: 30, defense: 25, speed: 35 },
  moves: [{ moveId: "tackle", currentPP: 30, maxPP: 35 }],
};

describe("PartySchema", () => {
  it("should accept valid party with 1 ghost", () => {
    const party = { ghosts: [sampleGhost] };
    expect(PartySchema.parse(party)).toEqual(party);
  });

  it("should accept valid party with 6 ghosts", () => {
    const party = {
      ghosts: Array(6)
        .fill(null)
        .map((_, i) => ({ ...sampleGhost, id: `ghost-${i}` })),
    };
    expect(PartySchema.parse(party)).toEqual(party);
  });

  it("should reject empty party", () => {
    expect(() => PartySchema.parse({ ghosts: [] })).toThrow();
  });

  it("should reject party with more than 6 ghosts", () => {
    const party = {
      ghosts: Array(7)
        .fill(null)
        .map((_, i) => ({ ...sampleGhost, id: `ghost-${i}` })),
    };
    expect(() => PartySchema.parse(party)).toThrow();
  });
});

describe("PlayerPositionSchema", () => {
  it("should accept valid position", () => {
    const position = { mapId: "map-001", x: 5, y: 10 };
    expect(PlayerPositionSchema.parse(position)).toEqual(position);
  });

  it("should accept position at origin", () => {
    const position = { mapId: "map-001", x: 0, y: 0 };
    expect(PlayerPositionSchema.parse(position)).toEqual(position);
  });

  it("should reject negative x", () => {
    expect(() => PlayerPositionSchema.parse({ mapId: "map-001", x: -1, y: 0 })).toThrow();
  });

  it("should reject negative y", () => {
    expect(() => PlayerPositionSchema.parse({ mapId: "map-001", x: 0, y: -1 })).toThrow();
  });
});

describe("TileTypeSchema", () => {
  it("should accept valid tile types", () => {
    expect(TileTypeSchema.parse("ground")).toBe("ground");
    expect(TileTypeSchema.parse("grass")).toBe("grass");
    expect(TileTypeSchema.parse("wall")).toBe("wall");
    expect(TileTypeSchema.parse("water")).toBe("water");
  });

  it("should reject invalid tile type", () => {
    expect(() => TileTypeSchema.parse("lava")).toThrow();
  });
});

describe("MapTileSchema", () => {
  it("should accept valid walkable tile", () => {
    const tile = { type: "ground", walkable: true, encounterRate: 0 };
    expect(MapTileSchema.parse(tile)).toEqual(tile);
  });

  it("should accept grass tile with encounter rate", () => {
    const tile = { type: "grass", walkable: true, encounterRate: 0.1 };
    expect(MapTileSchema.parse(tile)).toEqual(tile);
  });

  it("should default encounterRate to 0", () => {
    const tile = { type: "wall", walkable: false };
    const parsed = MapTileSchema.parse(tile);
    expect(parsed.encounterRate).toBe(0);
  });

  it("should reject encounterRate over 1", () => {
    expect(() =>
      MapTileSchema.parse({ type: "grass", walkable: true, encounterRate: 1.5 }),
    ).toThrow();
  });

  it("should reject negative encounterRate", () => {
    expect(() =>
      MapTileSchema.parse({ type: "grass", walkable: true, encounterRate: -0.1 }),
    ).toThrow();
  });
});

describe("MapDataSchema", () => {
  it("should accept valid map data", () => {
    const map = {
      id: "map-001",
      name: "Test Map",
      width: 2,
      height: 2,
      tiles: [
        [
          { type: "ground", walkable: true, encounterRate: 0 },
          { type: "grass", walkable: true, encounterRate: 0.1 },
        ],
        [
          { type: "wall", walkable: false, encounterRate: 0 },
          { type: "water", walkable: false, encounterRate: 0 },
        ],
      ],
      encounters: [{ speciesId: "fireling", weight: 1, minLevel: 3, maxLevel: 5 }],
    };
    expect(MapDataSchema.parse(map)).toEqual(map);
  });

  it("should accept map with empty encounters", () => {
    const map = {
      id: "map-001",
      name: "Safe Zone",
      width: 1,
      height: 1,
      tiles: [[{ type: "ground", walkable: true, encounterRate: 0 }]],
      encounters: [],
    };
    expect(MapDataSchema.parse(map)).toEqual(map);
  });
});

describe("PlayerDataSchema", () => {
  it("should accept valid player data", () => {
    const player = {
      id: "player-001",
      clerkUserId: "user_123",
      name: "TestPlayer",
      party: { ghosts: [sampleGhost] },
      inventory: { items: [{ itemId: "potion", quantity: 5 }] },
      position: { mapId: "map-001", x: 5, y: 10 },
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T12:00:00Z",
    };
    expect(PlayerDataSchema.parse(player)).toEqual(player);
  });

  it("should accept player with empty inventory", () => {
    const player = {
      id: "player-001",
      clerkUserId: "user_123",
      name: "NewPlayer",
      party: { ghosts: [sampleGhost] },
      inventory: { items: [] },
      position: { mapId: "map-001", x: 0, y: 0 },
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    };
    expect(PlayerDataSchema.parse(player)).toEqual(player);
  });
});
