import type { OwnedGhost } from "@ghost-game/shared";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useBattleState } from "./useBattleState";

const createMockPlayerGhost = (): OwnedGhost => ({
  id: "player-ghost-1",
  speciesId: "fireling",
  level: 10,
  experience: 0,
  currentHp: 30,
  maxHp: 30,
  stats: { hp: 30, attack: 20, defense: 15, speed: 25 },
  moves: [
    { moveId: "tackle", currentPP: 35, maxPP: 35 },
    { moveId: "ember", currentPP: 25, maxPP: 25 },
  ],
});

const createMockEnemyGhost = (): OwnedGhost => ({
  id: "enemy-ghost-1",
  speciesId: "spiritpuff",
  level: 8,
  experience: 0,
  currentHp: 25,
  maxHp: 25,
  stats: { hp: 25, attack: 15, defense: 12, speed: 18 },
  moves: [
    { moveId: "tackle", currentPP: 35, maxPP: 35 },
    { moveId: "spirit_wave", currentPP: 20, maxPP: 20 },
  ],
});

describe("useBattleState", () => {
  describe("initial state", () => {
    it("should start with inactive battle", () => {
      const { result } = renderHook(() => useBattleState());
      expect(result.current.state.isActive).toBe(false);
    });

    it("should start with null ghosts", () => {
      const { result } = renderHook(() => useBattleState());
      expect(result.current.state.playerGhost).toBeNull();
      expect(result.current.state.enemyGhost).toBeNull();
    });

    it("should start with command_select phase", () => {
      const { result } = renderHook(() => useBattleState());
      expect(result.current.state.phase).toBe("command_select");
    });

    it("should start with turnCount 1", () => {
      const { result } = renderHook(() => useBattleState());
      expect(result.current.state.turnCount).toBe(1);
    });
  });

  describe("startBattle", () => {
    it("should initialize battle with ghosts", () => {
      const { result } = renderHook(() => useBattleState());
      const playerGhost = createMockPlayerGhost();
      const enemyGhost = createMockEnemyGhost();

      act(() => {
        result.current.startBattle(playerGhost, enemyGhost, "ghost");
      });

      expect(result.current.state.isActive).toBe(true);
      expect(result.current.state.playerGhost?.ghost).toEqual(playerGhost);
      expect(result.current.state.enemyGhost?.ghost).toEqual(enemyGhost);
      expect(result.current.state.phase).toBe("command_select");
    });

    it("should set initial HP from ghost data", () => {
      const { result } = renderHook(() => useBattleState());
      const playerGhost = createMockPlayerGhost();
      const enemyGhost = createMockEnemyGhost();

      act(() => {
        result.current.startBattle(playerGhost, enemyGhost, "ghost");
      });

      expect(result.current.state.playerGhost?.currentHp).toBe(30);
      expect(result.current.state.enemyGhost?.currentHp).toBe(25);
    });

    it("should add encounter message", () => {
      const { result } = renderHook(() => useBattleState());

      act(() => {
        result.current.startBattle(createMockPlayerGhost(), createMockEnemyGhost(), "ghost");
      });

      expect(result.current.state.messages).toContain("野生のspiritpuffが現れた！");
    });
  });

  describe("setPhase", () => {
    it("should change phase", () => {
      const { result } = renderHook(() => useBattleState());

      act(() => {
        result.current.startBattle(createMockPlayerGhost(), createMockEnemyGhost(), "ghost");
      });

      act(() => {
        result.current.setPhase("move_select");
      });

      expect(result.current.state.phase).toBe("move_select");
    });
  });

  describe("executePlayerAction - attack", () => {
    it("should deal damage to enemy", () => {
      const { result } = renderHook(() => useBattleState());

      act(() => {
        result.current.startBattle(createMockPlayerGhost(), createMockEnemyGhost(), "ghost");
      });

      const initialEnemyHp = result.current.state.enemyGhost?.currentHp ?? 0;

      act(() => {
        result.current.executePlayerAction(
          { type: "attack", moveIndex: 0 },
          "fire",
          "ghost",
          { critical: 0.5 }, // No critical
        );
      });

      const newEnemyHp = result.current.state.enemyGhost?.currentHp ?? 0;
      expect(newEnemyHp).toBeLessThan(initialEnemyHp);
    });

    it("should increment turn count after action", () => {
      const { result } = renderHook(() => useBattleState());

      act(() => {
        result.current.startBattle(createMockPlayerGhost(), createMockEnemyGhost(), "ghost");
      });

      expect(result.current.state.turnCount).toBe(1);

      act(() => {
        result.current.executePlayerAction({ type: "attack", moveIndex: 0 }, "fire", "ghost");
      });

      expect(result.current.state.turnCount).toBe(2);
    });

    it("should end battle when enemy HP reaches 0", () => {
      const { result } = renderHook(() => useBattleState());
      const weakEnemy: OwnedGhost = {
        ...createMockEnemyGhost(),
        currentHp: 1,
        stats: { hp: 25, attack: 15, defense: 1, speed: 5 }, // Very low defense, low speed
      };

      act(() => {
        result.current.startBattle(createMockPlayerGhost(), weakEnemy, "ghost");
      });

      let turnResult: ReturnType<typeof result.current.executePlayerAction>;
      act(() => {
        turnResult = result.current.executePlayerAction(
          { type: "attack", moveIndex: 0 },
          "fire",
          "ghost",
          { critical: 0.5 },
        );
      });

      expect(turnResult!.battleEnded).toBe(true);
      expect(turnResult!.endReason).toBe("player_win");
      expect(result.current.state.phase).toBe("result");
    });

    it("should end battle when player HP reaches 0", () => {
      const { result } = renderHook(() => useBattleState());
      const weakPlayer: OwnedGhost = {
        ...createMockPlayerGhost(),
        currentHp: 1,
        stats: { hp: 30, attack: 20, defense: 1, speed: 5 }, // Very low defense, low speed
      };
      const strongEnemy: OwnedGhost = {
        ...createMockEnemyGhost(),
        stats: { hp: 25, attack: 100, defense: 12, speed: 100 }, // High attack, high speed
      };

      act(() => {
        result.current.startBattle(weakPlayer, strongEnemy, "ghost");
      });

      let turnResult: ReturnType<typeof result.current.executePlayerAction>;
      act(() => {
        turnResult = result.current.executePlayerAction(
          { type: "attack", moveIndex: 0 },
          "fire",
          "ghost",
          { critical: 0.5 },
        );
      });

      expect(turnResult!.battleEnded).toBe(true);
      expect(turnResult!.endReason).toBe("player_lose");
    });
  });

  describe("executePlayerAction - escape", () => {
    it("should escape successfully with low random value", () => {
      const { result } = renderHook(() => useBattleState());

      act(() => {
        result.current.startBattle(createMockPlayerGhost(), createMockEnemyGhost(), "ghost");
      });

      let turnResult: ReturnType<typeof result.current.executePlayerAction>;
      act(() => {
        turnResult = result.current.executePlayerAction({ type: "escape" }, "fire", "ghost", {
          escape: 0.1,
        }); // Low value = success
      });

      expect(turnResult!.battleEnded).toBe(true);
      expect(turnResult!.endReason).toBe("escape");
      expect(turnResult!.playerActionMessage).toContain("逃げ切った");
    });

    it("should fail escape with high random value", () => {
      const { result } = renderHook(() => useBattleState());

      act(() => {
        result.current.startBattle(createMockPlayerGhost(), createMockEnemyGhost(), "ghost");
      });

      let turnResult: ReturnType<typeof result.current.executePlayerAction>;
      act(() => {
        turnResult = result.current.executePlayerAction({ type: "escape" }, "fire", "ghost", {
          escape: 0.9,
        }); // High value = fail
      });

      expect(turnResult!.battleEnded).toBe(false);
      expect(turnResult!.playerActionMessage).toContain("逃げられなかった");
    });

    it("should increment escape attempts on failed escape", () => {
      const { result } = renderHook(() => useBattleState());

      act(() => {
        result.current.startBattle(createMockPlayerGhost(), createMockEnemyGhost(), "ghost");
      });

      expect(result.current.state.escapeAttempts).toBe(0);

      act(() => {
        result.current.executePlayerAction({ type: "escape" }, "fire", "ghost", { escape: 0.9 });
      });

      expect(result.current.state.escapeAttempts).toBe(1);
    });
  });

  describe("executePlayerAction - capture", () => {
    it("should capture successfully with low random value and low HP enemy", () => {
      const { result } = renderHook(() => useBattleState());
      const weakEnemy: OwnedGhost = {
        ...createMockEnemyGhost(),
        currentHp: 1, // Very low HP
      };

      act(() => {
        result.current.startBattle(createMockPlayerGhost(), weakEnemy, "ghost");
      });

      let turnResult: ReturnType<typeof result.current.executePlayerAction>;
      act(() => {
        turnResult = result.current.executePlayerAction(
          { type: "capture", itemBonus: 50 }, // Great ball
          "fire",
          "ghost",
          { capture: 0.1 }, // Low random = success
        );
      });

      expect(turnResult!.battleEnded).toBe(true);
      expect(turnResult!.endReason).toBe("capture");
      expect(turnResult!.playerActionMessage).toContain("捕まえた");
    });

    it("should fail capture with high random value", () => {
      const { result } = renderHook(() => useBattleState());

      act(() => {
        result.current.startBattle(createMockPlayerGhost(), createMockEnemyGhost(), "ghost");
      });

      let turnResult: ReturnType<typeof result.current.executePlayerAction>;
      act(() => {
        turnResult = result.current.executePlayerAction(
          { type: "capture", itemBonus: 0 },
          "fire",
          "ghost",
          { capture: 0.99 }, // High random = fail
        );
      });

      expect(turnResult!.battleEnded).toBe(false);
      expect(turnResult!.playerActionMessage).toContain("失敗");
    });

    it("should always capture with master ball (100 bonus)", () => {
      const { result } = renderHook(() => useBattleState());

      act(() => {
        result.current.startBattle(createMockPlayerGhost(), createMockEnemyGhost(), "ghost");
      });

      let turnResult: ReturnType<typeof result.current.executePlayerAction>;
      act(() => {
        turnResult = result.current.executePlayerAction(
          { type: "capture", itemBonus: 100 }, // Master ball
          "fire",
          "ghost",
          { capture: 0.99 }, // Even high random should succeed
        );
      });

      expect(turnResult!.battleEnded).toBe(true);
      expect(turnResult!.endReason).toBe("capture");
    });
  });

  describe("addMessage and clearMessages", () => {
    it("should add messages", () => {
      const { result } = renderHook(() => useBattleState());

      act(() => {
        result.current.addMessage("テストメッセージ1");
        result.current.addMessage("テストメッセージ2");
      });

      expect(result.current.state.messages).toContain("テストメッセージ1");
      expect(result.current.state.messages).toContain("テストメッセージ2");
    });

    it("should clear messages", () => {
      const { result } = renderHook(() => useBattleState());

      act(() => {
        result.current.addMessage("テストメッセージ");
      });

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.state.messages).toEqual([]);
    });
  });

  describe("endBattle", () => {
    it("should set isActive to false", () => {
      const { result } = renderHook(() => useBattleState());

      act(() => {
        result.current.startBattle(createMockPlayerGhost(), createMockEnemyGhost(), "ghost");
      });

      expect(result.current.state.isActive).toBe(true);

      act(() => {
        result.current.endBattle();
      });

      expect(result.current.state.isActive).toBe(false);
      expect(result.current.state.phase).toBe("result");
    });
  });

  describe("reset", () => {
    it("should reset to initial state", () => {
      const { result } = renderHook(() => useBattleState());

      act(() => {
        result.current.startBattle(createMockPlayerGhost(), createMockEnemyGhost(), "ghost");
        result.current.addMessage("テストメッセージ");
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.state.isActive).toBe(false);
      expect(result.current.state.playerGhost).toBeNull();
      expect(result.current.state.enemyGhost).toBeNull();
      expect(result.current.state.turnCount).toBe(1);
      expect(result.current.state.messages).toEqual([]);
    });
  });
});
