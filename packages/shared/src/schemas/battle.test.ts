import { describe, expect, it } from "vitest";
import {
  BattleGhostStateSchema,
  BattlePhaseSchema,
  BattleStateSchema,
  StatModifiersSchema,
} from "./battle";

const sampleGhost = {
  id: "ghost-001",
  speciesId: "fireling",
  level: 10,
  experience: 1000,
  currentHp: 45,
  maxHp: 50,
  stats: { hp: 50, attack: 30, defense: 25, speed: 35 },
  moves: [{ moveId: "tackle", currentPP: 30, maxPP: 35 }],
};

describe("StatModifiersSchema", () => {
  it("should accept valid stat modifiers", () => {
    const modifiers = { attack: 2, defense: -1, speed: 0 };
    expect(StatModifiersSchema.parse(modifiers)).toEqual(modifiers);
  });

  it("should reject modifiers outside -6 to 6 range", () => {
    expect(() => StatModifiersSchema.parse({ attack: 7, defense: 0, speed: 0 })).toThrow();
    expect(() => StatModifiersSchema.parse({ attack: 0, defense: -7, speed: 0 })).toThrow();
  });
});

describe("BattleGhostStateSchema", () => {
  it("should accept valid battle ghost state", () => {
    const state = {
      ghost: sampleGhost,
      currentHp: 45,
      statModifiers: { attack: 0, defense: 0, speed: 0 },
    };
    expect(BattleGhostStateSchema.parse(state)).toEqual(state);
  });

  it("should accept battle ghost with modified stats", () => {
    const state = {
      ghost: sampleGhost,
      currentHp: 20,
      statModifiers: { attack: 2, defense: -1, speed: 1 },
    };
    expect(BattleGhostStateSchema.parse(state)).toEqual(state);
  });
});

describe("BattlePhaseSchema", () => {
  it("should accept valid battle phases", () => {
    expect(BattlePhaseSchema.parse("command_select")).toBe("command_select");
    expect(BattlePhaseSchema.parse("move_select")).toBe("move_select");
    expect(BattlePhaseSchema.parse("item_select")).toBe("item_select");
    expect(BattlePhaseSchema.parse("executing")).toBe("executing");
    expect(BattlePhaseSchema.parse("result")).toBe("result");
    expect(BattlePhaseSchema.parse("capture_success")).toBe("capture_success");
  });

  it("should reject invalid phases", () => {
    expect(() => BattlePhaseSchema.parse("invalid")).toThrow();
  });
});

describe("BattleStateSchema", () => {
  it("should accept valid battle state", () => {
    const state = {
      phase: "command_select",
      playerGhost: {
        ghost: sampleGhost,
        currentHp: 45,
        statModifiers: { attack: 0, defense: 0, speed: 0 },
      },
      enemyGhost: {
        ghost: { ...sampleGhost, id: "enemy-001" },
        currentHp: 40,
        statModifiers: { attack: 0, defense: 0, speed: 0 },
      },
      isPlayerTurn: true,
      turnCount: 1,
      messages: ["Battle started!"],
    };
    expect(BattleStateSchema.parse(state)).toEqual(state);
  });
});
