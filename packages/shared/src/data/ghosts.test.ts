import { describe, expect, it } from "vitest";
import { GhostSpeciesSchema, MoveSchema } from "../schemas";
import {
  GHOST_SPECIES,
  getAllGhostSpeciesIds,
  getGhostSpeciesById,
  getGhostSpeciesByRarity,
} from "./ghosts";
import { getMoveById, MOVES } from "./moves";

describe("GHOST_SPECIES master data", () => {
  it("should have at least 6 ghost species", () => {
    const speciesIds = getAllGhostSpeciesIds();
    expect(speciesIds.length).toBeGreaterThanOrEqual(6);
  });

  it("should have at least one ghost of each type", () => {
    const types = Object.values(GHOST_SPECIES).map((s) => s.type);
    expect(types).toContain("fire");
    expect(types).toContain("water");
    expect(types).toContain("grass");
    expect(types).toContain("electric");
    expect(types).toContain("ghost");
    expect(types).toContain("normal");
  });

  it("should validate all ghost species against schema", () => {
    for (const species of Object.values(GHOST_SPECIES)) {
      expect(() => GhostSpeciesSchema.parse(species)).not.toThrow();
    }
  });

  it("should have valid move references in learnable moves", () => {
    for (const species of Object.values(GHOST_SPECIES)) {
      for (const learnableMove of species.learnableMoves) {
        const move = getMoveById(learnableMove.moveId);
        expect(move).toBeDefined();
      }
    }
  });

  it("should have learnable moves sorted by level", () => {
    for (const species of Object.values(GHOST_SPECIES)) {
      const levels = species.learnableMoves.map((lm) => lm.level);
      const sortedLevels = [...levels].sort((a, b) => a - b);
      expect(levels).toEqual(sortedLevels);
    }
  });
});

describe("getGhostSpeciesById", () => {
  it("should return ghost species by id", () => {
    const fireling = getGhostSpeciesById("fireling");
    expect(fireling).toBeDefined();
    expect(fireling?.name).toBe("ヒダマリン");
    expect(fireling?.type).toBe("fire");
  });

  it("should return undefined for unknown id", () => {
    const unknown = getGhostSpeciesById("unknown-ghost");
    expect(unknown).toBeUndefined();
  });
});

describe("getGhostSpeciesByRarity", () => {
  it("should filter by common rarity", () => {
    const common = getGhostSpeciesByRarity("common");
    expect(common.length).toBeGreaterThan(0);
    for (const species of common) {
      expect(species.rarity).toBe("common");
    }
  });

  it("should filter by rare rarity", () => {
    const rare = getGhostSpeciesByRarity("rare");
    expect(rare.length).toBeGreaterThan(0);
    for (const species of rare) {
      expect(species.rarity).toBe("rare");
    }
  });
});

describe("MOVES master data", () => {
  it("should have moves for each type", () => {
    const types = Object.values(MOVES).map((m) => m.type);
    expect(types).toContain("fire");
    expect(types).toContain("water");
    expect(types).toContain("grass");
    expect(types).toContain("electric");
    expect(types).toContain("ghost");
    expect(types).toContain("normal");
  });

  it("should validate all moves against schema", () => {
    for (const move of Object.values(MOVES)) {
      expect(() => MoveSchema.parse(move)).not.toThrow();
    }
  });

  it("should have valid power ranges (0-200)", () => {
    for (const move of Object.values(MOVES)) {
      expect(move.power).toBeGreaterThanOrEqual(0);
      expect(move.power).toBeLessThanOrEqual(200);
    }
  });

  it("should have valid accuracy ranges (0-100)", () => {
    for (const move of Object.values(MOVES)) {
      expect(move.accuracy).toBeGreaterThanOrEqual(0);
      expect(move.accuracy).toBeLessThanOrEqual(100);
    }
  });

  it("should have valid pp ranges (1-40)", () => {
    for (const move of Object.values(MOVES)) {
      expect(move.pp).toBeGreaterThanOrEqual(1);
      expect(move.pp).toBeLessThanOrEqual(40);
    }
  });
});

describe("getMoveById", () => {
  it("should return move by id", () => {
    const tackle = getMoveById("tackle");
    expect(tackle).toBeDefined();
    expect(tackle?.name).toBe("たいあたり");
    expect(tackle?.type).toBe("normal");
  });

  it("should return undefined for unknown id", () => {
    const unknown = getMoveById("unknown-move");
    expect(unknown).toBeUndefined();
  });
});
