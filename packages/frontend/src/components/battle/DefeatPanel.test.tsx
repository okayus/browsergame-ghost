import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DefeatPanel } from "./DefeatPanel";

describe("DefeatPanel", () => {
  describe("defeat phase", () => {
    it("should render defeat panel in defeat phase", () => {
      render(<DefeatPanel onContinue={vi.fn()} />);

      expect(screen.getByTestId("defeat-panel")).toBeInTheDocument();
      expect(screen.getByTestId("defeat-panel")).toHaveAttribute("data-phase", "defeat");
    });

    it("should display defeat message", () => {
      render(<DefeatPanel onContinue={vi.fn()} />);

      expect(screen.getByTestId("defeat-message")).toHaveTextContent("敗北...");
    });

    it("should display last ghost name if provided", () => {
      render(<DefeatPanel lastGhostName="ファイヤー" onContinue={vi.fn()} />);

      expect(screen.getByTestId("last-ghost-message")).toHaveTextContent("ファイヤー");
      expect(screen.getByTestId("last-ghost-message")).toHaveTextContent("戦闘不能になった");
    });

    it("should not display last ghost message if not provided", () => {
      render(<DefeatPanel onContinue={vi.fn()} />);

      expect(screen.queryByTestId("last-ghost-message")).not.toBeInTheDocument();
    });

    it("should advance to message phase when continue button is clicked", () => {
      render(<DefeatPanel onContinue={vi.fn()} />);

      fireEvent.click(screen.getByTestId("continue-button"));

      expect(screen.getByTestId("defeat-panel")).toHaveAttribute("data-phase", "message");
    });
  });

  describe("message phase", () => {
    it("should display darkness message", () => {
      render(<DefeatPanel onContinue={vi.fn()} />);

      // Advance to message phase
      fireEvent.click(screen.getByTestId("continue-button"));

      expect(screen.getByText("目の前が真っ暗になった...")).toBeInTheDocument();
    });

    it("should display money lost if provided", () => {
      render(<DefeatPanel moneyLost={500} onContinue={vi.fn()} />);

      // Advance to message phase
      fireEvent.click(screen.getByTestId("continue-button"));

      expect(screen.getByTestId("money-lost-message")).toHaveTextContent("500");
      expect(screen.getByTestId("money-lost-message")).toHaveTextContent(
        "ゴールドを落としてしまった",
      );
    });

    it("should not display money lost if zero", () => {
      render(<DefeatPanel moneyLost={0} onContinue={vi.fn()} />);

      // Advance to message phase
      fireEvent.click(screen.getByTestId("continue-button"));

      expect(screen.queryByTestId("money-lost-message")).not.toBeInTheDocument();
    });

    it("should not display money lost if not provided", () => {
      render(<DefeatPanel onContinue={vi.fn()} />);

      // Advance to message phase
      fireEvent.click(screen.getByTestId("continue-button"));

      expect(screen.queryByTestId("money-lost-message")).not.toBeInTheDocument();
    });

    it("should advance to recovery phase when continue button is clicked", () => {
      render(<DefeatPanel onContinue={vi.fn()} />);

      // Advance to message phase
      fireEvent.click(screen.getByTestId("continue-button"));
      // Advance to recovery phase
      fireEvent.click(screen.getByTestId("continue-button"));

      expect(screen.getByTestId("defeat-panel")).toHaveAttribute("data-phase", "recovery");
    });
  });

  describe("recovery phase", () => {
    it("should display recovery message", () => {
      render(<DefeatPanel onContinue={vi.fn()} />);

      // Advance to recovery phase
      fireEvent.click(screen.getByTestId("continue-button"));
      fireEvent.click(screen.getByTestId("continue-button"));

      expect(screen.getByTestId("recovery-message")).toHaveTextContent(
        "ゴーストセンターで回復した",
      );
    });

    it("should call onContinue when continue button is clicked", () => {
      const onContinue = vi.fn();
      render(<DefeatPanel onContinue={onContinue} />);

      // Advance to recovery phase
      fireEvent.click(screen.getByTestId("continue-button"));
      fireEvent.click(screen.getByTestId("continue-button"));
      // Click continue in recovery phase
      fireEvent.click(screen.getByTestId("continue-button"));

      expect(onContinue).toHaveBeenCalled();
    });
  });

  describe("keyboard navigation", () => {
    it("should advance phase with Enter key", () => {
      render(<DefeatPanel onContinue={vi.fn()} onKeyInput="Enter" />);

      expect(screen.getByTestId("defeat-panel")).toHaveAttribute("data-phase", "message");
    });

    it("should advance phase with Space key", () => {
      render(<DefeatPanel onContinue={vi.fn()} onKeyInput=" " />);

      expect(screen.getByTestId("defeat-panel")).toHaveAttribute("data-phase", "message");
    });

    it("should call onContinue after all phases with keyboard", () => {
      const onContinue = vi.fn();
      const { rerender } = render(<DefeatPanel onContinue={onContinue} onKeyInput="Enter" />);

      // Now in message phase - use Space to trigger again (different value)
      rerender(<DefeatPanel onContinue={onContinue} onKeyInput=" " />);
      // Now in recovery phase - clear first then trigger
      rerender(<DefeatPanel onContinue={onContinue} onKeyInput={undefined} />);
      rerender(<DefeatPanel onContinue={onContinue} onKeyInput="Enter" />);

      expect(onContinue).toHaveBeenCalled();
    });
  });

  describe("full flow", () => {
    it("should go through all phases with last ghost name and money lost", () => {
      const onContinue = vi.fn();
      render(<DefeatPanel lastGhostName="ウォーター" moneyLost={1000} onContinue={onContinue} />);

      // Phase 1: defeat
      expect(screen.getByTestId("defeat-panel")).toHaveAttribute("data-phase", "defeat");
      expect(screen.getByTestId("last-ghost-message")).toBeInTheDocument();

      // Phase 2: message
      fireEvent.click(screen.getByTestId("continue-button"));
      expect(screen.getByTestId("defeat-panel")).toHaveAttribute("data-phase", "message");
      expect(screen.getByTestId("money-lost-message")).toBeInTheDocument();

      // Phase 3: recovery
      fireEvent.click(screen.getByTestId("continue-button"));
      expect(screen.getByTestId("defeat-panel")).toHaveAttribute("data-phase", "recovery");

      // Complete
      fireEvent.click(screen.getByTestId("continue-button"));
      expect(onContinue).toHaveBeenCalled();
    });
  });
});
