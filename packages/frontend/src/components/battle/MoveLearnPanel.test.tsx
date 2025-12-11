import type { Move, OwnedMove } from "@ghost-game/shared";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MoveLearnPanel } from "./MoveLearnPanel";

const mockNewMove: Move = {
  id: "ember",
  name: "ひのこ",
  type: "fire",
  power: 40,
  accuracy: 100,
  pp: 25,
  description: "炎で攻撃する",
};

const mockCurrentMoves: OwnedMove[] = [
  { moveId: "tackle", currentPP: 35, maxPP: 35 },
  { moveId: "growl", currentPP: 40, maxPP: 40 },
  { moveId: "scratch", currentPP: 35, maxPP: 35 },
  { moveId: "leer", currentPP: 30, maxPP: 30 },
];

const mockMovesNotFull: OwnedMove[] = [
  { moveId: "tackle", currentPP: 35, maxPP: 35 },
  { moveId: "growl", currentPP: 40, maxPP: 40 },
];

const mockMoveData: Record<string, Move> = {
  tackle: {
    id: "tackle",
    name: "たいあたり",
    type: "normal",
    power: 40,
    accuracy: 100,
    pp: 35,
  },
  growl: {
    id: "growl",
    name: "なきごえ",
    type: "normal",
    power: 0,
    accuracy: 100,
    pp: 40,
  },
  scratch: {
    id: "scratch",
    name: "ひっかく",
    type: "normal",
    power: 40,
    accuracy: 100,
    pp: 35,
  },
  leer: {
    id: "leer",
    name: "にらみつける",
    type: "normal",
    power: 0,
    accuracy: 100,
    pp: 30,
  },
};

const mockGetMoveData = (moveId: string): Move | undefined => {
  return mockMoveData[moveId];
};

