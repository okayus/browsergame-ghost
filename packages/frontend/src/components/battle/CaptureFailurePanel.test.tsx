import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CaptureFailurePanel } from "./CaptureFailurePanel";

describe("CaptureFailurePanel", () => {
  const defaultProps = {
    ghostName: "ファイヤーゴースト",
    itemName: "ゴーストボール",
    onContinue: vi.fn(),
  };

  describe("rendering", () => {
    it("should render capture failure panel", () => {
      render(<CaptureFailurePanel {...defaultProps} />);

      expect(screen.getByTestId("capture-failure-panel")).toBeInTheDocument();
    });

    it("should display failure message", () => {
      render(<CaptureFailurePanel {...defaultProps} />);

      expect(screen.getByTestId("failure-message")).toHaveTextContent("捕獲失敗！");
    });

    it("should display ghost name in escape message", () => {
      render(<CaptureFailurePanel {...defaultProps} />);

      const ghostMessage = screen.getByTestId("ghost-message");
      expect(ghostMessage).toHaveTextContent("ファイヤーゴースト");
      expect(ghostMessage).toHaveTextContent("逃げ出した");
    });

    it("should display item consumed message", () => {
      render(<CaptureFailurePanel {...defaultProps} />);

      expect(screen.getByTestId("item-consumed-message")).toHaveTextContent(
        "ゴーストボールを使用した...",
      );
    });

    it("should display continue button", () => {
      render(<CaptureFailurePanel {...defaultProps} />);

      expect(screen.getByTestId("continue-button")).toHaveTextContent("続ける");
    });

    it("should display different ghost name", () => {
      render(<CaptureFailurePanel {...defaultProps} ghostName="ウォーターゴースト" />);

      expect(screen.getByTestId("ghost-message")).toHaveTextContent("ウォーターゴースト");
    });

    it("should display different item name", () => {
      render(<CaptureFailurePanel {...defaultProps} itemName="スーパーボール" />);

      expect(screen.getByTestId("item-consumed-message")).toHaveTextContent(
        "スーパーボールを使用した...",
      );
    });
  });

  describe("interactions", () => {
    it("should call onContinue when continue button is clicked", () => {
      const onContinue = vi.fn();
      render(<CaptureFailurePanel {...defaultProps} onContinue={onContinue} />);

      fireEvent.click(screen.getByTestId("continue-button"));

      expect(onContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe("keyboard navigation", () => {
    it("should call onContinue with Enter key", () => {
      const onContinue = vi.fn();
      render(<CaptureFailurePanel {...defaultProps} onContinue={onContinue} onKeyInput="Enter" />);

      expect(onContinue).toHaveBeenCalledTimes(1);
    });

    it("should call onContinue with Space key", () => {
      const onContinue = vi.fn();
      render(<CaptureFailurePanel {...defaultProps} onContinue={onContinue} onKeyInput=" " />);

      expect(onContinue).toHaveBeenCalledTimes(1);
    });

    it("should not call onContinue with other keys", () => {
      const onContinue = vi.fn();
      render(<CaptureFailurePanel {...defaultProps} onContinue={onContinue} onKeyInput="a" />);

      expect(onContinue).not.toHaveBeenCalled();
    });

    it("should not call onContinue when no key input", () => {
      const onContinue = vi.fn();
      render(<CaptureFailurePanel {...defaultProps} onContinue={onContinue} />);

      expect(onContinue).not.toHaveBeenCalled();
    });
  });
});
