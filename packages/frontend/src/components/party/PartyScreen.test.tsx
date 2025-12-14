import type { GhostSpecies, Move, OwnedGhost } from "@ghost-game/shared";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PartyScreen } from "./PartyScreen";

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
    id: "water-gun",
    name: "みずでっぽう",
    type: "water",
    power: 40,
    accuracy: 100,
    pp: 25,
    description: "水を勢いよく発射して攻撃する。",
  },
];

const mockSpeciesMap: Record<string, GhostSpecies> = {
  fire_ghost: {
    id: "fire_ghost",
    name: "ファイヤーゴースト",
    type: "fire",
    baseStats: { hp: 45, attack: 50, defense: 35, speed: 45 },
    learnableMoves: [
      { level: 1, moveId: "tackle" },
      { level: 5, moveId: "ember" },
    ],
    description: "炎をまとった霊",
    rarity: "common",
  },
  water_ghost: {
    id: "water_ghost",
    name: "ウォーターゴースト",
    type: "water",
    baseStats: { hp: 50, attack: 40, defense: 45, speed: 40 },
    learnableMoves: [
      { level: 1, moveId: "tackle" },
      { level: 5, moveId: "water-gun" },
    ],
    description: "水をまとった霊",
    rarity: "common",
  },
  grass_ghost: {
    id: "grass_ghost",
    name: "グラスゴースト",
    type: "grass",
    baseStats: { hp: 45, attack: 45, defense: 40, speed: 50 },
    learnableMoves: [{ level: 1, moveId: "tackle" }],
    description: "草をまとった霊",
    rarity: "common",
  },
};

const mockParty: OwnedGhost[] = [
  {
    id: "ghost-1",
    speciesId: "fire_ghost",
    nickname: "ファイヤー",
    level: 15,
    experience: 1000,
    currentHp: 45,
    maxHp: 50,
    stats: { hp: 50, attack: 30, defense: 25, speed: 35 },
    moves: [
      { moveId: "tackle", currentPP: 35, maxPP: 35 },
      { moveId: "ember", currentPP: 20, maxPP: 25 },
    ],
  },
  {
    id: "ghost-2",
    speciesId: "water_ghost",
    level: 12,
    experience: 500,
    currentHp: 30,
    maxHp: 40,
    stats: { hp: 40, attack: 25, defense: 30, speed: 28 },
    moves: [{ moveId: "tackle", currentPP: 30, maxPP: 35 }],
  },
  {
    id: "ghost-3",
    speciesId: "grass_ghost",
    level: 10,
    experience: 200,
    currentHp: 0,
    maxHp: 35,
    stats: { hp: 35, attack: 28, defense: 22, speed: 32 },
    moves: [{ moveId: "tackle", currentPP: 35, maxPP: 35 }],
  },
];

