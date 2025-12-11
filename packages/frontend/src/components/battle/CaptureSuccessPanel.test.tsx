import type { OwnedGhost } from "@ghost-game/shared";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CaptureSuccessPanel } from "./CaptureSuccessPanel";

const mockCapturedGhost: OwnedGhost = {
  id: "captured-1",
  speciesId: "ghost_001",
  nickname: undefined,
  level: 5,
  experience: 100,
  currentHp: 30,
  maxHp: 30,
  stats: {
    hp: 30,
    attack: 15,
    defense: 12,
    speed: 10,
  },
  moves: [{ moveId: "tackle", currentPP: 35, maxPP: 35 }],
};

const mockParty: OwnedGhost[] = [
  {
    id: "party-1",
    speciesId: "ghost_002",
    nickname: "リーダー",
    level: 10,
    experience: 500,
    currentHp: 50,
    maxHp: 50,
    stats: {
      hp: 50,
      attack: 20,
      defense: 18,
      speed: 15,
    },
    moves: [
      { moveId: "tackle", currentPP: 35, maxPP: 35 },
      { moveId: "ember", currentPP: 25, maxPP: 25 },
    ],
  },
  {
    id: "party-2",
    speciesId: "ghost_003",
    nickname: undefined,
    level: 8,
    experience: 300,
    currentHp: 40,
    maxHp: 45,
    stats: {
      hp: 45,
      attack: 18,
      defense: 15,
      speed: 12,
    },
    moves: [
      { moveId: "tackle", currentPP: 35, maxPP: 35 },
      { moveId: "water_gun", currentPP: 25, maxPP: 25 },
    ],
  },
];

const mockFullParty: OwnedGhost[] = [
  ...mockParty,
  {
    id: "party-3",
    speciesId: "ghost_004",
    nickname: undefined,
    level: 6,
    experience: 200,
    currentHp: 35,
    maxHp: 35,
    stats: {
      hp: 35,
      attack: 16,
      defense: 14,
      speed: 11,
    },
    moves: [{ moveId: "tackle", currentPP: 35, maxPP: 35 }],
  },
];

const mockGetSpeciesName = (speciesId: string): string => {
  const names: Record<string, string> = {
    ghost_001: "ゴースト",
    ghost_002: "ファイヤー",
    ghost_003: "ウォーター",
    ghost_004: "グラス",
  };
  return names[speciesId] || "不明";
};

const mockGetSpeciesType = (speciesId: string) => {
  const types: Record<string, "fire" | "water" | "grass" | "electric" | "ghost" | "normal"> = {
    ghost_001: "ghost",
    ghost_002: "fire",
    ghost_003: "water",
    ghost_004: "grass",
  };
  return types[speciesId] || "normal";
};

