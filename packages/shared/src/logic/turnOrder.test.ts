import { describe, expect, it } from "vitest";
import { determineTurnOrder, goesFirst } from "./turnOrder";

describe("determineTurnOrder", () => {
  it("should return player first when player is faster", () => {
    const result = determineTurnOrder(100, 50);
    expect(result.first).toBe("player");
    expect(result.second).toBe("enemy");
    expect(result.wasSpeedTie).toBe(false);
  });

  it("should return enemy first when enemy is faster", () => {
    const result = determineTurnOrder(50, 100);
    expect(result.first).toBe("enemy");
    expect(result.second).toBe("player");
    expect(result.wasSpeedTie).toBe(false);
  });

  it("should return player first on speed tie when tieBreaker < 0.5", () => {
    const result = determineTurnOrder(50, 50, 0.4);
    expect(result.first).toBe("player");
    expect(result.second).toBe("enemy");
    expect(result.wasSpeedTie).toBe(true);
  });

  it("should return enemy first on speed tie when tieBreaker >= 0.5", () => {
    const result = determineTurnOrder(50, 50, 0.5);
    expect(result.first).toBe("enemy");
    expect(result.second).toBe("player");
    expect(result.wasSpeedTie).toBe(true);
  });

  it("should handle edge case of zero speed", () => {
    const result = determineTurnOrder(0, 0, 0.3);
    expect(result.wasSpeedTie).toBe(true);
  });

  it("should handle very high speed values", () => {
    const result = determineTurnOrder(999, 998);
    expect(result.first).toBe("player");
    expect(result.wasSpeedTie).toBe(false);
  });

  it("should handle speed difference of 1", () => {
    const result = determineTurnOrder(51, 50);
    expect(result.first).toBe("player");
    expect(result.wasSpeedTie).toBe(false);
  });
});

describe("goesFirst", () => {
  it("should return true when my speed is higher", () => {
    expect(goesFirst(100, 50)).toBe(true);
  });

  it("should return false when my speed is lower", () => {
    expect(goesFirst(50, 100)).toBe(false);
  });

  it("should return true on speed tie when tieBreaker < 0.5", () => {
    expect(goesFirst(50, 50, 0.4)).toBe(true);
  });

  it("should return false on speed tie when tieBreaker >= 0.5", () => {
    expect(goesFirst(50, 50, 0.5)).toBe(false);
  });

  it("should handle equal speeds with boundary tieBreaker values", () => {
    expect(goesFirst(50, 50, 0)).toBe(true);
    expect(goesFirst(50, 50, 0.49)).toBe(true);
    expect(goesFirst(50, 50, 0.5)).toBe(false);
    expect(goesFirst(50, 50, 1)).toBe(false);
  });
});
