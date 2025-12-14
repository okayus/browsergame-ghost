import type { GhostSpecies, OwnedGhost } from "@ghost-game/shared";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GhostSummaryCard } from "./GhostSummaryCard";

// テスト用のモックデータ
const mockGhost: OwnedGhost = {
  id: "ghost-1",
  speciesId: "spiritpuff",
  level: 10,
  experience: 500,
  currentHp: 30,
  maxHp: 45,
  stats: {
    hp: 45,
    attack: 40,
    defense: 35,
    speed: 45,
  },
  moves: [
    { moveId: "tackle", currentPP: 35, maxPP: 35 },
    { moveId: "scratch", currentPP: 30, maxPP: 35 },
  ],
};

const mockSpecies: GhostSpecies = {
  id: "spiritpuff",
  name: "スピリットパフ",
  type: "normal",
  baseStats: {
    hp: 45,
    attack: 40,
    defense: 35,
    speed: 45,
  },
  learnableMoves: [
    { level: 1, moveId: "tackle" },
    { level: 5, moveId: "scratch" },
  ],
  description: "ふわふわした体を持つ霊。好奇心旺盛で人懐っこい。",
  rarity: "common",
};

describe("GhostSummaryCard", () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("レンダリング", () => {
    it("ゴーストの名前が表示される", () => {
      render(
        <GhostSummaryCard
          ghost={mockGhost}
          species={mockSpecies}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText("スピリットパフ")).toBeInTheDocument();
    });

    it("ニックネームがある場合はニックネームが表示される", () => {
      const ghostWithNickname = { ...mockGhost, nickname: "パフィー" };

      render(
        <GhostSummaryCard
          ghost={ghostWithNickname}
          species={mockSpecies}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText("パフィー")).toBeInTheDocument();
    });

    it("レベルが表示される", () => {
      render(
        <GhostSummaryCard
          ghost={mockGhost}
          species={mockSpecies}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText("Lv.10")).toBeInTheDocument();
    });

    it("現在HP/最大HPが表示される", () => {
      render(
        <GhostSummaryCard
          ghost={mockGhost}
          species={mockSpecies}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText("30/45")).toBeInTheDocument();
    });

    it("HPバーが表示される", () => {
      render(
        <GhostSummaryCard
          ghost={mockGhost}
          species={mockSpecies}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByTestId("hp-bar")).toBeInTheDocument();
    });

    it("HPバーの幅がHP割合に応じて設定される", () => {
      render(
        <GhostSummaryCard
          ghost={mockGhost}
          species={mockSpecies}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      const hpBarFill = screen.getByTestId("hp-bar-fill");
      // 30/45 = 66.67%
      expect(hpBarFill).toHaveStyle({ width: "66.67%" });
    });
  });

  describe("選択状態", () => {
    it("選択されていない場合は通常のスタイルが適用される", () => {
      render(
        <GhostSummaryCard
          ghost={mockGhost}
          species={mockSpecies}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      const card = screen.getByTestId("ghost-summary-card");
      expect(card).toHaveAttribute("data-selected", "false");
    });

    it("選択されている場合は選択スタイルが適用される", () => {
      render(
        <GhostSummaryCard
          ghost={mockGhost}
          species={mockSpecies}
          isSelected={true}
          onClick={mockOnClick}
        />,
      );

      const card = screen.getByTestId("ghost-summary-card");
      expect(card).toHaveAttribute("data-selected", "true");
    });
  });

  describe("インタラクション", () => {
    it("クリックするとonClickが呼ばれる", () => {
      render(
        <GhostSummaryCard
          ghost={mockGhost}
          species={mockSpecies}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      fireEvent.click(screen.getByTestId("ghost-summary-card"));

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("HP状態に応じた色変化", () => {
    it("HPが50%以上の場合は緑色", () => {
      const healthyGhost = { ...mockGhost, currentHp: 30, maxHp: 45 }; // 66%

      render(
        <GhostSummaryCard
          ghost={healthyGhost}
          species={mockSpecies}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      const hpBarFill = screen.getByTestId("hp-bar-fill");
      expect(hpBarFill).toHaveClass("bg-green-500");
    });

    it("HPが25%〜50%の場合は黄色", () => {
      const woundedGhost = { ...mockGhost, currentHp: 15, maxHp: 45 }; // 33%

      render(
        <GhostSummaryCard
          ghost={woundedGhost}
          species={mockSpecies}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      const hpBarFill = screen.getByTestId("hp-bar-fill");
      expect(hpBarFill).toHaveClass("bg-yellow-500");
    });

    it("HPが25%未満の場合は赤色", () => {
      const criticalGhost = { ...mockGhost, currentHp: 10, maxHp: 45 }; // 22%

      render(
        <GhostSummaryCard
          ghost={criticalGhost}
          species={mockSpecies}
          isSelected={false}
          onClick={mockOnClick}
        />,
      );

      const hpBarFill = screen.getByTestId("hp-bar-fill");
      expect(hpBarFill).toHaveClass("bg-red-500");
    });
  });
});
