import { describe, expect, it } from "vitest";
import type { GhostType } from "../schemas";
import {
  getEffectivenessMessage,
  getTypeEffectiveness,
  getTypeNameJa,
  TYPE_CHART,
} from "./typeEffectiveness";

describe("TYPE_CHART", () => {
  const allTypes: GhostType[] = ["fire", "water", "grass", "electric", "ghost", "normal"];

  it("should have all type combinations defined", () => {
    for (const attackType of allTypes) {
      for (const defenseType of allTypes) {
        const multiplier = TYPE_CHART[attackType][defenseType];
        expect([0, 0.5, 1, 2]).toContain(multiplier);
      }
    }
  });

  it("should have 36 total combinations (6x6)", () => {
    let count = 0;
    for (const attackType of allTypes) {
      for (const defenseType of allTypes) {
        if (TYPE_CHART[attackType][defenseType] !== undefined) {
          count++;
        }
      }
    }
    expect(count).toBe(36);
  });
});

describe("getTypeEffectiveness", () => {
  // 効果抜群 (2x)
  it("fire should be super effective against grass", () => {
    expect(getTypeEffectiveness("fire", "grass")).toBe(2);
  });

  it("water should be super effective against fire", () => {
    expect(getTypeEffectiveness("water", "fire")).toBe(2);
  });

  it("grass should be super effective against water", () => {
    expect(getTypeEffectiveness("grass", "water")).toBe(2);
  });

  it("electric should be super effective against water", () => {
    expect(getTypeEffectiveness("electric", "water")).toBe(2);
  });

  it("ghost should be super effective against ghost", () => {
    expect(getTypeEffectiveness("ghost", "ghost")).toBe(2);
  });

  // 今ひとつ (0.5x)
  it("fire should be not very effective against water", () => {
    expect(getTypeEffectiveness("fire", "water")).toBe(0.5);
  });

  it("water should be not very effective against grass", () => {
    expect(getTypeEffectiveness("water", "grass")).toBe(0.5);
  });

  it("grass should be not very effective against fire", () => {
    expect(getTypeEffectiveness("grass", "fire")).toBe(0.5);
  });

  // 効果なし (0x)
  it("normal should have no effect on ghost", () => {
    expect(getTypeEffectiveness("normal", "ghost")).toBe(0);
  });

  it("ghost should have no effect on normal", () => {
    expect(getTypeEffectiveness("ghost", "normal")).toBe(0);
  });

  // 通常 (1x)
  it("fire should be normal effective against normal", () => {
    expect(getTypeEffectiveness("fire", "normal")).toBe(1);
  });

  it("normal should be normal effective against normal", () => {
    expect(getTypeEffectiveness("normal", "normal")).toBe(1);
  });
});

describe("getEffectivenessMessage", () => {
  it("should return super effective message for 2x", () => {
    expect(getEffectivenessMessage(2)).toBe("効果は抜群だ！");
  });

  it("should return not very effective message for 0.5x", () => {
    expect(getEffectivenessMessage(0.5)).toBe("効果は今ひとつのようだ...");
  });

  it("should return no effect message for 0x", () => {
    expect(getEffectivenessMessage(0)).toBe("効果がないようだ...");
  });

  it("should return empty string for 1x (normal effectiveness)", () => {
    expect(getEffectivenessMessage(1)).toBe("");
  });
});

describe("getTypeNameJa", () => {
  it("should return Japanese name for fire", () => {
    expect(getTypeNameJa("fire")).toBe("ほのお");
  });

  it("should return Japanese name for water", () => {
    expect(getTypeNameJa("water")).toBe("みず");
  });

  it("should return Japanese name for grass", () => {
    expect(getTypeNameJa("grass")).toBe("くさ");
  });

  it("should return Japanese name for electric", () => {
    expect(getTypeNameJa("electric")).toBe("でんき");
  });

  it("should return Japanese name for ghost", () => {
    expect(getTypeNameJa("ghost")).toBe("ゴースト");
  });

  it("should return Japanese name for normal", () => {
    expect(getTypeNameJa("normal")).toBe("ノーマル");
  });
});

