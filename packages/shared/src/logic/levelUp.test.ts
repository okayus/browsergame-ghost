import { describe, expect, it } from "vitest";
import type { BaseStats, LearnableMove } from "../schemas";
import {
  calculateMaxHp,
  calculateStats,
  getInitialMaxHp,
  getInitialStats,
  getNewLearnableMoves,
  processLevelUp,
} from "./levelUp";

const sampleBaseStats: BaseStats = {
  hp: 50,
  attack: 60,
  defense: 40,
  speed: 70,
};

const sampleLearnableMoves: LearnableMove[] = [
  { level: 1, moveId: "tackle" },
  { level: 1, moveId: "ember" },
  { level: 8, moveId: "flameCharge" },
  { level: 15, moveId: "scratch" },
  { level: 22, moveId: "flamethrower" },
];

describe("calculateStats", () => {
  it("should calculate stats for level 1", () => {
    const stats = calculateStats(sampleBaseStats, 1);
    // HP: floor((2 * 50 * 1) / 100) + 1 + 10 = 1 + 1 + 10 = 12
    expect(stats.hp).toBe(12);
    // Attack: floor((2 * 60 * 1) / 100) + 5 = 1 + 5 = 6
    expect(stats.attack).toBe(6);
    // Defense: floor((2 * 40 * 1) / 100) + 5 = 0 + 5 = 5
    expect(stats.defense).toBe(5);
    // Speed: floor((2 * 70 * 1) / 100) + 5 = 1 + 5 = 6
    expect(stats.speed).toBe(6);
  });

  it("should calculate stats for level 50", () => {
    const stats = calculateStats(sampleBaseStats, 50);
    // HP: floor((2 * 50 * 50) / 100) + 50 + 10 = 50 + 50 + 10 = 110
    expect(stats.hp).toBe(110);
    // Attack: floor((2 * 60 * 50) / 100) + 5 = 60 + 5 = 65
    expect(stats.attack).toBe(65);
    // Defense: floor((2 * 40 * 50) / 100) + 5 = 40 + 5 = 45
    expect(stats.defense).toBe(45);
    // Speed: floor((2 * 70 * 50) / 100) + 5 = 70 + 5 = 75
    expect(stats.speed).toBe(75);
  });

  it("should increase stats with level", () => {
    const level10 = calculateStats(sampleBaseStats, 10);
    const level50 = calculateStats(sampleBaseStats, 50);

    expect(level50.hp).toBeGreaterThan(level10.hp);
    expect(level50.attack).toBeGreaterThan(level10.attack);
    expect(level50.defense).toBeGreaterThan(level10.defense);
    expect(level50.speed).toBeGreaterThan(level10.speed);
  });
});

describe("calculateMaxHp", () => {
  it("should calculate max HP for level 1", () => {
    const maxHp = calculateMaxHp(50, 1);
    // floor((2 * 50 * 1) / 100) + 1 + 10 = 1 + 1 + 10 = 12
    expect(maxHp).toBe(12);
  });

  it("should calculate max HP for level 50", () => {
    const maxHp = calculateMaxHp(50, 50);
    expect(maxHp).toBe(110);
  });

  it("should increase with level", () => {
    expect(calculateMaxHp(50, 20)).toBeGreaterThan(calculateMaxHp(50, 10));
  });
});

describe("getNewLearnableMoves", () => {
  it("should return moves learned between levels", () => {
    const moves = getNewLearnableMoves(sampleLearnableMoves, 1, 8);
    expect(moves).toEqual(["flameCharge"]);
  });

  it("should return multiple moves for large level gap", () => {
    const moves = getNewLearnableMoves(sampleLearnableMoves, 1, 22);
    expect(moves).toEqual(["flameCharge", "scratch", "flamethrower"]);
  });

  it("should return empty array when no new moves", () => {
    const moves = getNewLearnableMoves(sampleLearnableMoves, 8, 10);
    expect(moves).toEqual([]);
  });

  it("should not include moves at fromLevel", () => {
    const moves = getNewLearnableMoves(sampleLearnableMoves, 8, 15);
    expect(moves).toEqual(["scratch"]);
    expect(moves).not.toContain("flameCharge");
  });

  it("should include moves at toLevel", () => {
    const moves = getNewLearnableMoves(sampleLearnableMoves, 7, 8);
    expect(moves).toEqual(["flameCharge"]);
  });

  it("should return sorted by level", () => {
    const unsortedMoves: LearnableMove[] = [
      { level: 20, moveId: "move20" },
      { level: 5, moveId: "move5" },
      { level: 10, moveId: "move10" },
    ];
    const moves = getNewLearnableMoves(unsortedMoves, 1, 25);
    expect(moves).toEqual(["move5", "move10", "move20"]);
  });
});

describe("processLevelUp", () => {
  it("should return updated stats and learnable moves", () => {
    const result = processLevelUp(7, 8, sampleBaseStats, sampleLearnableMoves);

    expect(result.newLevel).toBe(8);
    expect(result.newStats).toBeDefined();
    expect(result.newMaxHp).toBe(calculateMaxHp(sampleBaseStats.hp, 8));
    expect(result.learnableMoveIds).toEqual(["flameCharge"]);
  });

  it("should handle multiple level ups", () => {
    const result = processLevelUp(1, 10, sampleBaseStats, sampleLearnableMoves);

    expect(result.newLevel).toBe(10);
    expect(result.learnableMoveIds).toEqual(["flameCharge"]);
  });

  it("should return empty learnable moves when none available", () => {
    const result = processLevelUp(22, 30, sampleBaseStats, sampleLearnableMoves);

    expect(result.learnableMoveIds).toEqual([]);
  });
});