describe("MoveLearnPanel", () => {
  describe("confirm mode (moves not full)", () => {
    it("should render in confirm mode", () => {
      render(
        <MoveLearnPanel
          ghostName="ゴースト"
          newMove={mockNewMove}
          currentMoves={mockMovesNotFull}
          getMoveData={mockGetMoveData}
          onLearnMove={vi.fn()}
        />,
      );

      expect(screen.getByTestId("move-learn-panel")).toBeInTheDocument();
      expect(screen.getByTestId("move-learn-panel")).toHaveAttribute("data-mode", "confirm");
    });

    it("should display learn message", () => {
      render(
        <MoveLearnPanel
          ghostName="ファイヤー"
          newMove={mockNewMove}
          currentMoves={mockMovesNotFull}
          getMoveData={mockGetMoveData}
          onLearnMove={vi.fn()}
        />,
      );

      expect(screen.getByTestId("learn-message")).toHaveTextContent("ファイヤーは");
    });

    it("should display new move name", () => {
      render(
        <MoveLearnPanel
          ghostName="ゴースト"
          newMove={mockNewMove}
          currentMoves={mockMovesNotFull}
          getMoveData={mockGetMoveData}
          onLearnMove={vi.fn()}
        />,
      );

      expect(screen.getByTestId("new-move-name")).toHaveTextContent("ひのこ");
    });

    it("should not show max moves warning when moves not full", () => {
      render(
        <MoveLearnPanel
          ghostName="ゴースト"
          newMove={mockNewMove}
          currentMoves={mockMovesNotFull}
          getMoveData={mockGetMoveData}
          onLearnMove={vi.fn()}
        />,
      );

      expect(screen.queryByTestId("max-moves-warning")).not.toBeInTheDocument();
    });

    it("should call onLearnMove when learn button is clicked", () => {
      const onLearnMove = vi.fn();
      render(
        <MoveLearnPanel
          ghostName="ゴースト"
          newMove={mockNewMove}
          currentMoves={mockMovesNotFull}
          getMoveData={mockGetMoveData}
          onLearnMove={onLearnMove}
        />,
      );

      fireEvent.click(screen.getByTestId("learn-button"));

      expect(onLearnMove).toHaveBeenCalledWith(2); // Add at index 2 (after existing 2 moves)
    });

    it("should call onLearnMove with -1 when give up is clicked", () => {
      const onLearnMove = vi.fn();
      render(
        <MoveLearnPanel
          ghostName="ゴースト"
          newMove={mockNewMove}
          currentMoves={mockMovesNotFull}
          getMoveData={mockGetMoveData}
          onLearnMove={onLearnMove}
        />,
      );

      fireEvent.click(screen.getByTestId("give-up-button"));

      expect(onLearnMove).toHaveBeenCalledWith(-1);
    });
  });

  describe("confirm mode (moves full)", () => {
    it("should show max moves warning when moves are full", () => {
      render(
        <MoveLearnPanel
          ghostName="ゴースト"
          newMove={mockNewMove}
          currentMoves={mockCurrentMoves}
          getMoveData={mockGetMoveData}
          onLearnMove={vi.fn()}
        />,
      );

      expect(screen.getByTestId("max-moves-warning")).toBeInTheDocument();
    });

    it("should navigate to select mode when learn button is clicked with full moves", () => {
      render(
        <MoveLearnPanel
          ghostName="ゴースト"
          newMove={mockNewMove}
          currentMoves={mockCurrentMoves}
          getMoveData={mockGetMoveData}
          onLearnMove={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByTestId("learn-button"));

      expect(screen.getByTestId("move-learn-panel")).toHaveAttribute("data-mode", "select");
    });
  });

  describe("select mode", () => {
    it("should display all current moves", () => {
      render(
        <MoveLearnPanel
          ghostName="ゴースト"
          newMove={mockNewMove}
          currentMoves={mockCurrentMoves}
          getMoveData={mockGetMoveData}
          onLearnMove={vi.fn()}
        />,
      );

      // Navigate to select mode
      fireEvent.click(screen.getByTestId("learn-button"));

      expect(screen.getByTestId("current-move-0")).toBeInTheDocument();
      expect(screen.getByTestId("current-move-1")).toBeInTheDocument();
      expect(screen.getByTestId("current-move-2")).toBeInTheDocument();
      expect(screen.getByTestId("current-move-3")).toBeInTheDocument();
    });

    it("should display give up button in select mode", () => {
      render(
        <MoveLearnPanel
          ghostName="ゴースト"
          newMove={mockNewMove}
          currentMoves={mockCurrentMoves}
          getMoveData={mockGetMoveData}
          onLearnMove={vi.fn()}
        />,
      );

      // Navigate to select mode
      fireEvent.click(screen.getByTestId("learn-button"));

      expect(screen.getByTestId("select-give-up")).toBeInTheDocument();
    });

    it("should call onLearnMove with index when move is selected", () => {
      const onLearnMove = vi.fn();
      render(
        <MoveLearnPanel
          ghostName="ゴースト"
          newMove={mockNewMove}
          currentMoves={mockCurrentMoves}
          getMoveData={mockGetMoveData}
          onLearnMove={onLearnMove}
        />,
      );

      // Navigate to select mode
      fireEvent.click(screen.getByTestId("learn-button"));
      // Select first move to replace
      fireEvent.click(screen.getByTestId("current-move-1"));

      expect(onLearnMove).toHaveBeenCalledWith(1);
    });

    it("should call onLearnMove with -1 when give up is clicked in select mode", () => {
      const onLearnMove = vi.fn();
      render(
        <MoveLearnPanel
          ghostName="ゴースト"
          newMove={mockNewMove}
          currentMoves={mockCurrentMoves}
          getMoveData={mockGetMoveData}
          onLearnMove={onLearnMove}
        />,
      );

      // Navigate to select mode
      fireEvent.click(screen.getByTestId("learn-button"));
      // Click give up
      fireEvent.click(screen.getByTestId("select-give-up"));

      expect(onLearnMove).toHaveBeenCalledWith(-1);
    });
  });

  describe("keyboard navigation", () => {
    it("should navigate with ArrowDown key in confirm mode", () => {
      render(
        <MoveLearnPanel
          ghostName="ゴースト"
          newMove={mockNewMove}
          currentMoves={mockCurrentMoves}
          getMoveData={mockGetMoveData}
          onLearnMove={vi.fn()}
          onKeyInput="ArrowDown"
        />,
      );

      expect(screen.getByTestId("give-up-button")).toHaveAttribute("data-selected", "true");
    });

    it("should select with Enter key in confirm mode", () => {
      render(
        <MoveLearnPanel
          ghostName="ゴースト"
          newMove={mockNewMove}
          currentMoves={mockCurrentMoves}
          getMoveData={mockGetMoveData}
          onLearnMove={vi.fn()}
          onKeyInput="Enter"
        />,
      );

      // Should navigate to select mode
      expect(screen.getByTestId("move-learn-panel")).toHaveAttribute("data-mode", "select");
    });

    it("should go back to confirm mode with Escape key", () => {
      const { rerender } = render(
        <MoveLearnPanel
          ghostName="ゴースト"
          newMove={mockNewMove}
          currentMoves={mockCurrentMoves}
          getMoveData={mockGetMoveData}
          onLearnMove={vi.fn()}
        />,
      );

      // Navigate to select mode
      fireEvent.click(screen.getByTestId("learn-button"));
      expect(screen.getByTestId("move-learn-panel")).toHaveAttribute("data-mode", "select");

      // Press Escape
      rerender(
        <MoveLearnPanel
          ghostName="ゴースト"
          newMove={mockNewMove}
          currentMoves={mockCurrentMoves}
          getMoveData={mockGetMoveData}
          onLearnMove={vi.fn()}
          onKeyInput="Escape"
        />,
      );

      expect(screen.getByTestId("move-learn-panel")).toHaveAttribute("data-mode", "confirm");
    });

    it("should navigate with W key", () => {
      render(
        <MoveLearnPanel
          ghostName="ゴースト"
          newMove={mockNewMove}
          currentMoves={mockCurrentMoves}
          getMoveData={mockGetMoveData}
          onLearnMove={vi.fn()}
          onKeyInput="w"
        />,
      );

      // Wraps around to give up button
      expect(screen.getByTestId("give-up-button")).toHaveAttribute("data-selected", "true");
    });

    it("should navigate with S key", () => {
      render(
        <MoveLearnPanel
          ghostName="ゴースト"
          newMove={mockNewMove}
          currentMoves={mockCurrentMoves}
          getMoveData={mockGetMoveData}
          onLearnMove={vi.fn()}
          onKeyInput="s"
        />,
      );

      expect(screen.getByTestId("give-up-button")).toHaveAttribute("data-selected", "true");
    });
  });
});