describe("PartyScreen", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("一覧表示モード", () => {
    it("パーティ画面が表示される", () => {
      render(
        <PartyScreen
          party={mockParty}
          speciesMap={mockSpeciesMap}
          moves={mockMoves}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByTestId("party-screen")).toBeInTheDocument();
    });

    it("すべてのパーティゴーストが表示される", () => {
      render(
        <PartyScreen
          party={mockParty}
          speciesMap={mockSpeciesMap}
          moves={mockMoves}
          onClose={mockOnClose}
        />,
      );

      // GhostSummaryCardが使用されている
      expect(screen.getAllByTestId("ghost-summary-card")).toHaveLength(3);
    });

    it("もどるボタンが表示される", () => {
      render(
        <PartyScreen
          party={mockParty}
          speciesMap={mockSpeciesMap}
          moves={mockMoves}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByTestId("party-back")).toBeInTheDocument();
      expect(screen.getByText("もどる")).toBeInTheDocument();
    });

    it("ニックネームがある場合はニックネームが表示される", () => {
      render(
        <PartyScreen
          party={mockParty}
          speciesMap={mockSpeciesMap}
          moves={mockMoves}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText("ファイヤー")).toBeInTheDocument();
    });

    it("ニックネームがない場合は種族名が表示される", () => {
      render(
        <PartyScreen
          party={mockParty}
          speciesMap={mockSpeciesMap}
          moves={mockMoves}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText("ウォーターゴースト")).toBeInTheDocument();
    });

    it("最初のゴーストがデフォルトで選択される", () => {
      render(
        <PartyScreen
          party={mockParty}
          speciesMap={mockSpeciesMap}
          moves={mockMoves}
          onClose={mockOnClose}
        />,
      );

      const cards = screen.getAllByTestId("ghost-summary-card");
      expect(cards[0]).toHaveAttribute("data-selected", "true");
    });
  });

  describe("キーボードナビゲーション", () => {
    it("ArrowDownキーで下に移動する", () => {
      render(
        <PartyScreen
          party={mockParty}
          speciesMap={mockSpeciesMap}
          moves={mockMoves}
          onClose={mockOnClose}
          onKeyInput="ArrowDown"
        />,
      );

      const cards = screen.getAllByTestId("ghost-summary-card");
      expect(cards[1]).toHaveAttribute("data-selected", "true");
    });

    it("ArrowUpキーで上に移動する", () => {
      render(
        <PartyScreen
          party={mockParty}
          speciesMap={mockSpeciesMap}
          moves={mockMoves}
          onClose={mockOnClose}
          initialSelectedIndex={1}
          onKeyInput="ArrowUp"
        />,
      );

      const cards = screen.getAllByTestId("ghost-summary-card");
      expect(cards[0]).toHaveAttribute("data-selected", "true");
    });

    it("Escapeキーでメニューに戻る", () => {
      render(
        <PartyScreen
          party={mockParty}
          speciesMap={mockSpeciesMap}
          moves={mockMoves}
          onClose={mockOnClose}
          onKeyInput="Escape"
        />,
      );

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("Enterキーで詳細パネルを開く", () => {
      render(
        <PartyScreen
          party={mockParty}
          speciesMap={mockSpeciesMap}
          moves={mockMoves}
          onClose={mockOnClose}
          onKeyInput="Enter"
        />,
      );

      expect(screen.getByTestId("ghost-detail-panel")).toBeInTheDocument();
    });

    it("もどるボタンでEnterを押すとメニューに戻る", () => {
      render(
        <PartyScreen
          party={mockParty}
          speciesMap={mockSpeciesMap}
          moves={mockMoves}
          onClose={mockOnClose}
          initialSelectedIndex={3} // もどるボタン
          onKeyInput="Enter"
        />,
      );

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("クリック操作", () => {
    it("もどるボタンをクリックするとonCloseが呼ばれる", () => {
      render(
        <PartyScreen
          party={mockParty}
          speciesMap={mockSpeciesMap}
          moves={mockMoves}
          onClose={mockOnClose}
        />,
      );

      fireEvent.click(screen.getByTestId("party-back"));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("ゴーストをクリックすると詳細パネルが開く", () => {
      render(
        <PartyScreen
          party={mockParty}
          speciesMap={mockSpeciesMap}
          moves={mockMoves}
          onClose={mockOnClose}
        />,
      );

      const cards = screen.getAllByTestId("ghost-summary-card");
      fireEvent.click(cards[0]);

      expect(screen.getByTestId("ghost-detail-panel")).toBeInTheDocument();
    });
  });

  describe("詳細表示モード", () => {
    it("詳細パネルにゴーストの情報が表示される", () => {
      render(
        <PartyScreen
          party={mockParty}
          speciesMap={mockSpeciesMap}
          moves={mockMoves}
          onClose={mockOnClose}
          onKeyInput="Enter"
        />,
      );

      // ニックネーム
      expect(screen.getByText("ファイヤー")).toBeInTheDocument();
      // 種族名も表示される（詳細パネルではニックネームと種族名両方表示）
      expect(screen.getByText("ファイヤーゴースト")).toBeInTheDocument();
    });

    it("詳細パネルで閉じるボタンを押すと一覧に戻る", () => {
      render(
        <PartyScreen
          party={mockParty}
          speciesMap={mockSpeciesMap}
          moves={mockMoves}
          onClose={mockOnClose}
          onKeyInput="Enter"
        />,
      );

      expect(screen.getByTestId("ghost-detail-panel")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("close-button"));

      expect(screen.queryByTestId("ghost-detail-panel")).not.toBeInTheDocument();
    });

    it("詳細パネルでEscapeを押すと一覧に戻る", () => {
      const { rerender } = render(
        <PartyScreen
          party={mockParty}
          speciesMap={mockSpeciesMap}
          moves={mockMoves}
          onClose={mockOnClose}
          onKeyInput="Enter"
        />,
      );

      expect(screen.getByTestId("ghost-detail-panel")).toBeInTheDocument();

      rerender(
        <PartyScreen
          party={mockParty}
          speciesMap={mockSpeciesMap}
          moves={mockMoves}
          onClose={mockOnClose}
          onKeyInput="Escape"
        />,
      );

      expect(screen.queryByTestId("ghost-detail-panel")).not.toBeInTheDocument();
      // onCloseは呼ばれない（詳細パネルを閉じるだけ）
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("空のパーティ", () => {
    it("パーティが空の場合はもどるボタンのみ表示される", () => {
      render(
        <PartyScreen
          party={[]}
          speciesMap={mockSpeciesMap}
          moves={mockMoves}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByTestId("party-back")).toBeInTheDocument();
      expect(screen.getByTestId("party-back")).toHaveAttribute("data-selected", "true");
      expect(screen.queryAllByTestId("ghost-summary-card")).toHaveLength(0);
    });

    it("空のパーティでEnterを押すとメニューに戻る", () => {
      render(
        <PartyScreen
          party={[]}
          speciesMap={mockSpeciesMap}
          moves={mockMoves}
          onClose={mockOnClose}
          onKeyInput="Enter"
        />,
      );

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