describe("getInitialStats", () => {
  it("should return level 1 stats", () => {
    const stats = getInitialStats(sampleBaseStats);
    const expected = calculateStats(sampleBaseStats, 1);

    expect(stats).toEqual(expected);
  });
});

describe("getInitialMaxHp", () => {
  it("should return level 1 max HP", () => {
    const maxHp = getInitialMaxHp(50);
    const expected = calculateMaxHp(50, 1);

    expect(maxHp).toBe(expected);
  });
});

describe("レベルアップエッジケーステスト", () => {
  describe("ステータス計算の詳細テスト", () => {
    // HP = floor((2 * baseHp * level) / 100) + level + 10
    // Other stats = floor((2 * baseStat * level) / 100) + 5
    // sampleBaseStats = { hp: 50, attack: 60, defense: 40, speed: 70 }
    it.each([
      [1, 12, 6, 5, 6],
      [10, 30, 17, 13, 19],
      [25, 60, 35, 25, 40],
      [50, 110, 65, 45, 75],
      [100, 210, 125, 85, 145],
    ])("レベル%dでHP=%d, ATK=%d, DEF=%d, SPD=%d", (level, expectedHp, expectedAtk, expectedDef, expectedSpd) => {
      const stats = calculateStats(sampleBaseStats, level);
      expect(stats.hp).toBe(expectedHp);
      expect(stats.attack).toBe(expectedAtk);
      expect(stats.defense).toBe(expectedDef);
      expect(stats.speed).toBe(expectedSpd);
    });
  });

  describe("基礎ステータスの影響テスト", () => {
    it("高い基礎ステータスは高いステータスになる", () => {
      const highStats: BaseStats = { hp: 100, attack: 100, defense: 100, speed: 100 };
      const lowStats: BaseStats = { hp: 30, attack: 30, defense: 30, speed: 30 };

      const highResult = calculateStats(highStats, 50);
      const lowResult = calculateStats(lowStats, 50);

      expect(highResult.hp).toBeGreaterThan(lowResult.hp);
      expect(highResult.attack).toBeGreaterThan(lowResult.attack);
      expect(highResult.defense).toBeGreaterThan(lowResult.defense);
      expect(highResult.speed).toBeGreaterThan(lowResult.speed);
    });

    it("基礎HP 1でもレベル1で最低限のHPを持つ", () => {
      const minStats: BaseStats = { hp: 1, attack: 1, defense: 1, speed: 1 };
      const stats = calculateStats(minStats, 1);
      expect(stats.hp).toBeGreaterThan(0);
    });
  });

  describe("技習得の境界テスト", () => {
    it("ちょうど習得レベルで技を覚える", () => {
      const moves = getNewLearnableMoves(sampleLearnableMoves, 7, 8);
      expect(moves).toContain("flameCharge");
    });

    it("習得レベル-1では技を覚えない", () => {
      const moves = getNewLearnableMoves(sampleLearnableMoves, 6, 7);
      expect(moves).not.toContain("flameCharge");
    });

    it("同じレベルで複数の技を覚える場合", () => {
      const movesWithMultipleAtSameLevel: LearnableMove[] = [
        { level: 1, moveId: "tackle" },
        { level: 1, moveId: "growl" },
        { level: 5, moveId: "ember" },
        { level: 5, moveId: "scratch" },
      ];
      const moves = getNewLearnableMoves(movesWithMultipleAtSameLevel, 4, 5);
      expect(moves).toEqual(["ember", "scratch"]);
    });

    it("空の習得技リストでも動作する", () => {
      const moves = getNewLearnableMoves([], 1, 10);
      expect(moves).toEqual([]);
    });
  });

  describe("processLevelUpの詳細テスト", () => {
    it("レベルが変わらない場合でも正しいデータを返す", () => {
      const result = processLevelUp(10, 10, sampleBaseStats, sampleLearnableMoves);
      expect(result.newLevel).toBe(10);
      expect(result.learnableMoveIds).toEqual([]);
    });

    it("大幅なレベルアップで複数の技を習得", () => {
      const result = processLevelUp(1, 25, sampleBaseStats, sampleLearnableMoves);
      expect(result.learnableMoveIds).toEqual(["flameCharge", "scratch", "flamethrower"]);
    });

    it("ステータスが正しく再計算される", () => {
      const result = processLevelUp(10, 50, sampleBaseStats, sampleLearnableMoves);
      const expectedStats = calculateStats(sampleBaseStats, 50);
      expect(result.newStats).toEqual(expectedStats);
      expect(result.newMaxHp).toBe(expectedStats.hp);
    });
  });
});

describe("HP計算の特殊ケース", () => {
  it("HPは他のステータスより高くなる傾向がある", () => {
    const stats = calculateStats(sampleBaseStats, 50);
    // HP計算には+levelと+10のボーナスがある
    expect(stats.hp).toBeGreaterThan(stats.attack);
  });

  it("レベル1でも最低HP 11は保証される", () => {
    // HP = floor((2 * baseHp * 1) / 100) + 1 + 10
    // baseHp = 0の場合でも 0 + 1 + 10 = 11
    const zeroHpBase: BaseStats = { hp: 0, attack: 50, defense: 50, speed: 50 };
    expect(calculateMaxHp(0, 1)).toBe(11);
    expect(calculateStats(zeroHpBase, 1).hp).toBe(11);
  });
});
