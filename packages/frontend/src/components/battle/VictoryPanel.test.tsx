import type { LevelUpResult } from "@ghost-game/shared";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VictoryPanel } from "./VictoryPanel";

const mockLevelUpResult: LevelUpResult = {
  newLevel: 6,
  newStats: {
    hp: 35,
    attack: 18,
    defense: 15,
    speed: 12,
  },
  newMaxHp: 35,
  learnableMoveIds: [],
};

const mockLevelUpResultWithMove: LevelUpResult = {
  newLevel: 10,
  newStats: {
    hp: 50,
    attack: 25,
    defense: 20,
    speed: 18,
  },
  newMaxHp: 50,
  learnableMoveIds: ["ember"],
};

describe("VictoryPanel", () => {
  describe("victory phase", () => {
    it("should render victory panel in victory phase", () => {
      render(
        <VictoryPanel
          ghostName="ゴースト"
          ghostType="ghost"
          expGained={50}
          leveledUp={false}
          previousLevel={5}
          onContinue={vi.fn()}
        />,
      );

      expect(screen.getByTestId("victory-panel")).toBeInTheDocument();
      expect(screen.getByTestId("victory-panel")).toHaveAttribute("data-phase", "victory");
    });

    it("should display victory message", () => {
      render(
        <VictoryPanel
          ghostName="ゴースト"
          ghostType="ghost"
          expGained={50}
          leveledUp={false}
          previousLevel={5}
          onContinue={vi.fn()}
        />,
      );

      expect(screen.getByTestId("victory-message")).toHaveTextContent("勝利！");
    });

    it("should advance to exp phase when continue button is clicked", () => {
      render(
        <VictoryPanel
          ghostName="ゴースト"
          ghostType="ghost"
          expGained={50}
          leveledUp={false}
          previousLevel={5}
          onContinue={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByTestId("continue-button"));

      expect(screen.getByTestId("victory-panel")).toHaveAttribute("data-phase", "exp");
    });
  });

  describe("exp phase", () => {
    it("should display ghost name and exp gained", () => {
      render(
        <VictoryPanel
          ghostName="ファイヤー"
          ghostType="fire"
          expGained={100}
          leveledUp={false}
          previousLevel={5}
          onContinue={vi.fn()}
        />,
      );

      // Advance to exp phase
      fireEvent.click(screen.getByTestId("continue-button"));

      expect(screen.getByTestId("ghost-name")).toHaveTextContent("ファイヤー");
      expect(screen.getByTestId("exp-gained")).toHaveTextContent("100");
    });

    it("should advance to done phase when not leveled up", () => {
      render(
        <VictoryPanel
          ghostName="ゴースト"
          ghostType="ghost"
          expGained={50}
          leveledUp={false}
          previousLevel={5}
          onContinue={vi.fn()}
        />,
      );

      // Advance to exp phase
      fireEvent.click(screen.getByTestId("continue-button"));
      // Advance to done phase
      fireEvent.click(screen.getByTestId("continue-button"));

      expect(screen.getByTestId("victory-panel")).toHaveAttribute("data-phase", "done");
    });

    it("should advance to levelUp phase when leveled up", () => {
      render(
        <VictoryPanel
          ghostName="ゴースト"
          ghostType="ghost"
          expGained={100}
          leveledUp={true}
          levelUpResult={mockLevelUpResult}
          previousLevel={5}
          onContinue={vi.fn()}
        />,
      );

      // Advance to exp phase
      fireEvent.click(screen.getByTestId("continue-button"));
      // Advance to levelUp phase
      fireEvent.click(screen.getByTestId("continue-button"));

      expect(screen.getByTestId("victory-panel")).toHaveAttribute("data-phase", "levelUp");
    });
  });

  describe("levelUp phase", () => {
    it("should display level up message", () => {
      render(
        <VictoryPanel
          ghostName="ゴースト"
          ghostType="ghost"
          expGained={100}
          leveledUp={true}
          levelUpResult={mockLevelUpResult}
          previousLevel={5}
          onContinue={vi.fn()}
        />,
      );

      // Advance to levelUp phase
      fireEvent.click(screen.getByTestId("continue-button"));
      fireEvent.click(screen.getByTestId("continue-button"));

      expect(screen.getByTestId("levelup-message")).toHaveTextContent("レベルアップ！");
    });

    it("should display previous and new level", () => {
      render(
        <VictoryPanel
          ghostName="ゴースト"
          ghostType="ghost"
          expGained={100}
          leveledUp={true}
          levelUpResult={mockLevelUpResult}
          previousLevel={5}
          onContinue={vi.fn()}
        />,
      );

      // Advance to levelUp phase
      fireEvent.click(screen.getByTestId("continue-button"));
      fireEvent.click(screen.getByTestId("continue-button"));

      expect(screen.getByTestId("previous-level")).toHaveTextContent("5");
      expect(screen.getByTestId("new-level")).toHaveTextContent("Lv.6");
    });

    it("should advance to stats phase", () => {
      render(
        <VictoryPanel
          ghostName="ゴースト"
          ghostType="ghost"
          expGained={100}
          leveledUp={true}
          levelUpResult={mockLevelUpResult}
          previousLevel={5}
          onContinue={vi.fn()}
        />,
      );

      // Advance to stats phase
      fireEvent.click(screen.getByTestId("continue-button"));
      fireEvent.click(screen.getByTestId("continue-button"));
      fireEvent.click(screen.getByTestId("continue-button"));

      expect(screen.getByTestId("victory-panel")).toHaveAttribute("data-phase", "stats");
    });
  });

  describe("stats phase", () => {
    it("should display new stats", () => {
      render(
        <VictoryPanel
          ghostName="ゴースト"
          ghostType="ghost"
          expGained={100}
          leveledUp={true}
          levelUpResult={mockLevelUpResult}
          previousLevel={5}
          onContinue={vi.fn()}
        />,
      );

      // Advance to stats phase
      fireEvent.click(screen.getByTestId("continue-button"));
      fireEvent.click(screen.getByTestId("continue-button"));
      fireEvent.click(screen.getByTestId("continue-button"));

      expect(screen.getByTestId("new-hp")).toHaveTextContent("35");
      expect(screen.getByTestId("new-attack")).toHaveTextContent("18");
      expect(screen.getByTestId("new-defense")).toHaveTextContent("15");
      expect(screen.getByTestId("new-speed")).toHaveTextContent("12");
    });

    it("should call onLearnMove when there are learnable moves", () => {
      const onLearnMove = vi.fn();
      render(
        <VictoryPanel
          ghostName="ゴースト"
          ghostType="ghost"
          expGained={100}
          leveledUp={true}
          levelUpResult={mockLevelUpResultWithMove}
          previousLevel={9}
          onLearnMove={onLearnMove}
          onContinue={vi.fn()}
        />,
      );

      // Advance to stats phase and click continue
      fireEvent.click(screen.getByTestId("continue-button"));
      fireEvent.click(screen.getByTestId("continue-button"));
      fireEvent.click(screen.getByTestId("continue-button"));
      fireEvent.click(screen.getByTestId("continue-button"));

      expect(onLearnMove).toHaveBeenCalledWith("ember");
    });

    it("should advance to done phase when no learnable moves", () => {
      render(
        <VictoryPanel
          ghostName="ゴースト"
          ghostType="ghost"
          expGained={100}
          leveledUp={true}
          levelUpResult={mockLevelUpResult}
          previousLevel={5}
          onContinue={vi.fn()}
        />,
      );

      // Advance to done phase
      fireEvent.click(screen.getByTestId("continue-button"));
      fireEvent.click(screen.getByTestId("continue-button"));
      fireEvent.click(screen.getByTestId("continue-button"));
      fireEvent.click(screen.getByTestId("continue-button"));

      expect(screen.getByTestId("victory-panel")).toHaveAttribute("data-phase", "done");
    });
  });

  describe("done phase", () => {
    it("should call onContinue when continue button is clicked", () => {
      const onContinue = vi.fn();
      render(
        <VictoryPanel
          ghostName="ゴースト"
          ghostType="ghost"
          expGained={50}
          leveledUp={false}
          previousLevel={5}
          onContinue={onContinue}
        />,
      );

      // Advance to done phase
      fireEvent.click(screen.getByTestId("continue-button"));
      fireEvent.click(screen.getByTestId("continue-button"));
      // Click continue in done phase
      fireEvent.click(screen.getByTestId("continue-button"));

      expect(onContinue).toHaveBeenCalled();
    });
  });

  describe("keyboard navigation", () => {
    it("should advance phase with Enter key", () => {
      render(
        <VictoryPanel
          ghostName="ゴースト"
          ghostType="ghost"
          expGained={50}
          leveledUp={false}
          previousLevel={5}
          onContinue={vi.fn()}
          onKeyInput="Enter"
        />,
      );

      expect(screen.getByTestId("victory-panel")).toHaveAttribute("data-phase", "exp");
    });

    it("should advance phase with Space key", () => {
      render(
        <VictoryPanel
          ghostName="ゴースト"
          ghostType="ghost"
          expGained={50}
          leveledUp={false}
          previousLevel={5}
          onContinue={vi.fn()}
          onKeyInput=" "
        />,
      );

      expect(screen.getByTestId("victory-panel")).toHaveAttribute("data-phase", "exp");
    });
  });
});
