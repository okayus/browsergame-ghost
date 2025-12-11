import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EscapeResultPanel } from "./EscapeResultPanel";

describe("EscapeResultPanel", () => {
  describe("escape success", () => {
    it("should render escape result panel with success", () => {
      render(<EscapeResultPanel success={true} onSuccess={vi.fn()} onFailure={vi.fn()} />);

      expect(screen.getByTestId("escape-result-panel")).toBeInTheDocument();
      expect(screen.getByTestId("escape-result-panel")).toHaveAttribute("data-success", "true");
    });

    it("should display success message", () => {
      render(<EscapeResultPanel success={true} onSuccess={vi.fn()} onFailure={vi.fn()} />);

      expect(screen.getByTestId("escape-message")).toHaveTextContent("逃げ切れた！");
    });

    it("should display map return button", () => {
      render(<EscapeResultPanel success={true} onSuccess={vi.fn()} onFailure={vi.fn()} />);

      expect(screen.getByTestId("continue-button")).toHaveTextContent("マップに戻る");
    });

    it("should call onSuccess when continue button is clicked", () => {
      const onSuccess = vi.fn();
      render(<EscapeResultPanel success={true} onSuccess={onSuccess} onFailure={vi.fn()} />);

      fireEvent.click(screen.getByTestId("continue-button"));

      expect(onSuccess).toHaveBeenCalled();
    });

    it("should not call onFailure when success", () => {
      const onFailure = vi.fn();
      render(<EscapeResultPanel success={true} onSuccess={vi.fn()} onFailure={onFailure} />);

      fireEvent.click(screen.getByTestId("continue-button"));

      expect(onFailure).not.toHaveBeenCalled();
    });
  });

  describe("escape failure", () => {
    it("should render escape result panel with failure", () => {
      render(<EscapeResultPanel success={false} onSuccess={vi.fn()} onFailure={vi.fn()} />);

      expect(screen.getByTestId("escape-result-panel")).toBeInTheDocument();
      expect(screen.getByTestId("escape-result-panel")).toHaveAttribute("data-success", "false");
    });

    it("should display failure message", () => {
      render(<EscapeResultPanel success={false} onSuccess={vi.fn()} onFailure={vi.fn()} />);

      expect(screen.getByTestId("escape-message")).toHaveTextContent("逃げられなかった！");
    });

    it("should display continue button", () => {
      render(<EscapeResultPanel success={false} onSuccess={vi.fn()} onFailure={vi.fn()} />);

      expect(screen.getByTestId("continue-button")).toHaveTextContent("続ける");
    });

    it("should call onFailure when continue button is clicked", () => {
      const onFailure = vi.fn();
      render(<EscapeResultPanel success={false} onSuccess={vi.fn()} onFailure={onFailure} />);

      fireEvent.click(screen.getByTestId("continue-button"));

      expect(onFailure).toHaveBeenCalled();
    });

    it("should not call onSuccess when failure", () => {
      const onSuccess = vi.fn();
      render(<EscapeResultPanel success={false} onSuccess={onSuccess} onFailure={vi.fn()} />);

      fireEvent.click(screen.getByTestId("continue-button"));

      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("should display attempt count if provided and greater than 1", () => {
      render(
        <EscapeResultPanel
          success={false}
          attemptCount={3}
          onSuccess={vi.fn()}
          onFailure={vi.fn()}
        />,
      );

      expect(screen.getByTestId("attempt-count")).toHaveTextContent("逃走試行: 3回目");
    });

    it("should not display attempt count if 1", () => {
      render(
        <EscapeResultPanel
          success={false}
          attemptCount={1}
          onSuccess={vi.fn()}
          onFailure={vi.fn()}
        />,
      );

      expect(screen.queryByTestId("attempt-count")).not.toBeInTheDocument();
    });

    it("should not display attempt count if not provided", () => {
      render(<EscapeResultPanel success={false} onSuccess={vi.fn()} onFailure={vi.fn()} />);

      expect(screen.queryByTestId("attempt-count")).not.toBeInTheDocument();
    });
  });

  describe("keyboard navigation", () => {
    it("should call onSuccess with Enter key when success", () => {
      const onSuccess = vi.fn();
      render(
        <EscapeResultPanel
          success={true}
          onSuccess={onSuccess}
          onFailure={vi.fn()}
          onKeyInput="Enter"
        />,
      );

      expect(onSuccess).toHaveBeenCalled();
    });

    it("should call onFailure with Enter key when failure", () => {
      const onFailure = vi.fn();
      render(
        <EscapeResultPanel
          success={false}
          onSuccess={vi.fn()}
          onFailure={onFailure}
          onKeyInput="Enter"
        />,
      );

      expect(onFailure).toHaveBeenCalled();
    });

    it("should call onSuccess with Space key when success", () => {
      const onSuccess = vi.fn();
      render(
        <EscapeResultPanel
          success={true}
          onSuccess={onSuccess}
          onFailure={vi.fn()}
          onKeyInput=" "
        />,
      );

      expect(onSuccess).toHaveBeenCalled();
    });

    it("should call onFailure with Space key when failure", () => {
      const onFailure = vi.fn();
      render(
        <EscapeResultPanel
          success={false}
          onSuccess={vi.fn()}
          onFailure={onFailure}
          onKeyInput=" "
        />,
      );

      expect(onFailure).toHaveBeenCalled();
    });
  });
});