describe("CaptureSuccessPanel", () => {
  describe("success mode (party has space)", () => {
    it("should render capture success panel in success mode", () => {
      render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockParty}
          partyLimit={6}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={vi.fn()}
          onSwapWithParty={vi.fn()}
        />,
      );

      expect(screen.getByTestId("capture-success-panel")).toBeInTheDocument();
      expect(screen.getByTestId("capture-success-panel")).toHaveAttribute("data-mode", "success");
    });

    it("should display capture success message", () => {
      render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockParty}
          partyLimit={6}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={vi.fn()}
          onSwapWithParty={vi.fn()}
        />,
      );

      expect(screen.getByTestId("capture-message")).toHaveTextContent("捕獲成功！");
    });

    it("should display captured ghost name", () => {
      render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockParty}
          partyLimit={6}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={vi.fn()}
          onSwapWithParty={vi.fn()}
        />,
      );

      expect(screen.getByTestId("captured-ghost-name")).toHaveTextContent("ゴースト");
    });

    it("should display nickname if set", () => {
      const ghostWithNickname = { ...mockCapturedGhost, nickname: "ニックネーム" };
      render(
        <CaptureSuccessPanel
          capturedGhost={ghostWithNickname}
          party={mockParty}
          partyLimit={6}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={vi.fn()}
          onSwapWithParty={vi.fn()}
        />,
      );

      expect(screen.getByTestId("captured-ghost-name")).toHaveTextContent("ニックネーム");
    });

    it("should display confirm button", () => {
      render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockParty}
          partyLimit={6}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={vi.fn()}
          onSwapWithParty={vi.fn()}
        />,
      );

      expect(screen.getByTestId("confirm-button")).toBeInTheDocument();
      expect(screen.getByText("OK")).toBeInTheDocument();
    });

    it("should call onAddToParty when confirm button is clicked", () => {
      const onAddToParty = vi.fn();
      render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockParty}
          partyLimit={6}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={onAddToParty}
          onSendToBox={vi.fn()}
          onSwapWithParty={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByTestId("confirm-button"));

      expect(onAddToParty).toHaveBeenCalled();
    });

    it("should call onAddToParty with Enter key", () => {
      const onAddToParty = vi.fn();
      render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockParty}
          partyLimit={6}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={onAddToParty}
          onSendToBox={vi.fn()}
          onSwapWithParty={vi.fn()}
          onKeyInput="Enter"
        />,
      );

      expect(onAddToParty).toHaveBeenCalled();
    });
  });

  describe("choice mode (party is full)", () => {
    it("should render in choice mode when party is full", () => {
      render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockFullParty}
          partyLimit={3}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={vi.fn()}
          onSwapWithParty={vi.fn()}
        />,
      );

      expect(screen.getByTestId("capture-success-panel")).toHaveAttribute("data-mode", "choice");
    });

    it("should display party full message", () => {
      render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockFullParty}
          partyLimit={3}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={vi.fn()}
          onSwapWithParty={vi.fn()}
        />,
      );

      expect(screen.getByTestId("party-full-message")).toHaveTextContent("パーティがいっぱいです");
    });

    it("should display send to box button", () => {
      render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockFullParty}
          partyLimit={3}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={vi.fn()}
          onSwapWithParty={vi.fn()}
        />,
      );

      expect(screen.getByTestId("send-to-box-button")).toBeInTheDocument();
      expect(screen.getByText("ボックスに送る")).toBeInTheDocument();
    });

    it("should display swap button", () => {
      render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockFullParty}
          partyLimit={3}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={vi.fn()}
          onSwapWithParty={vi.fn()}
        />,
      );

      expect(screen.getByTestId("swap-button")).toBeInTheDocument();
      expect(screen.getByText("パーティと入れ替える")).toBeInTheDocument();
    });

    it("should have send to box selected by default", () => {
      render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockFullParty}
          partyLimit={3}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={vi.fn()}
          onSwapWithParty={vi.fn()}
        />,
      );

      expect(screen.getByTestId("send-to-box-button")).toHaveAttribute("data-selected", "true");
      expect(screen.getByTestId("swap-button")).toHaveAttribute("data-selected", "false");
    });

    it("should call onSendToBox when send to box is clicked", () => {
      const onSendToBox = vi.fn();
      render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockFullParty}
          partyLimit={3}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={onSendToBox}
          onSwapWithParty={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByTestId("send-to-box-button"));

      expect(onSendToBox).toHaveBeenCalled();
    });

    it("should navigate to swap mode when swap button is clicked", () => {
      render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockFullParty}
          partyLimit={3}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={vi.fn()}
          onSwapWithParty={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByTestId("swap-button"));

      expect(screen.getByTestId("capture-success-panel")).toHaveAttribute("data-mode", "swap");
    });
  });

  describe("keyboard navigation in choice mode", () => {
    it("should navigate down with ArrowDown key", () => {
      render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockFullParty}
          partyLimit={3}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={vi.fn()}
          onSwapWithParty={vi.fn()}
          onKeyInput="ArrowDown"
        />,
      );

      expect(screen.getByTestId("swap-button")).toHaveAttribute("data-selected", "true");
    });

    it("should navigate up with ArrowUp key", () => {
      render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockFullParty}
          partyLimit={3}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={vi.fn()}
          onSwapWithParty={vi.fn()}
          onKeyInput="ArrowUp"
        />,
      );

      // Wraps around to swap button (last option)
      expect(screen.getByTestId("swap-button")).toHaveAttribute("data-selected", "true");
    });

    it("should call onSendToBox with Enter key when send to box is selected", () => {
      const onSendToBox = vi.fn();
      render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockFullParty}
          partyLimit={3}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={onSendToBox}
          onSwapWithParty={vi.fn()}
          onKeyInput="Enter"
        />,
      );

      expect(onSendToBox).toHaveBeenCalled();
    });
  });

  describe("swap mode", () => {
    it("should display party ghosts for swapping", () => {
      render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockFullParty}
          partyLimit={3}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={vi.fn()}
          onSwapWithParty={vi.fn()}
        />,
      );

      // Navigate to swap mode
      fireEvent.click(screen.getByTestId("swap-button"));

      expect(screen.getByTestId("swap-target-0")).toBeInTheDocument();
      expect(screen.getByTestId("swap-target-1")).toBeInTheDocument();
      expect(screen.getByTestId("swap-target-2")).toBeInTheDocument();
    });

    it("should display back button in swap mode", () => {
      render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockFullParty}
          partyLimit={3}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={vi.fn()}
          onSwapWithParty={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByTestId("swap-button"));

      expect(screen.getByTestId("swap-back")).toBeInTheDocument();
      expect(screen.getByText("もどる")).toBeInTheDocument();
    });

    it("should call onSwapWithParty when ghost is selected", () => {
      const onSwapWithParty = vi.fn();
      render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockFullParty}
          partyLimit={3}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={vi.fn()}
          onSwapWithParty={onSwapWithParty}
        />,
      );

      fireEvent.click(screen.getByTestId("swap-button"));
      fireEvent.click(screen.getByTestId("swap-target-1"));

      expect(onSwapWithParty).toHaveBeenCalledWith(1);
    });

    it("should go back to choice mode when back button is clicked", () => {
      render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockFullParty}
          partyLimit={3}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={vi.fn()}
          onSwapWithParty={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByTestId("swap-button"));
      expect(screen.getByTestId("capture-success-panel")).toHaveAttribute("data-mode", "swap");

      fireEvent.click(screen.getByTestId("swap-back"));
      expect(screen.getByTestId("capture-success-panel")).toHaveAttribute("data-mode", "choice");
    });

    it("should go back to choice mode with Escape key", () => {
      const { rerender } = render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockFullParty}
          partyLimit={3}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={vi.fn()}
          onSwapWithParty={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByTestId("swap-button"));
      expect(screen.getByTestId("capture-success-panel")).toHaveAttribute("data-mode", "swap");

      rerender(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockFullParty}
          partyLimit={3}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={vi.fn()}
          onSwapWithParty={vi.fn()}
          onKeyInput="Escape"
        />,
      );

      expect(screen.getByTestId("capture-success-panel")).toHaveAttribute("data-mode", "choice");
    });
  });

  describe("keyboard navigation with WASD", () => {
    it("should navigate with W key (up)", () => {
      render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockFullParty}
          partyLimit={3}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={vi.fn()}
          onSwapWithParty={vi.fn()}
          onKeyInput="w"
        />,
      );

      expect(screen.getByTestId("swap-button")).toHaveAttribute("data-selected", "true");
    });

    it("should navigate with S key (down)", () => {
      render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockFullParty}
          partyLimit={3}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={vi.fn()}
          onSwapWithParty={vi.fn()}
          onKeyInput="s"
        />,
      );

      expect(screen.getByTestId("swap-button")).toHaveAttribute("data-selected", "true");
    });

    it("should confirm with Space key", () => {
      const onSendToBox = vi.fn();
      render(
        <CaptureSuccessPanel
          capturedGhost={mockCapturedGhost}
          party={mockFullParty}
          partyLimit={3}
          getSpeciesName={mockGetSpeciesName}
          getSpeciesType={mockGetSpeciesType}
          onAddToParty={vi.fn()}
          onSendToBox={onSendToBox}
          onSwapWithParty={vi.fn()}
          onKeyInput=" "
        />,
      );

      expect(onSendToBox).toHaveBeenCalled();
    });
  });
});
