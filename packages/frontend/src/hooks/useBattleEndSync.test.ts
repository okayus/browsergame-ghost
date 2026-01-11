import type { OwnedGhost, Party } from "@ghost-game/shared";
import { describe, expect, it } from "vitest";
import { syncPartyHpAfterBattle } from "./useBattleEndSync";
import type { BattleEndReason, BattleState } from "./useBattleState";

const createMockGhost = (id: string, currentHp: number, maxHp: number): OwnedGhost => ({
  id,
  speciesId: "fireling",
  level: 5,
  experience: 0,
  currentHp,
  maxHp,
  stats: { hp: maxHp, attack: 10, defense: 8, speed: 12 },
  moves: [],
});

const createMockParty = (ghosts: OwnedGhost[]): Party => ({
  ghosts,
});

const createMockBattleState = (
  playerCurrentHp: number,
  playerMaxHp: number,
  endReason: BattleEndReason | null,
): BattleState => ({
  phase: "result",
  playerGhost: {
    ghost: createMockGhost("ghost-1", playerMaxHp, playerMaxHp),
    currentHp: playerCurrentHp,
    statModifiers: { attack: 0, defense: 0, speed: 0 },
  },
  enemyGhost: {
    ghost: createMockGhost("enemy-1", 20, 20),
    currentHp: 0,
    statModifiers: { attack: 0, defense: 0, speed: 0 },
  },
  turnCount: 5,
  escapeAttempts: 0,
  messages: [],
  isActive: false,
  endReason,
});

describe("syncPartyHpAfterBattle", () => {
  describe("player_win", () => {
    it("should update party ghost HP to battle HP on victory", () => {
      const party = createMockParty([
        createMockGhost("ghost-1", 50, 50),
        createMockGhost("ghost-2", 40, 40),
      ]);
      const battleState = createMockBattleState(30, 50, "player_win");

      const result = syncPartyHpAfterBattle(battleState, "player_win", party, "ghost-1");

      expect(result.updatedParty.ghosts[0].currentHp).toBe(30);
      expect(result.updatedParty.ghosts[1].currentHp).toBe(40); // unchanged
    });
  });

  describe("escape", () => {
    it("should update party ghost HP to battle HP on escape", () => {
      const party = createMockParty([createMockGhost("ghost-1", 50, 50)]);
      const battleState = createMockBattleState(25, 50, "escape");

      const result = syncPartyHpAfterBattle(battleState, "escape", party, "ghost-1");

      expect(result.updatedParty.ghosts[0].currentHp).toBe(25);
    });
  });

  describe("capture", () => {
    it("should update party ghost HP to battle HP on capture", () => {
      const party = createMockParty([createMockGhost("ghost-1", 50, 50)]);
      const battleState = createMockBattleState(35, 50, "capture");

      const result = syncPartyHpAfterBattle(battleState, "capture", party, "ghost-1");

      expect(result.updatedParty.ghosts[0].currentHp).toBe(35);
    });
  });

  describe("player_lose", () => {
    it("should restore all party ghosts to max HP on defeat", () => {
      const party = createMockParty([
        createMockGhost("ghost-1", 10, 50),
        createMockGhost("ghost-2", 5, 40),
        createMockGhost("ghost-3", 0, 30),
      ]);
      const battleState = createMockBattleState(0, 50, "player_lose");

      const result = syncPartyHpAfterBattle(battleState, "player_lose", party, "ghost-1");

      expect(result.updatedParty.ghosts[0].currentHp).toBe(50);
      expect(result.updatedParty.ghosts[1].currentHp).toBe(40);
      expect(result.updatedParty.ghosts[2].currentHp).toBe(30);
    });
  });

  describe("edge cases", () => {
    it("should handle null playerGhost in battleState", () => {
      const party = createMockParty([createMockGhost("ghost-1", 50, 50)]);
      const battleState: BattleState = {
        phase: "result",
        playerGhost: null,
        enemyGhost: null,
        turnCount: 1,
        escapeAttempts: 0,
        messages: [],
        isActive: false,
        endReason: "player_win",
      };

      const result = syncPartyHpAfterBattle(battleState, "player_win", party, "ghost-1");

      // Should not crash and return unchanged party
      expect(result.updatedParty.ghosts[0].currentHp).toBe(50);
    });

    it("should handle ghost not found in party", () => {
      const party = createMockParty([createMockGhost("ghost-2", 50, 50)]);
      const battleState = createMockBattleState(30, 50, "player_win");

      const result = syncPartyHpAfterBattle(battleState, "player_win", party, "ghost-1");

      // Should not crash and return unchanged party
      expect(result.updatedParty.ghosts[0].currentHp).toBe(50);
    });

    it("should return saveRequired true for all end reasons", () => {
      const party = createMockParty([createMockGhost("ghost-1", 50, 50)]);

      const winResult = syncPartyHpAfterBattle(
        createMockBattleState(30, 50, "player_win"),
        "player_win",
        party,
        "ghost-1",
      );
      expect(winResult.saveRequired).toBe(true);

      const loseResult = syncPartyHpAfterBattle(
        createMockBattleState(0, 50, "player_lose"),
        "player_lose",
        party,
        "ghost-1",
      );
      expect(loseResult.saveRequired).toBe(true);

      const escapeResult = syncPartyHpAfterBattle(
        createMockBattleState(25, 50, "escape"),
        "escape",
        party,
        "ghost-1",
      );
      expect(escapeResult.saveRequired).toBe(true);

      const captureResult = syncPartyHpAfterBattle(
        createMockBattleState(35, 50, "capture"),
        "capture",
        party,
        "ghost-1",
      );
      expect(captureResult.saveRequired).toBe(true);
    });
  });
});
