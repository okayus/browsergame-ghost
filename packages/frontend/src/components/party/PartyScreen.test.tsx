import type { GhostType, OwnedGhost } from "@ghost-game/shared";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PartyScreen } from "./PartyScreen";

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

describe("PartyScreen", () => {
  describe("rendering", () => {
    it("should render party screen", () => {
      render(
        <PartyScreen
          party={mockParty}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onBack={vi.fn()}
        />,
      );

      expect(screen.getByTestId("party-screen")).toBeInTheDocument();
    });

    it("should render all party ghosts", () => {
      render(
        <PartyScreen
          party={mockParty}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onBack={vi.fn()}
        />,
      );

      expect(screen.getByTestId("party-ghost-0")).toBeInTheDocument();
      expect(screen.getByTestId("party-ghost-1")).toBeInTheDocument();
      expect(screen.getByTestId("party-ghost-2")).toBeInTheDocument();
    });

    it("should render back button", () => {
      render(
        <PartyScreen
          party={mockParty}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onBack={vi.fn()}
        />,
      );

      expect(screen.getByTestId("party-back")).toBeInTheDocument();
      expect(screen.getByText("もどる")).toBeInTheDocument();
    });

    it("should display ghost nickname when available", () => {
      render(
        <PartyScreen
          party={mockParty}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onBack={vi.fn()}
        />,
      );

      expect(screen.getByText("ファイヤー")).toBeInTheDocument();
    });

    it("should display species name when no nickname", () => {
      render(
        <PartyScreen
          party={mockParty}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onBack={vi.fn()}
        />,
      );

      expect(screen.getByText("ウォーターゴースト")).toBeInTheDocument();
    });

    it("should display ghost levels", () => {
      render(
        <PartyScreen
          party={mockParty}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onBack={vi.fn()}
        />,
      );

      expect(screen.getByTestId("party-ghost-level-0")).toHaveTextContent("Lv.15");
      expect(screen.getByTestId("party-ghost-level-1")).toHaveTextContent("Lv.12");
      expect(screen.getByTestId("party-ghost-level-2")).toHaveTextContent("Lv.10");
    });

    it("should display ghost types in Japanese", () => {
      render(
        <PartyScreen
          party={mockParty}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onBack={vi.fn()}
        />,
      );

      expect(screen.getByTestId("party-ghost-type-0")).toHaveTextContent("炎");
      expect(screen.getByTestId("party-ghost-type-1")).toHaveTextContent("水");
      expect(screen.getByTestId("party-ghost-type-2")).toHaveTextContent("草");
    });

    it("should display HP values", () => {
      render(
        <PartyScreen
          party={mockParty}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onBack={vi.fn()}
        />,
      );

      expect(screen.getByTestId("party-ghost-hp-0")).toHaveTextContent("45/50");
      expect(screen.getByTestId("party-ghost-hp-1")).toHaveTextContent("30/40");
      expect(screen.getByTestId("party-ghost-hp-2")).toHaveTextContent("0/35");
    });

    it("should show first ghost as selected by default", () => {
      render(
        <PartyScreen
          party={mockParty}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onBack={vi.fn()}
        />,
      );

      expect(screen.getByTestId("party-ghost-0")).toHaveAttribute("data-selected", "true");
    });

    it("should mark fainted ghosts", () => {
      render(
        <PartyScreen
          party={mockParty}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onBack={vi.fn()}
        />,
      );

      expect(screen.getByTestId("party-ghost-2")).toHaveAttribute("data-fainted", "true");
    });
  });

  describe("click selection", () => {
    it("should call onBack when back button is clicked", () => {
      const onBack = vi.fn();
      render(
        <PartyScreen
          party={mockParty}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onBack={onBack}
        />,
      );

      fireEvent.click(screen.getByTestId("party-back"));

      expect(onBack).toHaveBeenCalled();
    });
  });

  describe("reorder functionality", () => {
    it("should enter swap mode when ghost is clicked", () => {
      render(
        <PartyScreen
          party={mockParty}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onBack={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByTestId("party-ghost-0"));

      expect(screen.getByTestId("party-ghost-0")).toHaveAttribute("data-swap-source", "true");
      expect(screen.getByTestId("swap-mode-indicator")).toBeInTheDocument();
    });

    it("should call onReorder when second ghost is clicked in swap mode", () => {
      const onReorder = vi.fn();
      render(
        <PartyScreen
          party={mockParty}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onReorder={onReorder}
          onBack={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByTestId("party-ghost-0"));
      fireEvent.click(screen.getByTestId("party-ghost-2"));

      expect(onReorder).toHaveBeenCalledWith(0, 2);
    });

    it("should cancel swap mode when same ghost is clicked twice", () => {
      render(
        <PartyScreen
          party={mockParty}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onBack={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByTestId("party-ghost-0"));
      expect(screen.getByTestId("swap-mode-indicator")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("party-ghost-0"));
      expect(screen.queryByTestId("swap-mode-indicator")).not.toBeInTheDocument();
    });
  });

  describe("keyboard navigation", () => {
    it("should navigate down with ArrowDown key", () => {
      render(
        <PartyScreen
          party={mockParty}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onBack={vi.fn()}
          onKeyInput="ArrowDown"
        />,
      );

      expect(screen.getByTestId("party-ghost-1")).toHaveAttribute("data-selected", "true");
    });

    it("should navigate up with ArrowUp key", () => {
      render(
        <PartyScreen
          party={mockParty}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onBack={vi.fn()}
          initialSelectedIndex={1}
          onKeyInput="ArrowUp"
        />,
      );

      expect(screen.getByTestId("party-ghost-0")).toHaveAttribute("data-selected", "true");
    });

    it("should enter swap mode with Enter key", () => {
      render(
        <PartyScreen
          party={mockParty}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onBack={vi.fn()}
          onKeyInput="Enter"
        />,
      );

      expect(screen.getByTestId("party-ghost-0")).toHaveAttribute("data-swap-source", "true");
    });

    it("should call onBack with Escape key", () => {
      const onBack = vi.fn();
      render(
        <PartyScreen
          party={mockParty}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onBack={onBack}
          onKeyInput="Escape"
        />,
      );

      expect(onBack).toHaveBeenCalled();
    });

    it("should cancel swap mode with Escape key instead of going back", () => {
      const onBack = vi.fn();
      const { rerender } = render(
        <PartyScreen
          party={mockParty}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onBack={onBack}
          onKeyInput="Enter"
        />,
      );

      expect(screen.getByTestId("swap-mode-indicator")).toBeInTheDocument();

      rerender(
        <PartyScreen
          party={mockParty}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onBack={onBack}
          onKeyInput="Escape"
        />,
      );

      expect(screen.queryByTestId("swap-mode-indicator")).not.toBeInTheDocument();
      expect(onBack).not.toHaveBeenCalled();
    });
  });

  describe("empty party", () => {
    it("should only show back button when party is empty", () => {
      render(
        <PartyScreen
          party={[]}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onBack={vi.fn()}
        />,
      );

      expect(screen.getByTestId("party-back")).toBeInTheDocument();
      expect(screen.getByTestId("party-back")).toHaveAttribute("data-selected", "true");
    });
  });
});
