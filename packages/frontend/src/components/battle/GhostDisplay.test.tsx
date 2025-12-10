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
