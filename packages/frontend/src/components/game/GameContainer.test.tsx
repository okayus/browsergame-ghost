import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GameContainer } from "./GameContainer";

describe("GameContainer", () => {
  describe("rendering", () => {
    it("should render children", () => {
      render(
        <GameContainer currentScreen="map">
          <div data-testid="test-child">Test Content</div>
        </GameContainer>,
      );

      expect(screen.getByTestId("test-child")).toBeInTheDocument();
      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    it("should have correct data-screen attribute", () => {
      render(
        <GameContainer currentScreen="battle">
          <div>Content</div>
        </GameContainer>,
      );

      expect(screen.getByTestId("game-container")).toHaveAttribute("data-screen", "battle");
    });

    it("should update data-screen attribute when currentScreen changes", () => {
      const { rerender } = render(
        <GameContainer currentScreen="map">
          <div>Content</div>
        </GameContainer>,
      );

      expect(screen.getByTestId("game-container")).toHaveAttribute("data-screen", "map");

      rerender(
        <GameContainer currentScreen="party">
          <div>Content</div>
        </GameContainer>,
      );

      expect(screen.getByTestId("game-container")).toHaveAttribute("data-screen", "party");
    });

    it("should be focusable", () => {
      render(
        <GameContainer currentScreen="map">
          <div>Content</div>
        </GameContainer>,
      );

      const container = screen.getByTestId("game-container");
      expect(container).toHaveAttribute("tabIndex", "0");
    });
  });

  describe("keyboard events", () => {
    it("should call onKeyDown when a supported key is pressed", () => {
      const onKeyDown = vi.fn();
      render(
        <GameContainer currentScreen="map" onKeyDown={onKeyDown}>
          <div>Content</div>
        </GameContainer>,
      );

      fireEvent.keyDown(window, { key: "w" });
      expect(onKeyDown).toHaveBeenCalledWith("w");

      fireEvent.keyDown(window, { key: "Enter" });
      expect(onKeyDown).toHaveBeenCalledWith("Enter");
    });

    it("should handle WASD keys", () => {
      const onKeyDown = vi.fn();
      render(
        <GameContainer currentScreen="map" onKeyDown={onKeyDown}>
          <div>Content</div>
        </GameContainer>,
      );

      fireEvent.keyDown(window, { key: "w" });
      fireEvent.keyDown(window, { key: "a" });
      fireEvent.keyDown(window, { key: "s" });
      fireEvent.keyDown(window, { key: "d" });

      expect(onKeyDown).toHaveBeenCalledTimes(4);
      expect(onKeyDown).toHaveBeenNthCalledWith(1, "w");
      expect(onKeyDown).toHaveBeenNthCalledWith(2, "a");
      expect(onKeyDown).toHaveBeenNthCalledWith(3, "s");
      expect(onKeyDown).toHaveBeenNthCalledWith(4, "d");
    });

    it("should handle arrow keys", () => {
      const onKeyDown = vi.fn();
      render(
        <GameContainer currentScreen="map" onKeyDown={onKeyDown}>
          <div>Content</div>
        </GameContainer>,
      );

      fireEvent.keyDown(window, { key: "ArrowUp" });
      fireEvent.keyDown(window, { key: "ArrowDown" });
      fireEvent.keyDown(window, { key: "ArrowLeft" });
      fireEvent.keyDown(window, { key: "ArrowRight" });

      expect(onKeyDown).toHaveBeenCalledTimes(4);
      expect(onKeyDown).toHaveBeenNthCalledWith(1, "ArrowUp");
      expect(onKeyDown).toHaveBeenNthCalledWith(2, "ArrowDown");
      expect(onKeyDown).toHaveBeenNthCalledWith(3, "ArrowLeft");
      expect(onKeyDown).toHaveBeenNthCalledWith(4, "ArrowRight");
    });

    it("should handle Enter, Escape, and Space keys", () => {
      const onKeyDown = vi.fn();
      render(
        <GameContainer currentScreen="map" onKeyDown={onKeyDown}>
          <div>Content</div>
        </GameContainer>,
      );

      fireEvent.keyDown(window, { key: "Enter" });
      fireEvent.keyDown(window, { key: "Escape" });
      fireEvent.keyDown(window, { key: " " });

      expect(onKeyDown).toHaveBeenCalledTimes(3);
      expect(onKeyDown).toHaveBeenNthCalledWith(1, "Enter");
      expect(onKeyDown).toHaveBeenNthCalledWith(2, "Escape");
      expect(onKeyDown).toHaveBeenNthCalledWith(3, " ");
    });

    it("should handle number keys 1-4", () => {
      const onKeyDown = vi.fn();
      render(
        <GameContainer currentScreen="map" onKeyDown={onKeyDown}>
          <div>Content</div>
        </GameContainer>,
      );

      fireEvent.keyDown(window, { key: "1" });
      fireEvent.keyDown(window, { key: "2" });
      fireEvent.keyDown(window, { key: "3" });
      fireEvent.keyDown(window, { key: "4" });

      expect(onKeyDown).toHaveBeenCalledTimes(4);
      expect(onKeyDown).toHaveBeenNthCalledWith(1, "1");
      expect(onKeyDown).toHaveBeenNthCalledWith(2, "2");
      expect(onKeyDown).toHaveBeenNthCalledWith(3, "3");
      expect(onKeyDown).toHaveBeenNthCalledWith(4, "4");
    });

    it("should not call onKeyDown for unsupported keys", () => {
      const onKeyDown = vi.fn();
      render(
        <GameContainer currentScreen="map" onKeyDown={onKeyDown}>
          <div>Content</div>
        </GameContainer>,
      );

      fireEvent.keyDown(window, { key: "x" });
      fireEvent.keyDown(window, { key: "Tab" });
      fireEvent.keyDown(window, { key: "q" });

      expect(onKeyDown).not.toHaveBeenCalled();
    });

    it("should not call onKeyDown when typing in input field", () => {
      const onKeyDown = vi.fn();
      render(
        <GameContainer currentScreen="map" onKeyDown={onKeyDown}>
          <input data-testid="test-input" type="text" />
        </GameContainer>,
      );

      const input = screen.getByTestId("test-input");
      fireEvent.keyDown(input, { key: "w" });

      expect(onKeyDown).not.toHaveBeenCalled();
    });

    it("should not call onKeyDown when typing in textarea", () => {
      const onKeyDown = vi.fn();
      render(
        <GameContainer currentScreen="map" onKeyDown={onKeyDown}>
          <textarea data-testid="test-textarea" />
        </GameContainer>,
      );

      const textarea = screen.getByTestId("test-textarea");
      fireEvent.keyDown(textarea, { key: "w" });

      expect(onKeyDown).not.toHaveBeenCalled();
    });

    it("should work without onKeyDown handler", () => {
      render(
        <GameContainer currentScreen="map">
          <div>Content</div>
        </GameContainer>,
      );

      // Should not throw
      expect(() => {
        fireEvent.keyDown(window, { key: "w" });
      }).not.toThrow();
    });
  });

  describe("cleanup", () => {
    it("should remove event listener on unmount", () => {
      const onKeyDown = vi.fn();
      const { unmount } = render(
        <GameContainer currentScreen="map" onKeyDown={onKeyDown}>
          <div>Content</div>
        </GameContainer>,
      );

      unmount();

      fireEvent.keyDown(window, { key: "w" });
      expect(onKeyDown).not.toHaveBeenCalled();
    });
  });
});
