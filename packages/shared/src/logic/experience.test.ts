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

describe("経験値計算エッジケーステスト", () => {
  describe("レベル閾値の境界テスト", () => {
    it.each([
      [1, 0, "レベル1"],
      [2, 8, "レベル2"],
      [3, 27, "レベル3"],
      [5, 125, "レベル5"],
      [10, 1000, "レベル10"],
      [20, 8000, "レベル20"],
      [50, 125000, "レベル50"],
      [100, 1000000, "レベル100"],
    ])("レベル%dに必要な経験値は%d (%s)", (level, expectedExp, _desc) => {
      expect(getExpForLevel(level)).toBe(expectedExp);
    });
  });

  describe("経験値からレベル逆算の境界テスト", () => {
    it.each([
      [0, 1, "経験値0"],
      [7, 1, "レベル2閾値直前"],
      [8, 2, "レベル2閾値ちょうど"],
      [9, 2, "レベル2閾値+1"],
      [26, 2, "レベル3閾値直前"],
      [27, 3, "レベル3閾値ちょうど"],
      [999, 9, "レベル10閾値直前"],
      [1000, 10, "レベル10閾値ちょうど"],
    ])("経験値%dはレベル%d (%s)", (exp, expectedLevel, _desc) => {
      expect(getLevelFromExp(exp)).toBe(expectedLevel);
    });
  });

  describe("大量経験値獲得時のレベルアップ", () => {
    it("一度に複数レベル上がる場合", () => {
      // レベル1から130exp獲得 → レベル5になるはず
      const result = addExperience(1, 0, 130);
      expect(result.newLevel).toBe(5);
      expect(result.levelsGained).toBe(4);
    });

    it("レベル10から1000exp獲得", () => {
      // レベル10は1000exp、レベル11は1331exp
      // 現在1000expから+1000exp = 2000exp → レベル12(1728)超え
      const result = addExperience(10, 1000, 1000);
      expect(result.newExp).toBe(2000);
      expect(result.newLevel).toBe(12);
    });
  });

  describe("最大レベル制限テスト", () => {
    it("デフォルト最大レベル(100)を超えない", () => {
      const result = addExperience(99, 970299, 100000);
      expect(result.newLevel).toBe(100);
    });

    it("カスタム最大レベル(50)を超えない", () => {
      const result = addExperience(49, 117649, 100000, 50);
      expect(result.newLevel).toBe(50);
    });

    it("最大レベルでもexpは加算される", () => {
      const result = addExperience(100, 1000000, 500);
      expect(result.newExp).toBe(1000500);
      expect(result.newLevel).toBe(100);
      expect(result.leveledUp).toBe(false);
    });
  });

  describe("次レベルまでの経験値計算", () => {
    it("レベル1で経験値0の場合、次レベルまで8", () => {
      expect(getExpToNextLevel(1, 0)).toBe(8);
    });

    it("レベル1で経験値5の場合、次レベルまで3", () => {
      expect(getExpToNextLevel(1, 5)).toBe(3);
    });

    it("経験値が次レベル閾値を超えている場合は0", () => {
      expect(getExpToNextLevel(1, 100)).toBe(0);
    });

    it("高レベルでの次レベルまでの経験値", () => {
      // レベル50→51: 125000→132651 = 7651必要
      expect(getExpToNextLevel(50, 125000)).toBe(7651);
    });
  });
});

describe("敵レベルによる経験値獲得パターン", () => {
  it.each([
    [1, 10, "レベル1の敵"],
    [5, 50, "レベル5の敵"],
    [10, 100, "レベル10の敵"],
    [25, 250, "レベル25の敵"],
    [50, 500, "レベル50の敵"],
  ])("レベル%dの敵を倒すと%d経験値 (%s)", (level, expectedExp, _desc) => {
    expect(calculateExpGain(level)).toBe(expectedExp);
  });
});
