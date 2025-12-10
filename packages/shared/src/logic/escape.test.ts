import { describe, expect, it } from "vitest";
import {
  attemptEscape,
  BASE_ESCAPE_RATE,
  calculateEscapeRate,
  ESCAPE_ATTEMPT_BONUS,
  MAX_ESCAPE_RATE,
  MIN_ESCAPE_RATE,
} from "./escape";

describe("calculateEscapeRate", () => {
  it("should return base rate when speeds are equal", () => {
    const rate = calculateEscapeRate(50, 50);
    expect(rate).toBe(BASE_ESCAPE_RATE);
  });

  it("should increase rate when my speed is higher", () => {
    const rate = calculateEscapeRate(100, 50);
    expect(rate).toBeGreaterThan(BASE_ESCAPE_RATE);
  });

  it("should decrease rate when enemy speed is higher", () => {
    const rate = calculateEscapeRate(50, 100);
    expect(rate).toBeLessThan(BASE_ESCAPE_RATE);
  });

  it("should not go below minimum rate", () => {
    const rate = calculateEscapeRate(10, 200);
    expect(rate).toBe(MIN_ESCAPE_RATE);
  });

  it("should not go above maximum rate", () => {
    const rate = calculateEscapeRate(200, 10);
    expect(rate).toBe(MAX_ESCAPE_RATE);
  });

  it("should increase rate with escape attempts", () => {
    const rate0 = calculateEscapeRate(50, 50, 0);
    const rate1 = calculateEscapeRate(50, 50, 1);
    const rate2 = calculateEscapeRate(50, 50, 2);

    expect(rate1).toBe(rate0 + ESCAPE_ATTEMPT_BONUS);
    expect(rate2).toBe(rate0 + ESCAPE_ATTEMPT_BONUS * 2);
  });

  it("should cap at max rate even with many attempts", () => {
    const rate = calculateEscapeRate(50, 50, 10);
    expect(rate).toBe(MAX_ESCAPE_RATE);
  });

  it("should correctly calculate rate with speed difference of 50", () => {
    // 50 speed difference = 0.5 bonus
    // base 0.5 + 0.5 = 1.0, capped to 0.9
    const rate = calculateEscapeRate(100, 50);
    expect(rate).toBe(MAX_ESCAPE_RATE);
  });

  it("should correctly calculate rate with speed difference of 20", () => {
    // 20 speed difference = 0.2 bonus
    // base 0.5 + 0.2 = 0.7
    const rate = calculateEscapeRate(70, 50);
    expect(rate).toBe(0.7);
  });
});

describe("attemptEscape", () => {
  it("should succeed when roll is below escape rate", () => {
    const result = attemptEscape(50, 50, 0, 0.3);
    expect(result.success).toBe(true);
    expect(result.escapeRate).toBe(BASE_ESCAPE_RATE);
  });

  it("should fail when roll is at or above escape rate", () => {
    const result = attemptEscape(50, 50, 0, 0.5);
    expect(result.success).toBe(false);
  });

  it("should succeed at boundary", () => {
    const result = attemptEscape(50, 50, 0, 0.49);
    expect(result.success).toBe(true);
  });

  it("should include escape rate in result", () => {
    const result = attemptEscape(100, 50, 0, 0);
    expect(result.escapeRate).toBe(MAX_ESCAPE_RATE);
  });

  it("should factor in escape attempts", () => {
    const result0 = attemptEscape(50, 50, 0, 0.55);
    const result1 = attemptEscape(50, 50, 1, 0.55);

    expect(result0.success).toBe(false); // 0.55 >= 0.5
    expect(result1.success).toBe(true); // 0.55 < 0.6
  });

  it("should always fail with roll of 1", () => {
    const result = attemptEscape(200, 10, 10, 1);
    expect(result.success).toBe(false);
  });

  it("should always succeed with roll of 0 (above min rate)", () => {
    const result = attemptEscape(10, 200, 0, 0);
    expect(result.success).toBe(true);
    expect(result.escapeRate).toBe(MIN_ESCAPE_RATE);
  });
});

describe("constants", () => {
  it("should have reasonable base escape rate", () => {
    expect(BASE_ESCAPE_RATE).toBe(0.5);
  });

  it("should have min rate less than max rate", () => {
    expect(MIN_ESCAPE_RATE).toBeLessThan(MAX_ESCAPE_RATE);
  });

  it("should have positive attempt bonus", () => {
    expect(ESCAPE_ATTEMPT_BONUS).toBeGreaterThan(0);
  });
});
