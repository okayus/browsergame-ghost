import { describe, expect, it } from "vitest";
import {
  attemptCapture,
  BASE_CAPTURE_RATE,
  calculateCaptureRate,
  HP_BONUS_MAX,
  MAX_CAPTURE_RATE,
  MIN_CAPTURE_RATE,
} from "./capture";

describe("calculateCaptureRate", () => {
  it("should return base rate when HP is full and no item bonus", () => {
    const rate = calculateCaptureRate(100, 100, 0);
    expect(rate).toBe(BASE_CAPTURE_RATE);
  });

  it("should increase rate when HP is reduced", () => {
    const fullHp = calculateCaptureRate(100, 100, 0);
    const halfHp = calculateCaptureRate(50, 100, 0);
    const lowHp = calculateCaptureRate(10, 100, 0);

    expect(halfHp).toBeGreaterThan(fullHp);
    expect(lowHp).toBeGreaterThan(halfHp);
  });

  it("should return base + max HP bonus when HP is 0", () => {
    const rate = calculateCaptureRate(0, 100, 0);
    expect(rate).toBe(BASE_CAPTURE_RATE + HP_BONUS_MAX);
  });

  it("should increase rate with item bonus", () => {
    const noBonus = calculateCaptureRate(100, 100, 0);
    const withBonus = calculateCaptureRate(100, 100, 20);

    expect(withBonus).toBe(noBonus + 0.2);
  });

  it("should return 1.0 for master ball (100% bonus)", () => {
    const rate = calculateCaptureRate(100, 100, 100);
    expect(rate).toBe(1.0);
  });

  it("should not go below minimum rate", () => {
    // This shouldn't happen in practice, but test the boundary
    const rate = calculateCaptureRate(100, 100, -50);
    expect(rate).toBe(MIN_CAPTURE_RATE);
  });

  it("should not go above maximum rate (except master ball)", () => {
    const rate = calculateCaptureRate(1, 100, 80);
    expect(rate).toBe(MAX_CAPTURE_RATE);
  });

  // NOTE: toBeCloseTo を使用している理由:
  // JavaScriptの浮動小数点演算では、0.1 + 0.2 = 0.30000000000000004 のような
  // 誤差が発生するため、toBe での厳密比較ではなく toBeCloseTo で近似比較を行う
  it("should calculate correctly for ghost ball (0% bonus)", () => {
    const rate = calculateCaptureRate(50, 100, 0);
    // base 0.1 + (0.5 * 0.4) = 0.1 + 0.2 = 0.3
    expect(rate).toBeCloseTo(0.3);
  });

  it("should calculate correctly for super ball (20% bonus)", () => {
    const rate = calculateCaptureRate(50, 100, 20);
    // base 0.1 + (0.5 * 0.4) + 0.2 = 0.1 + 0.2 + 0.2 = 0.5
    expect(rate).toBeCloseTo(0.5);
  });

  it("should calculate correctly for hyper ball (40% bonus)", () => {
    const rate = calculateCaptureRate(50, 100, 40);
    // base 0.1 + (0.5 * 0.4) + 0.4 = 0.1 + 0.2 + 0.4 = 0.7
    expect(rate).toBeCloseTo(0.7);
  });

  it("should handle HP greater than max (edge case)", () => {
    const rate = calculateCaptureRate(150, 100, 0);
    // Should treat as full HP
    expect(rate).toBe(BASE_CAPTURE_RATE);
  });
});

describe("attemptCapture", () => {
  it("should succeed when roll is below capture rate", () => {
    const result = attemptCapture(50, 100, 0, 0.2);
    expect(result.success).toBe(true);
  });

  it("should fail when roll is at or above capture rate", () => {
    const result = attemptCapture(100, 100, 0, 0.1);
    expect(result.success).toBe(false);
  });

  it("should always succeed with master ball", () => {
    const result = attemptCapture(100, 100, 100, 0.99);
    expect(result.success).toBe(true);
    expect(result.captureRate).toBe(1.0);
  });

  it("should include capture rate in result", () => {
    const result = attemptCapture(50, 100, 20, 0);
    expect(result.captureRate).toBe(0.5);
  });

  it("should succeed at boundary", () => {
    const result = attemptCapture(100, 100, 0, 0.09);
    expect(result.success).toBe(true);
  });

  it("should fail at boundary", () => {
    const result = attemptCapture(100, 100, 0, 0.1);
    expect(result.success).toBe(false);
  });

  it("should be easier to capture low HP ghost", () => {
    const fullHpResult = attemptCapture(100, 100, 0, 0.3);
    const lowHpResult = attemptCapture(10, 100, 0, 0.3);

    expect(fullHpResult.success).toBe(false);
    expect(lowHpResult.success).toBe(true);
  });
});

describe("constants", () => {
  it("should have reasonable base capture rate", () => {
    expect(BASE_CAPTURE_RATE).toBe(0.1);
  });

  it("should have HP bonus that makes low HP easier to catch", () => {
    expect(HP_BONUS_MAX).toBeGreaterThan(0);
  });

  it("should have min rate less than max rate", () => {
    expect(MIN_CAPTURE_RATE).toBeLessThan(MAX_CAPTURE_RATE);
  });

  it("should have max rate less than 1 (except master ball)", () => {
    expect(MAX_CAPTURE_RATE).toBeLessThan(1);
  });
});
