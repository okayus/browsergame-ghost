import { describe, expect, it } from "vitest";
import {
  BaseStatsSchema,
  GhostSpeciesSchema,
  GhostTypeSchema,
  MoveSchema,
  OwnedGhostSchema,
  OwnedMoveSchema,
} from "./ghost";

describe("GhostTypeSchema", () => {
  it("should accept valid ghost types", () => {
    expect(GhostTypeSchema.parse("fire")).toBe("fire");
    expect(GhostTypeSchema.parse("water")).toBe("water");
    expect(GhostTypeSchema.parse("grass")).toBe("grass");
    expect(GhostTypeSchema.parse("electric")).toBe("electric");
    expect(GhostTypeSchema.parse("ghost")).toBe("ghost");
    expect(GhostTypeSchema.parse("normal")).toBe("normal");
  });

  it("should reject invalid ghost types", () => {
    expect(() => GhostTypeSchema.parse("invalid")).toThrow();
    expect(() => GhostTypeSchema.parse("")).toThrow();
  });
});

describe("BaseStatsSchema", () => {
  it("should accept valid base stats", () => {
    const stats = { hp: 100, attack: 80, defense: 70, speed: 90 };
    expect(BaseStatsSchema.parse(stats)).toEqual(stats);
  });

  it("should reject stats below minimum", () => {
    expect(() => BaseStatsSchema.parse({ hp: 0, attack: 80, defense: 70, speed: 90 })).toThrow();
  });

  it("should reject stats above maximum", () => {
    expect(() => BaseStatsSchema.parse({ hp: 256, attack: 80, defense: 70, speed: 90 })).toThrow();
  });
});

describe("MoveSchema", () => {
  it("should accept valid move", () => {
    const move = {
      id: "tackle",
      name: "Tackle",
      type: "normal",
      power: 40,
      accuracy: 100,
      pp: 35,
    };
    expect(MoveSchema.parse(move)).toEqual(move);
  });

  it("should accept move with description", () => {
    const move = {
      id: "flamethrower",
      name: "Flamethrower",
      type: "fire",
      power: 90,
      accuracy: 100,
      pp: 15,
      description: "A powerful fire attack",
    };
    expect(MoveSchema.parse(move)).toEqual(move);
  });

  it("should reject move with invalid type", () => {
    expect(() =>
      MoveSchema.parse({
        id: "test",
        name: "Test",
        type: "invalid",
        power: 40,
        accuracy: 100,
        pp: 35,
      }),
    ).toThrow();
  });
});

describe("GhostSpeciesSchema", () => {
  it("should accept valid ghost species", () => {
    const species = {
      id: "fireling",
      name: "Fireling",
      type: "fire",
      baseStats: { hp: 80, attack: 90, defense: 60, speed: 100 },
      learnableMoves: [
        { level: 1, moveId: "tackle" },
        { level: 5, moveId: "ember" },
      ],
      rarity: "common",
    };
    expect(GhostSpeciesSchema.parse(species)).toEqual(species);
  });

  it("should accept species with description", () => {
    const species = {
      id: "aqua-spirit",
      name: "Aqua Spirit",
      type: "water",
      baseStats: { hp: 100, attack: 70, defense: 80, speed: 70 },
      learnableMoves: [],
      description: "A gentle water ghost",
      rarity: "rare",
    };
    expect(GhostSpeciesSchema.parse(species)).toEqual(species);
  });
});

describe("OwnedMoveSchema", () => {
  it("should accept valid owned move", () => {
    const move = { moveId: "tackle", currentPP: 30, maxPP: 35 };
    expect(OwnedMoveSchema.parse(move)).toEqual(move);
  });

  it("should accept move with 0 PP (depleted)", () => {
    const move = { moveId: "tackle", currentPP: 0, maxPP: 35 };
    expect(OwnedMoveSchema.parse(move)).toEqual(move);
  });
});

describe("OwnedGhostSchema", () => {
  it("should accept valid owned ghost", () => {
    const ghost = {
      id: "ghost-001",
      speciesId: "fireling",
      level: 10,
      experience: 1000,
      currentHp: 45,
      maxHp: 50,
      stats: { hp: 50, attack: 30, defense: 25, speed: 35 },
      moves: [
        { moveId: "tackle", currentPP: 30, maxPP: 35 },
        { moveId: "ember", currentPP: 20, maxPP: 25 },
      ],
    };
    expect(OwnedGhostSchema.parse(ghost)).toEqual(ghost);
  });

  it("should accept ghost with nickname", () => {
    const ghost = {
      id: "ghost-002",
      speciesId: "aqua-spirit",
      nickname: "Bubbles",
      level: 15,
      experience: 2500,
      currentHp: 60,
      maxHp: 60,
      stats: { hp: 60, attack: 35, defense: 40, speed: 35 },
      moves: [],
    };
    expect(OwnedGhostSchema.parse(ghost)).toEqual(ghost);
  });

  it("should reject ghost with more than 4 moves", () => {
    expect(() =>
      OwnedGhostSchema.parse({
        id: "ghost-003",
        speciesId: "test",
        level: 10,
        experience: 1000,
        currentHp: 45,
        maxHp: 50,
        stats: { hp: 50, attack: 30, defense: 25, speed: 35 },
        moves: [
          { moveId: "move1", currentPP: 10, maxPP: 10 },
          { moveId: "move2", currentPP: 10, maxPP: 10 },
          { moveId: "move3", currentPP: 10, maxPP: 10 },
          { moveId: "move4", currentPP: 10, maxPP: 10 },
          { moveId: "move5", currentPP: 10, maxPP: 10 },
        ],
      }),
    ).toThrow();
  });
});
