import type { GhostSpecies, Move, OwnedGhost } from "@ghost-game/shared";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GhostDetailPanel } from "./GhostDetailPanel";

// テスト用のモックデータ
const mockGhost: OwnedGhost = {
  id: "ghost-1",
  speciesId: "fireling",
  level: 15,
  experience: 1200,
  currentHp: 35,
  maxHp: 50,
  stats: {
    hp: 50,
    attack: 65,
    defense: 40,
    speed: 60,
  },
  moves: [
    { moveId: "tackle", currentPP: 30, maxPP: 35 },
    { moveId: "ember", currentPP: 20, maxPP: 25 },
    { moveId: "fire-spin", currentPP: 10, maxPP: 15 },
  ],
};

const mockSpecies: GhostSpecies = {
  id: "fireling",
  name: "ファイアリング",
  type: "fire",
  baseStats: {
    hp: 40,
    attack: 55,
    defense: 30,
    speed: 50,
  },
  learnableMoves: [
    { level: 1, moveId: "tackle" },
    { level: 1, moveId: "ember" },
    { level: 8, moveId: "fire-spin" },
  ],
  description: "小さな炎を身にまとう霊。怒ると炎が大きくなる。",
  rarity: "uncommon",
};

const mockMoves: Move[] = [
  {
    id: "tackle",
    name: "たいあたり",
    type: "normal",
    power: 40,
    accuracy: 100,
    pp: 35,
    description: "相手にぶつかって攻撃する。",
  },
  {
    id: "ember",
    name: "ひのこ",
    type: "fire",
    power: 40,
    accuracy: 100,
    pp: 25,
    description: "小さな炎を飛ばして攻撃する。",
  },
  {
    id: "fire-spin",
    name: "ほのおのうず",
    type: "fire",
    power: 35,
    accuracy: 85,
    pp: 15,
    description: "炎の渦で相手を包み込む。",
  },
];

describe("GhostDetailPanel", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("レンダリング", () => {
    it("パネルが表示される", () => {
      render(
        <GhostDetailPanel
          ghost={mockGhost}
          species={mockSpecies}
          moves={mockMoves}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByTestId("ghost-detail-panel")).toBeInTheDocument();
    });

    it("ゴーストの名前が表示される", () => {
      render(
        <GhostDetailPanel
          ghost={mockGhost}
          species={mockSpecies}
          moves={mockMoves}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText("ファイアリング")).toBeInTheDocument();
    });

    it("ニックネームがある場合はニックネームと種族名が表示される", () => {
      const ghostWithNickname = { ...mockGhost, nickname: "フレイム" };

      render(
        <GhostDetailPanel
          ghost={ghostWithNickname}
          species={mockSpecies}
          moves={mockMoves}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText("フレイム")).toBeInTheDocument();
      expect(screen.getByText("ファイアリング")).toBeInTheDocument();
    });

    it("レベルが表示される", () => {
      render(
        <GhostDetailPanel
          ghost={mockGhost}
          species={mockSpecies}
          moves={mockMoves}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText("Lv.15")).toBeInTheDocument();
    });

    it("タイプが表示される", () => {
      render(
        <GhostDetailPanel
          ghost={mockGhost}
          species={mockSpecies}
          moves={mockMoves}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByTestId("ghost-type")).toHaveTextContent("ほのお");
    });
  });

  describe("能力値表示", () => {
    it("HP能力値が表示される", () => {
      render(
        <GhostDetailPanel
          ghost={mockGhost}
          species={mockSpecies}
          moves={mockMoves}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByTestId("stat-hp")).toHaveTextContent("50");
    });

    it("攻撃能力値が表示される", () => {
      render(
        <GhostDetailPanel
          ghost={mockGhost}
          species={mockSpecies}
          moves={mockMoves}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByTestId("stat-attack")).toHaveTextContent("65");
    });

    it("防御能力値が表示される", () => {
      render(
        <GhostDetailPanel
          ghost={mockGhost}
          species={mockSpecies}
          moves={mockMoves}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByTestId("stat-defense")).toHaveTextContent("40");
    });

    it("素早さ能力値が表示される", () => {
      render(
        <GhostDetailPanel
          ghost={mockGhost}
          species={mockSpecies}
          moves={mockMoves}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByTestId("stat-speed")).toHaveTextContent("60");
    });
  });

  describe("技一覧表示", () => {
    it("覚えている技が表示される", () => {
      render(
        <GhostDetailPanel
          ghost={mockGhost}
          species={mockSpecies}
          moves={mockMoves}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText("たいあたり")).toBeInTheDocument();
      expect(screen.getByText("ひのこ")).toBeInTheDocument();
      expect(screen.getByText("ほのおのうず")).toBeInTheDocument();
    });

    it("技のPP残量が表示される", () => {
      render(
        <GhostDetailPanel
          ghost={mockGhost}
          species={mockSpecies}
          moves={mockMoves}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByTestId("move-0-pp")).toHaveTextContent("30/35");
      expect(screen.getByTestId("move-1-pp")).toHaveTextContent("20/25");
      expect(screen.getByTestId("move-2-pp")).toHaveTextContent("10/15");
    });

    it("技のタイプが表示される", () => {
      render(
        <GhostDetailPanel
          ghost={mockGhost}
          species={mockSpecies}
          moves={mockMoves}
          onClose={mockOnClose}
        />,
      );

      const moveTypes = screen.getAllByTestId(/^move-\d+-type$/);
      expect(moveTypes.length).toBe(3);
    });
  });

  describe("インタラクション", () => {
    it("閉じるボタンをクリックするとonCloseが呼ばれる", () => {
      render(
        <GhostDetailPanel
          ghost={mockGhost}
          species={mockSpecies}
          moves={mockMoves}
          onClose={mockOnClose}
        />,
      );

      fireEvent.click(screen.getByTestId("close-button"));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("HP表示", () => {
    it("現在HP/最大HPが表示される", () => {
      render(
        <GhostDetailPanel
          ghost={mockGhost}
          species={mockSpecies}
          moves={mockMoves}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByTestId("current-hp")).toHaveTextContent("35/50");
    });
  });
});
