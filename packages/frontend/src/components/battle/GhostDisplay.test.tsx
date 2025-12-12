import type { BattleGhostState } from "@ghost-game/shared";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GhostDisplay } from "./GhostDisplay";

const createMockGhostState = (currentHp = 25, maxHp = 30): BattleGhostState => ({
  ghost: {
    id: "ghost-1",
    speciesId: "fireling",
    level: 10,
    experience: 0,
    currentHp: maxHp,
    maxHp: maxHp,
    stats: { hp: maxHp, attack: 20, defense: 15, speed: 25 },
    moves: [
      { moveId: "tackle", currentPP: 35, maxPP: 35 },
      { moveId: "ember", currentPP: 25, maxPP: 25 },
    ],
  },
  currentHp: currentHp,
  statModifiers: { attack: 0, defense: 0, speed: 0 },
});

describe("GhostDisplay", () => {
  describe("rendering", () => {
    it("should render player ghost display", () => {
      render(<GhostDisplay ghostState={createMockGhostState()} isEnemy={false} />);

      expect(screen.getByTestId("player-ghost-display")).toBeInTheDocument();
    });

    it("should render enemy ghost display", () => {
      render(<GhostDisplay ghostState={createMockGhostState()} isEnemy={true} />);

      expect(screen.getByTestId("enemy-ghost-display")).toBeInTheDocument();
    });

    it("should display ghost name", () => {
      render(<GhostDisplay ghostState={createMockGhostState()} isEnemy={false} />);

      expect(screen.getByTestId("ghost-name")).toHaveTextContent("fireling");
    });

    it("should display ghost level", () => {
      render(<GhostDisplay ghostState={createMockGhostState()} isEnemy={false} />);

      expect(screen.getByTestId("ghost-level")).toHaveTextContent("Lv.10");
    });

    it("should display ghost type when provided", () => {
      render(<GhostDisplay ghostState={createMockGhostState()} isEnemy={false} ghostType="fire" />);

      expect(screen.getByTestId("ghost-type")).toHaveTextContent("fire");
    });

    it("should not display ghost type when not provided", () => {
      render(<GhostDisplay ghostState={createMockGhostState()} isEnemy={false} />);

      expect(screen.queryByTestId("ghost-type")).not.toBeInTheDocument();
    });

    it("should display HP text", () => {
      render(<GhostDisplay ghostState={createMockGhostState(25, 30)} isEnemy={false} />);

      expect(screen.getByTestId("hp-text")).toHaveTextContent("25 / 30");
    });

    it("should render HP bar", () => {
      render(<GhostDisplay ghostState={createMockGhostState()} isEnemy={false} />);

      expect(screen.getByTestId("hp-bar")).toBeInTheDocument();
    });

    it("should render ghost sprite", () => {
      render(<GhostDisplay ghostState={createMockGhostState()} isEnemy={false} />);

      expect(screen.getByTestId("ghost-sprite")).toBeInTheDocument();
    });
  });

  describe("HP bar colors", () => {
    it("should show green HP bar when HP > 50%", () => {
      render(<GhostDisplay ghostState={createMockGhostState(20, 30)} isEnemy={false} />);

      const hpBar = screen.getByTestId("hp-bar");
      expect(hpBar).toHaveClass("bg-green-500");
    });

    it("should show yellow HP bar when HP > 25% and <= 50%", () => {
      render(<GhostDisplay ghostState={createMockGhostState(10, 30)} isEnemy={false} />);

      const hpBar = screen.getByTestId("hp-bar");
      expect(hpBar).toHaveClass("bg-yellow-500");
    });

    it("should show red HP bar when HP <= 25%", () => {
      render(<GhostDisplay ghostState={createMockGhostState(5, 30)} isEnemy={false} />);

      const hpBar = screen.getByTestId("hp-bar");
      expect(hpBar).toHaveClass("bg-red-500");
    });
  });

  describe("HP bar colors - 境界値テスト", () => {
    // HP%による色分け境界値テスト
    it.each([
      // 緑 (> 50%)
      [100, 100, "bg-green-500", "100% → 緑"],
      [51, 100, "bg-green-500", "51% → 緑"],
      // 黄色 (> 25% and <= 50%)
      [50, 100, "bg-yellow-500", "50% → 黄色（境界）"],
      [26, 100, "bg-yellow-500", "26% → 黄色"],
      // 赤 (<= 25%)
      [25, 100, "bg-red-500", "25% → 赤（境界）"],
      [24, 100, "bg-red-500", "24% → 赤"],
      [1, 100, "bg-red-500", "1% → 赤"],
      [0, 100, "bg-red-500", "0% → 赤"],
    ])("HP %d/%d → %s (%s)", (currentHp, maxHp, expectedClass, _desc) => {
      render(<GhostDisplay ghostState={createMockGhostState(currentHp, maxHp)} isEnemy={false} />);

      const hpBar = screen.getByTestId("hp-bar");
      expect(hpBar).toHaveClass(expectedClass);
    });

    // 異なるmaxHPでの境界値
    it.each([
      // maxHP 40での境界値
      [21, 40, "bg-green-500", "52.5% → 緑"],
      [20, 40, "bg-yellow-500", "50% → 黄色"],
      [11, 40, "bg-yellow-500", "27.5% → 黄色"],
      [10, 40, "bg-red-500", "25% → 赤"],
      // maxHP 200での境界値
      [101, 200, "bg-green-500", "50.5% → 緑"],
      [100, 200, "bg-yellow-500", "50% → 黄色"],
      [51, 200, "bg-yellow-500", "25.5% → 黄色"],
      [50, 200, "bg-red-500", "25% → 赤"],
    ])("HP %d/%d → %s (%s)", (currentHp, maxHp, expectedClass, _desc) => {
      render(<GhostDisplay ghostState={createMockGhostState(currentHp, maxHp)} isEnemy={false} />);

      const hpBar = screen.getByTestId("hp-bar");
      expect(hpBar).toHaveClass(expectedClass);
    });
  });

  describe("HP bar width - 詳細テスト", () => {
    it.each([
      [100, 100, "100%", "フルHP"],
      [75, 100, "75%", "75%"],
      [50, 100, "50%", "半分"],
      [25, 100, "25%", "1/4"],
      [10, 100, "10%", "10%"],
      [1, 100, "1%", "瀕死"],
      [0, 100, "0%", "戦闘不能"],
    ])("HP %d/%d → width: %s (%s)", (currentHp, maxHp, expectedWidth, _desc) => {
      render(<GhostDisplay ghostState={createMockGhostState(currentHp, maxHp)} isEnemy={false} />);

      const hpBar = screen.getByTestId("hp-bar");
      expect(hpBar).toHaveStyle({ width: expectedWidth });
    });

    // 異なるmaxHPでのwidth計算（割り切れる値のみ）
    it.each([
      [20, 40, "50%", "maxHP 40で半分"],
      [30, 60, "50%", "maxHP 60で半分"],
      [25, 50, "50%", "maxHP 50で半分"],
    ])("HP %d/%d → width: %s (%s)", (currentHp, maxHp, expectedWidth, _desc) => {
      render(<GhostDisplay ghostState={createMockGhostState(currentHp, maxHp)} isEnemy={false} />);

      const hpBar = screen.getByTestId("hp-bar");
      expect(hpBar).toHaveStyle({ width: expectedWidth });
    });
  });

  describe("player vs enemy 表示の違い", () => {
    it("should render player ghost with correct testid", () => {
      render(<GhostDisplay ghostState={createMockGhostState()} isEnemy={false} />);

      expect(screen.getByTestId("player-ghost-display")).toBeInTheDocument();
      expect(screen.queryByTestId("enemy-ghost-display")).not.toBeInTheDocument();
    });

    it("should render enemy ghost with correct testid", () => {
      render(<GhostDisplay ghostState={createMockGhostState()} isEnemy={true} />);

      expect(screen.getByTestId("enemy-ghost-display")).toBeInTheDocument();
      expect(screen.queryByTestId("player-ghost-display")).not.toBeInTheDocument();
    });

    it("player and enemy should display same HP information", () => {
      const ghostState = createMockGhostState(15, 30);

      const { rerender } = render(<GhostDisplay ghostState={ghostState} isEnemy={false} />);
      const playerHpText = screen.getByTestId("hp-text").textContent;
      const playerHpBar = screen.getByTestId("hp-bar");
      const playerWidth = playerHpBar.style.width;

      rerender(<GhostDisplay ghostState={ghostState} isEnemy={true} />);
      const enemyHpText = screen.getByTestId("hp-text").textContent;
      const enemyHpBar = screen.getByTestId("hp-bar");
      const enemyWidth = enemyHpBar.style.width;

      expect(playerHpText).toBe(enemyHpText);
      expect(playerWidth).toBe(enemyWidth);
    });
  });

  describe("ゴーストタイプ表示", () => {
    it.each([
      ["fire", "fire"],
      ["water", "water"],
      ["grass", "grass"],
      ["electric", "electric"],
      ["ghost", "ghost"],
      ["normal", "normal"],
    ])("ghostType=%s → 表示: %s", (ghostType, expectedText) => {
      render(
        <GhostDisplay
          ghostState={createMockGhostState()}
          isEnemy={false}
          ghostType={ghostType as "fire" | "water" | "grass" | "electric" | "ghost" | "normal"}
        />,
      );

      expect(screen.getByTestId("ghost-type")).toHaveTextContent(expectedText);
    });
  });

  describe("HP bar width", () => {
    it("should set HP bar width based on current HP percentage", () => {
      render(<GhostDisplay ghostState={createMockGhostState(15, 30)} isEnemy={false} />);

      const hpBar = screen.getByTestId("hp-bar");
      expect(hpBar).toHaveStyle({ width: "50%" });
    });

    it("should handle 0 HP", () => {
      render(<GhostDisplay ghostState={createMockGhostState(0, 30)} isEnemy={false} />);

      const hpBar = screen.getByTestId("hp-bar");
      expect(hpBar).toHaveStyle({ width: "0%" });
    });

    it("should handle full HP", () => {
      render(<GhostDisplay ghostState={createMockGhostState(30, 30)} isEnemy={false} />);

      const hpBar = screen.getByTestId("hp-bar");
      expect(hpBar).toHaveStyle({ width: "100%" });
    });
  });
});
