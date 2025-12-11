import type { GhostType, OwnedGhost } from "@ghost-game/shared";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GhostSwapPanel } from "./GhostSwapPanel";

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
    moves: [],
  },
  {
    id: "ghost-2",
    speciesId: "water_ghost",
    level: 12,
    experience: 500,
    currentHp: 30,
    maxHp: 40,
    stats: { hp: 40, attack: 25, defense: 30, speed: 28 },
    moves: [],
  },
  {
    id: "ghost-3",
    speciesId: "grass_ghost",
    level: 10,
    experience: 200,
    currentHp: 0,
    maxHp: 35,
    stats: { hp: 35, attack: 28, defense: 22, speed: 32 },
    moves: [],
  },
];

const mockGetSpeciesName = (speciesId: string) => {
  const names: Record<string, string> = {
    fire_ghost: "ファイヤーゴースト",
    water_ghost: "ウォーターゴースト",
    grass_ghost: "グラスゴースト",
  };
  return names[speciesId] || "不明";
};

const mockGetSpeciesType = (speciesId: string): GhostType => {
  const types: Record<string, GhostType> = {
    fire_ghost: "fire",
    water_ghost: "water",
    grass_ghost: "grass",
  };
  return types[speciesId] || "normal";
};

describe("GhostSwapPanel", () => {
  describe("rendering", () => {
    it("should render ghost swap panel", () => {
      render(
        <GhostSwapPanel
          party={mockParty}
          currentGhostIndex={0}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onSelectGhost={vi.fn()}
          onBack={vi.fn()}
        />,
      );

      expect(screen.getByTestId("ghost-swap-panel")).toBeInTheDocument();
    });

    it("should render all party ghosts", () => {
      render(
        <GhostSwapPanel
          party={mockParty}
          currentGhostIndex={0}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onSelectGhost={vi.fn()}
          onBack={vi.fn()}
        />,
      );

      expect(screen.getByTestId("swap-ghost-0")).toBeInTheDocument();
      expect(screen.getByTestId("swap-ghost-1")).toBeInTheDocument();
      expect(screen.getByTestId("swap-ghost-2")).toBeInTheDocument();
    });

    it("should render back button", () => {
      render(
        <GhostSwapPanel
          party={mockParty}
          currentGhostIndex={0}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onSelectGhost={vi.fn()}
          onBack={vi.fn()}
        />,
      );

      expect(screen.getByTestId("swap-back")).toBeInTheDocument();
      expect(screen.getByText("もどる")).toBeInTheDocument();
    });

    it("should display ghost names and levels", () => {
      render(
        <GhostSwapPanel
          party={mockParty}
          currentGhostIndex={0}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onSelectGhost={vi.fn()}
          onBack={vi.fn()}
        />,
      );

      expect(screen.getByText("ファイヤー")).toBeInTheDocument();
      expect(screen.getByTestId("swap-ghost-level-0")).toHaveTextContent("Lv.15");
    });

    it("should display HP values", () => {
      render(
        <GhostSwapPanel
          party={mockParty}
          currentGhostIndex={0}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onSelectGhost={vi.fn()}
          onBack={vi.fn()}
        />,
      );

      expect(screen.getByTestId("swap-ghost-hp-0")).toHaveTextContent("45/50");
      expect(screen.getByTestId("swap-ghost-hp-1")).toHaveTextContent("30/40");
      expect(screen.getByTestId("swap-ghost-hp-2")).toHaveTextContent("0/35");
    });
  });

  describe("current ghost", () => {
    it("should mark current battle ghost as disabled", () => {
      render(
        <GhostSwapPanel
          party={mockParty}
          currentGhostIndex={0}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onSelectGhost={vi.fn()}
          onBack={vi.fn()}
        />,
      );

      expect(screen.getByTestId("swap-ghost-0")).toBeDisabled();
      expect(screen.getByTestId("swap-ghost-0")).toHaveAttribute("data-current", "true");
    });

    it("should show 'バトル中' label for current ghost", () => {
      render(
        <GhostSwapPanel
          party={mockParty}
          currentGhostIndex={0}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onSelectGhost={vi.fn()}
          onBack={vi.fn()}
        />,
      );

      expect(screen.getByTestId("swap-ghost-current-0")).toHaveTextContent("バトル中");
    });
  });

  describe("fainted ghost", () => {
    it("should mark fainted ghost as disabled", () => {
      render(
        <GhostSwapPanel
          party={mockParty}
          currentGhostIndex={0}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onSelectGhost={vi.fn()}
          onBack={vi.fn()}
        />,
      );

      expect(screen.getByTestId("swap-ghost-2")).toBeDisabled();
      expect(screen.getByTestId("swap-ghost-2")).toHaveAttribute("data-fainted", "true");
    });

    it("should show 'ひんし' label for fainted ghost", () => {
      render(
        <GhostSwapPanel
          party={mockParty}
          currentGhostIndex={0}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onSelectGhost={vi.fn()}
          onBack={vi.fn()}
        />,
      );

      expect(screen.getByTestId("swap-ghost-fainted-2")).toHaveTextContent("ひんし");
    });
  });

  describe("click selection", () => {
    it("should call onSelectGhost when selectable ghost is clicked", () => {
      const onSelectGhost = vi.fn();
      render(
        <GhostSwapPanel
          party={mockParty}
          currentGhostIndex={0}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onSelectGhost={onSelectGhost}
          onBack={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByTestId("swap-ghost-1"));

      expect(onSelectGhost).toHaveBeenCalledWith(1);
    });

    it("should not call onSelectGhost when current ghost is clicked", () => {
      const onSelectGhost = vi.fn();
      render(
        <GhostSwapPanel
          party={mockParty}
          currentGhostIndex={0}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onSelectGhost={onSelectGhost}
          onBack={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByTestId("swap-ghost-0"));

      expect(onSelectGhost).not.toHaveBeenCalled();
    });

    it("should not call onSelectGhost when fainted ghost is clicked", () => {
      const onSelectGhost = vi.fn();
      render(
        <GhostSwapPanel
          party={mockParty}
          currentGhostIndex={0}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onSelectGhost={onSelectGhost}
          onBack={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByTestId("swap-ghost-2"));

      expect(onSelectGhost).not.toHaveBeenCalled();
    });

    it("should call onBack when back button is clicked", () => {
      const onBack = vi.fn();
      render(
        <GhostSwapPanel
          party={mockParty}
          currentGhostIndex={0}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onSelectGhost={vi.fn()}
          onBack={onBack}
        />,
      );

      fireEvent.click(screen.getByTestId("swap-back"));

      expect(onBack).toHaveBeenCalled();
    });
  });

  describe("keyboard navigation", () => {
    it("should navigate down with ArrowDown key", () => {
      render(
        <GhostSwapPanel
          party={mockParty}
          currentGhostIndex={0}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onSelectGhost={vi.fn()}
          onBack={vi.fn()}
          onKeyInput="ArrowDown"
        />,
      );

      expect(screen.getByTestId("swap-ghost-1")).toHaveAttribute("data-selected", "true");
    });

    it("should navigate up with ArrowUp key", () => {
      render(
        <GhostSwapPanel
          party={mockParty}
          currentGhostIndex={0}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onSelectGhost={vi.fn()}
          onBack={vi.fn()}
          initialSelectedIndex={1}
          onKeyInput="ArrowUp"
        />,
      );

      expect(screen.getByTestId("swap-ghost-0")).toHaveAttribute("data-selected", "true");
    });

    it("should select ghost with Enter key", () => {
      const onSelectGhost = vi.fn();
      render(
        <GhostSwapPanel
          party={mockParty}
          currentGhostIndex={0}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onSelectGhost={onSelectGhost}
          onBack={vi.fn()}
          initialSelectedIndex={1}
          onKeyInput="Enter"
        />,
      );

      expect(onSelectGhost).toHaveBeenCalledWith(1);
    });

    it("should not select disabled ghost with Enter key", () => {
      const onSelectGhost = vi.fn();
      render(
        <GhostSwapPanel
          party={mockParty}
          currentGhostIndex={0}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onSelectGhost={onSelectGhost}
          onBack={vi.fn()}
          initialSelectedIndex={0}
          onKeyInput="Enter"
        />,
      );

      expect(onSelectGhost).not.toHaveBeenCalled();
    });

    it("should call onBack with Escape key", () => {
      const onBack = vi.fn();
      render(
        <GhostSwapPanel
          party={mockParty}
          currentGhostIndex={0}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onSelectGhost={vi.fn()}
          onBack={onBack}
          onKeyInput="Escape"
        />,
      );

      expect(onBack).toHaveBeenCalled();
    });
  });

  describe("empty party", () => {
    it("should only show back button when party is empty", () => {
      render(
        <GhostSwapPanel
          party={[]}
          currentGhostIndex={-1}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onSelectGhost={vi.fn()}
          onBack={vi.fn()}
        />,
      );

      expect(screen.getByTestId("swap-back")).toBeInTheDocument();
      expect(screen.getByTestId("swap-back")).toHaveAttribute("data-selected", "true");
    });
  });
});
