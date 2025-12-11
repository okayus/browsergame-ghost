import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { DisplayMove } from "./SkillSelectPanel";
import { SkillSelectPanel } from "./SkillSelectPanel";

const mockMoves: DisplayMove[] = [
  {
    move: {
      id: "tackle",
      name: "たいあたり",
      type: "normal",
      power: 40,
      accuracy: 100,
      pp: 35,
    },
    ownedMove: { moveId: "tackle", currentPP: 30, maxPP: 35 },
  },
  {
    move: {
      id: "ember",
      name: "ひのこ",
      type: "fire",
      power: 40,
      accuracy: 100,
      pp: 25,
    },
    ownedMove: { moveId: "ember", currentPP: 20, maxPP: 25 },
  },
  {
    move: {
      id: "water_gun",
      name: "みずでっぽう",
      type: "water",
      power: 40,
      accuracy: 100,
      pp: 25,
    },
    ownedMove: { moveId: "water_gun", currentPP: 0, maxPP: 25 },
  },
];

describe("SkillSelectPanel", () => {
  describe("rendering", () => {
    it("should render skill select panel", () => {
      render(<SkillSelectPanel moves={mockMoves} onSelectMove={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("skill-select-panel")).toBeInTheDocument();
    });

    it("should render all skills", () => {
      render(<SkillSelectPanel moves={mockMoves} onSelectMove={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("skill-tackle")).toBeInTheDocument();
      expect(screen.getByTestId("skill-ember")).toBeInTheDocument();
      expect(screen.getByTestId("skill-water_gun")).toBeInTheDocument();
    });

    it("should render back button", () => {
      render(<SkillSelectPanel moves={mockMoves} onSelectMove={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("skill-back")).toBeInTheDocument();
      expect(screen.getByText("もどる")).toBeInTheDocument();
    });

    it("should display skill names", () => {
      render(<SkillSelectPanel moves={mockMoves} onSelectMove={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByText("たいあたり")).toBeInTheDocument();
      expect(screen.getByText("ひのこ")).toBeInTheDocument();
      expect(screen.getByText("みずでっぽう")).toBeInTheDocument();
    });

    it("should display skill types in Japanese", () => {
      render(<SkillSelectPanel moves={mockMoves} onSelectMove={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("skill-type-tackle")).toHaveTextContent("ノーマル");
      expect(screen.getByTestId("skill-type-ember")).toHaveTextContent("炎");
      expect(screen.getByTestId("skill-type-water_gun")).toHaveTextContent("水");
    });

    it("should display PP for each skill", () => {
      render(<SkillSelectPanel moves={mockMoves} onSelectMove={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("skill-pp-tackle")).toHaveTextContent("PP 30/35");
      expect(screen.getByTestId("skill-pp-ember")).toHaveTextContent("PP 20/25");
      expect(screen.getByTestId("skill-pp-water_gun")).toHaveTextContent("PP 0/25");
    });

    it("should show first skill as selected by default", () => {
      render(<SkillSelectPanel moves={mockMoves} onSelectMove={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("skill-tackle")).toHaveAttribute("data-selected", "true");
    });

    it("should respect initialSelectedIndex", () => {
      render(
        <SkillSelectPanel
          moves={mockMoves}
          onSelectMove={vi.fn()}
          onBack={vi.fn()}
          initialSelectedIndex={1}
        />,
      );

      expect(screen.getByTestId("skill-ember")).toHaveAttribute("data-selected", "true");
    });
  });

  describe("PP availability", () => {
    it("should disable skill with 0 PP", () => {
      render(<SkillSelectPanel moves={mockMoves} onSelectMove={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("skill-water_gun")).toBeDisabled();
      expect(screen.getByTestId("skill-water_gun")).toHaveAttribute("data-disabled", "true");
    });

    it("should enable skill with PP > 0", () => {
      render(<SkillSelectPanel moves={mockMoves} onSelectMove={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("skill-tackle")).not.toBeDisabled();
      expect(screen.getByTestId("skill-tackle")).toHaveAttribute("data-disabled", "false");
    });
  });

  describe("click selection", () => {
    it("should call onSelectMove when skill is clicked", () => {
      const onSelectMove = vi.fn();
      render(<SkillSelectPanel moves={mockMoves} onSelectMove={onSelectMove} onBack={vi.fn()} />);

      fireEvent.click(screen.getByTestId("skill-tackle"));

      expect(onSelectMove).toHaveBeenCalledWith("tackle");
    });

    it("should call onSelectMove with correct moveId", () => {
      const onSelectMove = vi.fn();
      render(<SkillSelectPanel moves={mockMoves} onSelectMove={onSelectMove} onBack={vi.fn()} />);

      fireEvent.click(screen.getByTestId("skill-ember"));

      expect(onSelectMove).toHaveBeenCalledWith("ember");
    });

    it("should not call onSelectMove when disabled skill is clicked", () => {
      const onSelectMove = vi.fn();
      render(<SkillSelectPanel moves={mockMoves} onSelectMove={onSelectMove} onBack={vi.fn()} />);

      fireEvent.click(screen.getByTestId("skill-water_gun"));

      expect(onSelectMove).not.toHaveBeenCalled();
    });

    it("should call onBack when back button is clicked", () => {
      const onBack = vi.fn();
      render(<SkillSelectPanel moves={mockMoves} onSelectMove={vi.fn()} onBack={onBack} />);

      fireEvent.click(screen.getByTestId("skill-back"));

      expect(onBack).toHaveBeenCalled();
    });
  });

  describe("keyboard navigation", () => {
    it("should navigate down with ArrowDown key", () => {
      render(
        <SkillSelectPanel
          moves={mockMoves}
          onSelectMove={vi.fn()}
          onBack={vi.fn()}
          onKeyInput="ArrowDown"
        />,
      );

      expect(screen.getByTestId("skill-ember")).toHaveAttribute("data-selected", "true");
    });

    it("should navigate up with ArrowUp key", () => {
      render(
        <SkillSelectPanel
          moves={mockMoves}
          onSelectMove={vi.fn()}
          onBack={vi.fn()}
          initialSelectedIndex={1}
          onKeyInput="ArrowUp"
        />,
      );

      expect(screen.getByTestId("skill-tackle")).toHaveAttribute("data-selected", "true");
    });

    it("should navigate with WASD keys", () => {
      const { rerender } = render(
        <SkillSelectPanel
          moves={mockMoves}
          onSelectMove={vi.fn()}
          onBack={vi.fn()}
          onKeyInput="s"
        />,
      );
      expect(screen.getByTestId("skill-ember")).toHaveAttribute("data-selected", "true");

      rerender(
        <SkillSelectPanel
          moves={mockMoves}
          onSelectMove={vi.fn()}
          onBack={vi.fn()}
          initialSelectedIndex={1}
          onKeyInput="w"
        />,
      );
      expect(screen.getByTestId("skill-tackle")).toHaveAttribute("data-selected", "true");
    });

    it("should wrap to back button when navigating down from last skill", () => {
      render(
        <SkillSelectPanel
          moves={mockMoves}
          onSelectMove={vi.fn()}
          onBack={vi.fn()}
          initialSelectedIndex={2}
          onKeyInput="ArrowDown"
        />,
      );

      expect(screen.getByTestId("skill-back")).toHaveAttribute("data-selected", "true");
    });

    it("should wrap to last item when navigating up from first skill", () => {
      render(
        <SkillSelectPanel
          moves={mockMoves}
          onSelectMove={vi.fn()}
          onBack={vi.fn()}
          onKeyInput="ArrowUp"
        />,
      );

      expect(screen.getByTestId("skill-back")).toHaveAttribute("data-selected", "true");
    });

    it("should select skill with Enter key", () => {
      const onSelectMove = vi.fn();
      render(
        <SkillSelectPanel
          moves={mockMoves}
          onSelectMove={onSelectMove}
          onBack={vi.fn()}
          onKeyInput="Enter"
        />,
      );

      expect(onSelectMove).toHaveBeenCalledWith("tackle");
    });

    it("should select skill with Space key", () => {
      const onSelectMove = vi.fn();
      render(
        <SkillSelectPanel
          moves={mockMoves}
          onSelectMove={onSelectMove}
          onBack={vi.fn()}
          onKeyInput=" "
        />,
      );

      expect(onSelectMove).toHaveBeenCalledWith("tackle");
    });

    it("should not select disabled skill with Enter key", () => {
      const onSelectMove = vi.fn();
      render(
        <SkillSelectPanel
          moves={mockMoves}
          onSelectMove={onSelectMove}
          onBack={vi.fn()}
          initialSelectedIndex={2}
          onKeyInput="Enter"
        />,
      );

      expect(onSelectMove).not.toHaveBeenCalled();
    });

    it("should call onBack with Escape key", () => {
      const onBack = vi.fn();
      render(
        <SkillSelectPanel
          moves={mockMoves}
          onSelectMove={vi.fn()}
          onBack={onBack}
          onKeyInput="Escape"
        />,
      );

      expect(onBack).toHaveBeenCalled();
    });

    it("should call onBack when back button is selected and Enter is pressed", () => {
      const onBack = vi.fn();
      render(
        <SkillSelectPanel
          moves={mockMoves}
          onSelectMove={vi.fn()}
          onBack={onBack}
          initialSelectedIndex={3}
          onKeyInput="Enter"
        />,
      );

      expect(onBack).toHaveBeenCalled();
    });
  });

  describe("empty moves", () => {
    it("should only show back button when no moves", () => {
      render(<SkillSelectPanel moves={[]} onSelectMove={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("skill-back")).toBeInTheDocument();
      expect(screen.getByTestId("skill-back")).toHaveAttribute("data-selected", "true");
    });
  });
});