describe("TYPE_CHART - 全36パターン網羅テスト", () => {
  const expectedChart: Record<GhostType, Record<GhostType, number>> = {
    fire: { fire: 0.5, water: 0.5, grass: 2, electric: 1, ghost: 1, normal: 1 },
    water: { fire: 2, water: 0.5, grass: 0.5, electric: 1, ghost: 1, normal: 1 },
    grass: { fire: 0.5, water: 2, grass: 0.5, electric: 1, ghost: 1, normal: 1 },
    electric: { fire: 1, water: 2, grass: 0.5, electric: 0.5, ghost: 1, normal: 1 },
    ghost: { fire: 1, water: 1, grass: 1, electric: 1, ghost: 2, normal: 0 },
    normal: { fire: 1, water: 1, grass: 1, electric: 1, ghost: 0, normal: 1 },
  };

  const allTypes: GhostType[] = ["fire", "water", "grass", "electric", "ghost", "normal"];

  describe("ほのお (fire) タイプの攻撃", () => {
    it.each([
      ["fire", 0.5, "今ひとつ"],
      ["water", 0.5, "今ひとつ"],
      ["grass", 2, "効果抜群"],
      ["electric", 1, "等倍"],
      ["ghost", 1, "等倍"],
      ["normal", 1, "等倍"],
    ] as const)("vs %s → %s倍 (%s)", (defender, expected, _desc) => {
      expect(getTypeEffectiveness("fire", defender)).toBe(expected);
    });
  });

  describe("みず (water) タイプの攻撃", () => {
    it.each([
      ["fire", 2, "効果抜群"],
      ["water", 0.5, "今ひとつ"],
      ["grass", 0.5, "今ひとつ"],
      ["electric", 1, "等倍"],
      ["ghost", 1, "等倍"],
      ["normal", 1, "等倍"],
    ] as const)("vs %s → %s倍 (%s)", (defender, expected, _desc) => {
      expect(getTypeEffectiveness("water", defender)).toBe(expected);
    });
  });

  describe("くさ (grass) タイプの攻撃", () => {
    it.each([
      ["fire", 0.5, "今ひとつ"],
      ["water", 2, "効果抜群"],
      ["grass", 0.5, "今ひとつ"],
      ["electric", 1, "等倍"],
      ["ghost", 1, "等倍"],
      ["normal", 1, "等倍"],
    ] as const)("vs %s → %s倍 (%s)", (defender, expected, _desc) => {
      expect(getTypeEffectiveness("grass", defender)).toBe(expected);
    });
  });

  describe("でんき (electric) タイプの攻撃", () => {
    it.each([
      ["fire", 1, "等倍"],
      ["water", 2, "効果抜群"],
      ["grass", 0.5, "今ひとつ"],
      ["electric", 0.5, "今ひとつ"],
      ["ghost", 1, "等倍"],
      ["normal", 1, "等倍"],
    ] as const)("vs %s → %s倍 (%s)", (defender, expected, _desc) => {
      expect(getTypeEffectiveness("electric", defender)).toBe(expected);
    });
  });

  describe("ゴースト (ghost) タイプの攻撃", () => {
    it.each([
      ["fire", 1, "等倍"],
      ["water", 1, "等倍"],
      ["grass", 1, "等倍"],
      ["electric", 1, "等倍"],
      ["ghost", 2, "効果抜群"],
      ["normal", 0, "効果なし"],
    ] as const)("vs %s → %s倍 (%s)", (defender, expected, _desc) => {
      expect(getTypeEffectiveness("ghost", defender)).toBe(expected);
    });
  });

  describe("ノーマル (normal) タイプの攻撃", () => {
    it.each([
      ["fire", 1, "等倍"],
      ["water", 1, "等倍"],
      ["grass", 1, "等倍"],
      ["electric", 1, "等倍"],
      ["ghost", 0, "効果なし"],
      ["normal", 1, "等倍"],
    ] as const)("vs %s → %s倍 (%s)", (defender, expected, _desc) => {
      expect(getTypeEffectiveness("normal", defender)).toBe(expected);
    });
  });

  it("should match expected chart for all 36 combinations", () => {
    for (const attacker of allTypes) {
      for (const defender of allTypes) {
        expect(TYPE_CHART[attacker][defender]).toBe(expectedChart[attacker][defender]);
      }
    }
  });

  describe("相性パターン分類", () => {
    it("should have correct super effective (2x) matchups", () => {
      const superEffective: [GhostType, GhostType][] = [
        ["fire", "grass"],
        ["water", "fire"],
        ["grass", "water"],
        ["electric", "water"],
        ["ghost", "ghost"],
      ];
      for (const [atk, def] of superEffective) {
        expect(getTypeEffectiveness(atk, def)).toBe(2);
      }
    });

    it("should have correct not very effective (0.5x) matchups", () => {
      const notVeryEffective: [GhostType, GhostType][] = [
        ["fire", "fire"],
        ["fire", "water"],
        ["water", "water"],
        ["water", "grass"],
        ["grass", "fire"],
        ["grass", "grass"],
        ["electric", "grass"],
        ["electric", "electric"],
      ];
      for (const [atk, def] of notVeryEffective) {
        expect(getTypeEffectiveness(atk, def)).toBe(0.5);
      }
    });

    it("should have correct no effect (0x) matchups", () => {
      const noEffect: [GhostType, GhostType][] = [
        ["ghost", "normal"],
        ["normal", "ghost"],
      ];
      for (const [atk, def] of noEffect) {
        expect(getTypeEffectiveness(atk, def)).toBe(0);
      }
    });
  });
});
