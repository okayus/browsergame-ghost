import { describe, expect, it } from "vitest";
import {
  addExperience,
  BASE_EXP_MULTIPLIER,
  calculateExpGain,
  getExpForLevel,
  getExpToNextLevel,
  getLevelFromExp,
} from "./experience";

describe("calculateExpGain", () => {
  it("should calculate exp based on defeated level", () => {
    expect(calculateExpGain(5)).toBe(5 * BASE_EXP_MULTIPLIER);
    expect(calculateExpGain(10)).toBe(10 * BASE_EXP_MULTIPLIER);
  });

  it("should return 0 for level 0", () => {
    expect(calculateExpGain(0)).toBe(0);
  });

  it("should floor the result", () => {
    // Ensure integer result
    expect(Number.isInteger(calculateExpGain(7))).toBe(true);
  });
});

describe("getExpForLevel", () => {
  it("should return 0 for level 1", () => {
    expect(getExpForLevel(1)).toBe(0);
  });

  it("should return 0 for level 0 or below", () => {
    expect(getExpForLevel(0)).toBe(0);
    expect(getExpForLevel(-1)).toBe(0);
  });

  it("should calculate level^3 for levels above 1", () => {
    expect(getExpForLevel(2)).toBe(8); // 2^3
    expect(getExpForLevel(5)).toBe(125); // 5^3
    expect(getExpForLevel(10)).toBe(1000); // 10^3
  });

  it("should increase exponentially", () => {
    const exp5 = getExpForLevel(5);
    const exp10 = getExpForLevel(10);
    const exp20 = getExpForLevel(20);

    expect(exp10).toBeGreaterThan(exp5);
    expect(exp20).toBeGreaterThan(exp10);
  });
});

describe("getExpToNextLevel", () => {
  it("should calculate remaining exp to next level", () => {
    // At level 1 with 0 exp, need 8 exp to reach level 2
    expect(getExpToNextLevel(1, 0)).toBe(8);
  });

  it("should account for current exp", () => {
    // At level 1 with 5 exp, need 3 more to reach level 2 (8)
    expect(getExpToNextLevel(1, 5)).toBe(3);
  });

  it("should return 0 if already have enough exp", () => {
    // At level 1 with 10 exp, already past level 2 threshold
    expect(getExpToNextLevel(1, 10)).toBe(0);
  });

  it("should work at higher levels", () => {
    // Level 10 needs 1000, level 11 needs 1331
    // At level 10 with 1000 exp, need 331 to reach level 11
    expect(getExpToNextLevel(10, 1000)).toBe(331);
  });
});

describe("getLevelFromExp", () => {
  it("should return level 1 for 0 exp", () => {
    expect(getLevelFromExp(0)).toBe(1);
  });

  it("should return level 1 for exp less than level 2 threshold", () => {
    expect(getLevelFromExp(7)).toBe(1);
  });

  it("should return level 2 for exp at level 2 threshold", () => {
    expect(getLevelFromExp(8)).toBe(2);
  });

  it("should return correct level for various exp values", () => {
    expect(getLevelFromExp(27)).toBe(3); // 3^3 = 27
    expect(getLevelFromExp(125)).toBe(5); // 5^3 = 125
    expect(getLevelFromExp(1000)).toBe(10); // 10^3 = 1000
  });

  it("should not exceed max level", () => {
    expect(getLevelFromExp(1000000, 50)).toBe(50);
  });

  it("should handle exp between levels", () => {
    // Between level 5 (125) and level 6 (216)
    expect(getLevelFromExp(150)).toBe(5);
    expect(getLevelFromExp(215)).toBe(5);
    expect(getLevelFromExp(216)).toBe(6);
  });
});

describe("addExperience", () => {
  it("should add exp without leveling up", () => {
    const result = addExperience(1, 0, 5);
    expect(result.newExp).toBe(5);
    expect(result.newLevel).toBe(1);
    expect(result.leveledUp).toBe(false);
    expect(result.levelsGained).toBe(0);
  });

  it("should level up when gaining enough exp", () => {
    const result = addExperience(1, 0, 10);
    expect(result.newExp).toBe(10);
    expect(result.newLevel).toBe(2);
    expect(result.leveledUp).toBe(true);
    expect(result.levelsGained).toBe(1);
  });

  it("should handle multiple level ups", () => {
    // From level 1 with 0 exp, gain 130 exp
    // Level 2 = 8, Level 3 = 27, Level 4 = 64, Level 5 = 125
    const result = addExperience(1, 0, 130);
    expect(result.newLevel).toBe(5);
    expect(result.levelsGained).toBe(4);
    expect(result.leveledUp).toBe(true);
  });

  it("should not exceed max level", () => {
    const result = addExperience(99, 970299, 100000, 100);
    expect(result.newLevel).toBe(100);
  });

  it("should accumulate exp correctly", () => {
    const result = addExperience(5, 125, 50);
    expect(result.newExp).toBe(175);
  });
});

describe("constants", () => {
  it("should have reasonable base exp multiplier", () => {
    expect(BASE_EXP_MULTIPLIER).toBeGreaterThan(0);
  });
});
