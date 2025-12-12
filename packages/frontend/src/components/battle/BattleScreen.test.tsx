import type { BattleGhostState } from "@ghost-game/shared";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BattleScreen } from "./BattleScreen";

const createMockPlayerGhost = (): BattleGhostState => ({
  ghost: {
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
  },
  currentHp: 25,
  statModifiers: { attack: 0, defense: 0, speed: 0 },
});

const createMockEnemyGhost = (): BattleGhostState => ({
  ghost: {
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
  },
  currentHp: 20,
  statModifiers: { attack: 0, defense: 0, speed: 0 },
});

describe("BattleScreen", () => {
  describe("rendering", () => {
    it("should render battle screen", () => {
      render(
        <BattleScreen
          phase="command_select"
          playerGhost={createMockPlayerGhost()}
          enemyGhost={createMockEnemyGhost()}
          messages={[]}
        />,
      );

      expect(screen.getByTestId("battle-screen")).toBeInTheDocument();
    });

    it("should display phase as data attribute", () => {
      render(
        <BattleScreen
          phase="move_select"
          playerGhost={createMockPlayerGhost()}
          enemyGhost={createMockEnemyGhost()}
          messages={[]}
        />,
      );

      expect(screen.getByTestId("battle-screen")).toHaveAttribute("data-phase", "move_select");
    });
  });

  describe("ghost display", () => {
    it("should render player ghost", () => {
      render(
        <BattleScreen
          phase="command_select"
          playerGhost={createMockPlayerGhost()}
          enemyGhost={createMockEnemyGhost()}
          messages={[]}
        />,
      );

      expect(screen.getByTestId("player-ghost-display")).toBeInTheDocument();
    });

    it("should render enemy ghost", () => {
      render(
        <BattleScreen
          phase="command_select"
          playerGhost={createMockPlayerGhost()}
          enemyGhost={createMockEnemyGhost()}
          messages={[]}
        />,
      );

      expect(screen.getByTestId("enemy-ghost-display")).toBeInTheDocument();
    });

    it("should not render player ghost when null", () => {
      render(
        <BattleScreen
          phase="command_select"
          playerGhost={null}
          enemyGhost={createMockEnemyGhost()}
          messages={[]}
        />,
      );

      expect(screen.queryByTestId("player-ghost-display")).not.toBeInTheDocument();
    });

    it("should not render enemy ghost when null", () => {
      render(
        <BattleScreen
          phase="command_select"
          playerGhost={createMockPlayerGhost()}
          enemyGhost={null}
          messages={[]}
        />,
      );

      expect(screen.queryByTestId("enemy-ghost-display")).not.toBeInTheDocument();
    });

    it("should pass ghost type to display", () => {
      render(
        <BattleScreen
          phase="command_select"
          playerGhost={createMockPlayerGhost()}
          enemyGhost={createMockEnemyGhost()}
          playerGhostType="fire"
          enemyGhostType="ghost"
          messages={[]}
        />,
      );

      const ghostTypes = screen.getAllByTestId("ghost-type");
      expect(ghostTypes).toHaveLength(2);
    });
  });

  describe("phase panels", () => {
    it("should render command panel in command_select phase", () => {
      render(
        <BattleScreen
          phase="command_select"
          playerGhost={createMockPlayerGhost()}
          enemyGhost={createMockEnemyGhost()}
          messages={[]}
          commandPanel={<div data-testid="test-command-panel">Commands</div>}
        />,
      );

      expect(screen.getByTestId("test-command-panel")).toBeInTheDocument();
    });

    it("should render command panel in move_select phase", () => {
      render(
        <BattleScreen
          phase="move_select"
          playerGhost={createMockPlayerGhost()}
          enemyGhost={createMockEnemyGhost()}
          messages={[]}
          commandPanel={<div data-testid="test-move-panel">Moves</div>}
        />,
      );

      expect(screen.getByTestId("test-move-panel")).toBeInTheDocument();
    });

    it("should render command panel in item_select phase", () => {
      render(
        <BattleScreen
          phase="item_select"
          playerGhost={createMockPlayerGhost()}
          enemyGhost={createMockEnemyGhost()}
          messages={[]}
          commandPanel={<div data-testid="test-item-panel">Items</div>}
        />,
      );

      expect(screen.getByTestId("test-item-panel")).toBeInTheDocument();
    });

    it("should render executing indicator in executing phase", () => {
      render(
        <BattleScreen
          phase="executing"
          playerGhost={createMockPlayerGhost()}
          enemyGhost={createMockEnemyGhost()}
          messages={[]}
        />,
      );

      expect(screen.getByTestId("executing-indicator")).toBeInTheDocument();
      expect(screen.getByText("実行中...")).toBeInTheDocument();
    });

    it("should render result panel in result phase", () => {
      render(
        <BattleScreen
          phase="result"
          playerGhost={createMockPlayerGhost()}
          enemyGhost={createMockEnemyGhost()}
          messages={[]}
        />,
      );

      expect(screen.getByTestId("result-panel")).toBeInTheDocument();
      expect(screen.getByText("バトル終了")).toBeInTheDocument();
    });
  });

  describe("全フェーズテスト", () => {
    // 全フェーズがdata-phase属性に正しく設定されることをテスト
    it.each([
      ["command_select", "コマンド選択"],
      ["move_select", "技選択"],
      ["item_select", "アイテム選択"],
      ["executing", "実行中"],
      ["result", "結果表示"],
    ] as const)("phase=%s → data-phase属性が設定される (%s)", (phase, _desc) => {
      render(
        <BattleScreen
          phase={phase}
          playerGhost={createMockPlayerGhost()}
          enemyGhost={createMockEnemyGhost()}
          messages={[]}
        />,
      );

      expect(screen.getByTestId("battle-screen")).toHaveAttribute("data-phase", phase);
    });

    // 選択系フェーズでコマンドパネルが表示されることをテスト
    it.each([
      ["command_select", "コマンド選択"],
      ["move_select", "技選択"],
      ["item_select", "アイテム選択"],
    ] as const)("phase=%s → commandPanelが表示される (%s)", (phase, _desc) => {
      render(
        <BattleScreen
          phase={phase}
          playerGhost={createMockPlayerGhost()}
          enemyGhost={createMockEnemyGhost()}
          messages={[]}
          commandPanel={<div data-testid="phase-command-panel">Panel</div>}
        />,
      );

      expect(screen.getByTestId("phase-command-panel")).toBeInTheDocument();
    });

    // executingフェーズではcommandPanelが表示されないことをテスト
    it("executing phase should not render commandPanel", () => {
      render(
        <BattleScreen
          phase="executing"
          playerGhost={createMockPlayerGhost()}
          enemyGhost={createMockEnemyGhost()}
          messages={[]}
          commandPanel={<div data-testid="should-not-appear">Panel</div>}
        />,
      );

      expect(screen.queryByTestId("should-not-appear")).not.toBeInTheDocument();
    });

    // resultフェーズではcommandPanelが表示されないことをテスト
    it("result phase should not render commandPanel", () => {
      render(
        <BattleScreen
          phase="result"
          playerGhost={createMockPlayerGhost()}
          enemyGhost={createMockEnemyGhost()}
          messages={[]}
          commandPanel={<div data-testid="should-not-appear">Panel</div>}
        />,
      );

      expect(screen.queryByTestId("should-not-appear")).not.toBeInTheDocument();
    });
  });

  describe("ゴースト状態表示", () => {
    it("should display both ghosts with different HP", () => {
      const playerGhost = createMockPlayerGhost();
      playerGhost.currentHp = 10;
      const enemyGhost = createMockEnemyGhost();
      enemyGhost.currentHp = 5;

      render(
        <BattleScreen
          phase="command_select"
          playerGhost={playerGhost}
          enemyGhost={enemyGhost}
          messages={[]}
        />,
      );

      expect(screen.getByTestId("player-ghost-display")).toBeInTheDocument();
      expect(screen.getByTestId("enemy-ghost-display")).toBeInTheDocument();
    });

    it("should handle player ghost with 0 HP (fainted)", () => {
      const playerGhost = createMockPlayerGhost();
      playerGhost.currentHp = 0;

      render(
        <BattleScreen
          phase="command_select"
          playerGhost={playerGhost}
          enemyGhost={createMockEnemyGhost()}
          messages={[]}
        />,
      );

      expect(screen.getByTestId("player-ghost-display")).toBeInTheDocument();
    });

    it("should handle enemy ghost with 0 HP (defeated)", () => {
      const enemyGhost = createMockEnemyGhost();
      enemyGhost.currentHp = 0;

      render(
        <BattleScreen
          phase="command_select"
          playerGhost={createMockPlayerGhost()}
          enemyGhost={enemyGhost}
          messages={[]}
        />,
      );

      expect(screen.getByTestId("enemy-ghost-display")).toBeInTheDocument();
    });
  });

  describe("message box", () => {
    it("should render message box when provided", () => {
      render(
        <BattleScreen
          phase="command_select"
          playerGhost={createMockPlayerGhost()}
          enemyGhost={createMockEnemyGhost()}
          messages={[]}
          messageBox={<div data-testid="test-message-box">Message</div>}
        />,
      );

      expect(screen.getByTestId("test-message-box")).toBeInTheDocument();
    });
  });

  describe("battle effect area", () => {
    it("should render battle effect area", () => {
      render(
        <BattleScreen
          phase="command_select"
          playerGhost={createMockPlayerGhost()}
          enemyGhost={createMockEnemyGhost()}
          messages={[]}
        />,
      );

      expect(screen.getByTestId("battle-effect-area")).toBeInTheDocument();
    });
  });
});
