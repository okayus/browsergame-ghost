import type { Item, OwnedGhost } from "@ghost-game/shared";
import { describe, expect, it } from "vitest";
import { applyHealingItem, getCaptureBonus } from "./useBattleItem";

const createMockItem = (overrides: Partial<Item> = {}): Item => ({
  id: "potion",
  name: "ポーション",
  category: "healing",
  effectValue: 30,
  price: 200,
  ...overrides,
});

const createMockGhost = (currentHp: number, maxHp: number): OwnedGhost => ({
  id: "ghost-1",
  speciesId: "fireling",
  level: 5,
  experience: 0,
  currentHp,
  maxHp,
  stats: { hp: maxHp, attack: 10, defense: 8, speed: 12 },
  moves: [],
});

describe("applyHealingItem", () => {
  describe("HP回復", () => {
    it("should heal ghost HP by item effect value", () => {
      const item = createMockItem({ effectValue: 30 });
      const ghost = createMockGhost(20, 50);

      const result = applyHealingItem(item, ghost);

      expect(result.success).toBe(true);
      expect(result.healedAmount).toBe(30);
      expect(result.newHp).toBe(50);
    });

    it("should not exceed max HP when healing", () => {
      const item = createMockItem({ effectValue: 100 });
      const ghost = createMockGhost(40, 50);

      const result = applyHealingItem(item, ghost);

      expect(result.success).toBe(true);
      expect(result.healedAmount).toBe(10); // 50 - 40 = 10
      expect(result.newHp).toBe(50);
    });

    it("should return 0 healed amount when HP is already full", () => {
      const item = createMockItem({ effectValue: 30 });
      const ghost = createMockGhost(50, 50);

      const result = applyHealingItem(item, ghost);

      expect(result.success).toBe(true);
      expect(result.healedAmount).toBe(0);
      expect(result.newHp).toBe(50);
    });

    it("should fail when item is not a healing item", () => {
      const item = createMockItem({ category: "capture", effectValue: 50 });
      const ghost = createMockGhost(20, 50);

      const result = applyHealingItem(item, ghost);

      expect(result.success).toBe(false);
      expect(result.healedAmount).toBe(0);
      expect(result.newHp).toBe(20);
    });
  });
});

describe("getCaptureBonus", () => {
  describe("捕獲ボーナス計算", () => {
    it("should return 1.0 for basic capture item (0% bonus)", () => {
      const item = createMockItem({
        id: "ghost-ball",
        category: "capture",
        effectValue: 0,
      });

      const bonus = getCaptureBonus(item);

      expect(bonus).toBe(1.0);
    });

    it("should return 1.5 for super ball (50% bonus)", () => {
      const item = createMockItem({
        id: "super-ball",
        category: "capture",
        effectValue: 50,
      });

      const bonus = getCaptureBonus(item);

      expect(bonus).toBe(1.5);
    });

    it("should return 2.0 for hyper ball (100% bonus)", () => {
      const item = createMockItem({
        id: "hyper-ball",
        category: "capture",
        effectValue: 100,
      });

      const bonus = getCaptureBonus(item);

      expect(bonus).toBe(2.0);
    });

    it("should return 1.0 for non-capture item", () => {
      const item = createMockItem({
        category: "healing",
        effectValue: 30,
      });

      const bonus = getCaptureBonus(item);

      expect(bonus).toBe(1.0);
    });
  });
});
