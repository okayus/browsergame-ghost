import { describe, expect, it } from "vitest";
import {
  CRITICAL_HIT_RATE,
  CRITICAL_MULTIPLIER,
  calculateBaseDamage,
  calculateDamage,
  getStabBonus,
  isCriticalHit,
  MIN_DAMAGE,
  STAB_MULTIPLIER,
} from "./damage";

describe("isCriticalHit", () => {
  it("should return true when random value is below critical rate", () => {
    expect(isCriticalHit(0)).toBe(true);
    expect(isCriticalHit(CRITICAL_HIT_RATE - 0.001)).toBe(true);
  });

  it("should return false when random value is at or above critical rate", () => {
    expect(isCriticalHit(CRITICAL_HIT_RATE)).toBe(false);
    expect(isCriticalHit(0.5)).toBe(false);
    expect(isCriticalHit(1)).toBe(false);
  });
});

describe("getStabBonus", () => {
  it("should return STAB_MULTIPLIER when types match", () => {
    expect(getStabBonus("fire", "fire")).toBe(STAB_MULTIPLIER);
    expect(getStabBonus("water", "water")).toBe(STAB_MULTIPLIER);
    expect(getStabBonus("ghost", "ghost")).toBe(STAB_MULTIPLIER);
  });

  it("should return 1.0 when types do not match", () => {
    expect(getStabBonus("fire", "water")).toBe(1.0);
    expect(getStabBonus("grass", "electric")).toBe(1.0);
    expect(getStabBonus("normal", "ghost")).toBe(1.0);
  });
});

describe("calculateBaseDamage", () => {
  it("should calculate base damage correctly", () => {
    // Level 10, Power 40, Attack 50, Defense 50
    const damage = calculateBaseDamage(10, 40, 50, 50);
    // ((2*10/5+2) * 40 * 50 / 50) / 50 + 2 = (6 * 40) / 50 + 2 = 4.8 + 2 = 6.8 -> 6
    expect(damage).toBe(6);
  });

  it("should increase damage with higher level", () => {
    const lowLevel = calculateBaseDamage(5, 40, 50, 50);
    const highLevel = calculateBaseDamage(20, 40, 50, 50);
    expect(highLevel).toBeGreaterThan(lowLevel);
  });

  it("should increase damage with higher power", () => {
    const lowPower = calculateBaseDamage(10, 40, 50, 50);
    const highPower = calculateBaseDamage(10, 80, 50, 50);
    expect(highPower).toBeGreaterThan(lowPower);
  });

  it("should increase damage with higher attack", () => {
    const lowAttack = calculateBaseDamage(10, 40, 30, 50);
    const highAttack = calculateBaseDamage(10, 40, 70, 50);
    expect(highAttack).toBeGreaterThan(lowAttack);
  });

  it("should decrease damage with higher defense", () => {
    const lowDefense = calculateBaseDamage(10, 40, 50, 30);
    const highDefense = calculateBaseDamage(10, 40, 50, 70);
    expect(lowDefense).toBeGreaterThan(highDefense);
  });
});

describe("calculateDamage", () => {
  const baseParams = {
    movePower: 40,
    moveType: "fire" as const,
    attackerAttack: 50,
    attackerType: "fire" as const,
    attackerLevel: 10,
    defenderDefense: 50,
    defenderType: "grass" as const,
  };

  it("should return damage with effectiveness info", () => {
    const result = calculateDamage(baseParams, 1); // No critical
    expect(result.damage).toBeGreaterThan(0);
    expect(result.effectiveness).toBe(2); // fire vs grass = super effective
    expect(result.isCritical).toBe(false);
  });

  it("should return 0 damage when effectiveness is 0", () => {
    const params = {
      ...baseParams,
      moveType: "normal" as const,
      attackerType: "normal" as const,
      defenderType: "ghost" as const,
    };
    const result = calculateDamage(params, 0); // Would be critical, but no effect
    expect(result.damage).toBe(0);
    expect(result.effectiveness).toBe(0);
    expect(result.isCritical).toBe(false); // Critical is not applied when no effect
  });

  it("should apply critical hit multiplier", () => {
    const normalResult = calculateDamage(baseParams, 1); // No critical
    const criticalResult = calculateDamage(baseParams, 0); // Critical

    expect(criticalResult.isCritical).toBe(true);
    expect(normalResult.isCritical).toBe(false);
    expect(criticalResult.damage).toBeGreaterThan(normalResult.damage);
  });

  it("should apply STAB bonus when types match", () => {
    const withStab = calculateDamage(baseParams, 1); // fire move, fire attacker

    const withoutStab = calculateDamage(
      {
        ...baseParams,
        attackerType: "water" as const, // Different type
      },
      1,
    );

    expect(withStab.damage).toBeGreaterThan(withoutStab.damage);
  });

  it("should apply type effectiveness", () => {
    // Super effective (2x)
    const superEffective = calculateDamage(
      {
        ...baseParams,
        moveType: "fire" as const,
        defenderType: "grass" as const,
      },
      1,
    );

    // Not very effective (0.5x)
    const notVeryEffective = calculateDamage(
      {
        ...baseParams,
        moveType: "fire" as const,
        defenderType: "water" as const,
      },
      1,
    );

    // Normal (1x)
    const normalEffective = calculateDamage(
      {
        ...baseParams,
        moveType: "fire" as const,
        defenderType: "normal" as const,
      },
      1,
    );

    expect(superEffective.effectiveness).toBe(2);
    expect(notVeryEffective.effectiveness).toBe(0.5);
    expect(normalEffective.effectiveness).toBe(1);

    expect(superEffective.damage).toBeGreaterThan(normalEffective.damage);
    expect(normalEffective.damage).toBeGreaterThan(notVeryEffective.damage);
  });

  it("should guarantee minimum damage when not immune", () => {
    const weakParams = {
      movePower: 10,
      moveType: "normal" as const,
      attackerAttack: 10,
      attackerType: "water" as const, // No STAB
      attackerLevel: 1,
      defenderDefense: 100,
      defenderType: "normal" as const, // 1x effectiveness
    };

    const result = calculateDamage(weakParams, 1);
    expect(result.damage).toBeGreaterThanOrEqual(MIN_DAMAGE);
  });

  it("should handle ghost vs ghost (super effective)", () => {
    const params = {
      ...baseParams,
      moveType: "ghost" as const,
      attackerType: "ghost" as const,
      defenderType: "ghost" as const,
    };
    const result = calculateDamage(params, 1);
    expect(result.effectiveness).toBe(2);
    expect(result.damage).toBeGreaterThan(0);
  });
});

describe("constants", () => {
  it("should have reasonable critical hit rate", () => {
    expect(CRITICAL_HIT_RATE).toBeGreaterThan(0);
    expect(CRITICAL_HIT_RATE).toBeLessThan(1);
  });

  it("should have critical multiplier greater than 1", () => {
    expect(CRITICAL_MULTIPLIER).toBeGreaterThan(1);
  });

  it("should have STAB multiplier greater than 1", () => {
    expect(STAB_MULTIPLIER).toBeGreaterThan(1);
  });

  it("should have minimum damage of 1", () => {
    expect(MIN_DAMAGE).toBe(1);
  });
});
