import { describe, expect, it } from "vitest";
import {
  createInitialGhost,
  INITIAL_ITEMS,
  INITIAL_POSITION,
  initializePlayer,
  STARTER_GHOST_CONFIG,
} from "./playerInit";

describe("playerInit", () => {
  describe("STARTER_GHOST_CONFIG", () => {
    it("should have default starter ghost species as spiritpuff", () => {
      expect(STARTER_GHOST_CONFIG.speciesId).toBe("spiritpuff");
    });

    it("should have starter ghost level as 5", () => {
      expect(STARTER_GHOST_CONFIG.level).toBe(5);
    });
  });

  describe("INITIAL_ITEMS", () => {
    it("should include ghost balls", () => {
      const ghostBall = INITIAL_ITEMS.find((item) => item.itemId === "ghostBall");
      expect(ghostBall).toBeDefined();
      expect(ghostBall?.quantity).toBe(5);
    });

    it("should include potions", () => {
      const potion = INITIAL_ITEMS.find((item) => item.itemId === "potion");
      expect(potion).toBeDefined();
      expect(potion?.quantity).toBe(3);
    });
  });

  describe("INITIAL_POSITION", () => {
    it("should have correct start position", () => {
      expect(INITIAL_POSITION.mapId).toBe("map-001");
      expect(INITIAL_POSITION.x).toBe(5);
      expect(INITIAL_POSITION.y).toBe(5);
    });
  });

  describe("createInitialGhost", () => {
    it("should create a ghost with correct species", () => {
      const speciesData = {
        id: "spiritpuff",
        baseHp: 60,
        baseAttack: 45,
        baseDefense: 50,
        baseSpeed: 55,
      };
      const learnableMoves = [
        { moveId: "tackle", level: 1, pp: 35 },
        { moveId: "scratch", level: 1, pp: 35 },
      ];

      const ghost = createInitialGhost(speciesData, learnableMoves, 5);

      expect(ghost.speciesId).toBe("spiritpuff");
      expect(ghost.level).toBe(5);
    });

    it("should calculate stats based on level", () => {
      const speciesData = {
        id: "spiritpuff",
        baseHp: 60,
        baseAttack: 45,
        baseDefense: 50,
        baseSpeed: 55,
      };
      const learnableMoves = [{ moveId: "tackle", level: 1, pp: 35 }];

      const ghost = createInitialGhost(speciesData, learnableMoves, 5);

      // Level 5 stats calculation: floor((2 * base * 5) / 100) + 5 or +15 for HP
      expect(ghost.stats.hp).toBeGreaterThan(0);
      expect(ghost.stats.attack).toBeGreaterThan(0);
      expect(ghost.stats.defense).toBeGreaterThan(0);
      expect(ghost.stats.speed).toBeGreaterThan(0);
    });

    it("should have full HP at creation", () => {
      const speciesData = {
        id: "spiritpuff",
        baseHp: 60,
        baseAttack: 45,
        baseDefense: 50,
        baseSpeed: 55,
      };
      const learnableMoves = [{ moveId: "tackle", level: 1, pp: 35 }];

      const ghost = createInitialGhost(speciesData, learnableMoves, 5);

      expect(ghost.currentHp).toBe(ghost.maxHp);
    });

    it("should have level 1 moves", () => {
      const speciesData = {
        id: "spiritpuff",
        baseHp: 60,
        baseAttack: 45,
        baseDefense: 50,
        baseSpeed: 55,
      };
      const learnableMoves = [
        { moveId: "tackle", level: 1, pp: 35 },
        { moveId: "scratch", level: 1, pp: 35 },
        { moveId: "slam", level: 5, pp: 20 },
        { moveId: "bigSlam", level: 10, pp: 15 },
      ];

      const ghost = createInitialGhost(speciesData, learnableMoves, 5);

      // Should have moves learnable at level 5 or below
      expect(ghost.moves.length).toBeLessThanOrEqual(4);
      expect(ghost.moves.some((m) => m.moveId === "tackle")).toBe(true);
      expect(ghost.moves.some((m) => m.moveId === "scratch")).toBe(true);
    });

    it("should limit moves to maximum 4", () => {
      const speciesData = {
        id: "spiritpuff",
        baseHp: 60,
        baseAttack: 45,
        baseDefense: 50,
        baseSpeed: 55,
      };
      const learnableMoves = [
        { moveId: "move1", level: 1, pp: 35 },
        { moveId: "move2", level: 1, pp: 35 },
        { moveId: "move3", level: 1, pp: 35 },
        { moveId: "move4", level: 1, pp: 35 },
        { moveId: "move5", level: 1, pp: 35 },
      ];

      const ghost = createInitialGhost(speciesData, learnableMoves, 5);

      expect(ghost.moves.length).toBeLessThanOrEqual(4);
    });
  });

  describe("initializePlayer", () => {
    it("should be a function that accepts db and clerkUserId", () => {
      // initializePlayer関数が正しいシグネチャを持つことを確認
      expect(typeof initializePlayer).toBe("function");
      expect(initializePlayer.length).toBe(2); // 2つの引数を受け取る
    });

    it("should return a promise", () => {
      // 関数が非同期であることを確認（実際のDB呼び出しはintegration testで行う）
      const mockDB = {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([{ id: "existing" }]),
            }),
          }),
        }),
      };

      const result = initializePlayer(mockDB as never, "test_user");
      expect(result).toBeInstanceOf(Promise);
    });
  });
});
