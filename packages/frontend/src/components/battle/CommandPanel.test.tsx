import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommandPanel } from "./CommandPanel";

describe("CommandPanel", () => {
  describe("rendering", () => {
    it("should render command panel", () => {
      render(<CommandPanel onSelectCommand={vi.fn()} />);

      expect(screen.getByTestId("command-panel")).toBeInTheDocument();
    });

    it("should render all four commands", () => {
      render(<CommandPanel onSelectCommand={vi.fn()} />);

      expect(screen.getByTestId("command-fight")).toBeInTheDocument();
      expect(screen.getByTestId("command-item")).toBeInTheDocument();
      expect(screen.getByTestId("command-capture")).toBeInTheDocument();
      expect(screen.getByTestId("command-run")).toBeInTheDocument();
    });

    it("should display command labels in Japanese", () => {
      render(<CommandPanel onSelectCommand={vi.fn()} />);

      expect(screen.getByText("たたかう")).toBeInTheDocument();
      expect(screen.getByText("アイテム")).toBeInTheDocument();
      expect(screen.getByText("捕まえる")).toBeInTheDocument();
      expect(screen.getByText("逃げる")).toBeInTheDocument();
    });

    it("should display command description", () => {
      render(<CommandPanel onSelectCommand={vi.fn()} />);

      expect(screen.getByTestId("command-description")).toBeInTheDocument();
    });

    it("should show first command as selected by default", () => {
      render(<CommandPanel onSelectCommand={vi.fn()} />);

      expect(screen.getByTestId("command-fight")).toHaveAttribute("data-selected", "true");
    });

    it("should respect initialSelectedIndex", () => {
      render(<CommandPanel onSelectCommand={vi.fn()} initialSelectedIndex={2} />);

      expect(screen.getByTestId("command-capture")).toHaveAttribute("data-selected", "true");
    });
  });

  describe("capture command availability", () => {
    it("should enable capture command when canCapture is true", () => {
      render(<CommandPanel onSelectCommand={vi.fn()} canCapture={true} />);

      expect(screen.getByTestId("command-capture")).not.toBeDisabled();
      expect(screen.getByTestId("command-capture")).toHaveAttribute("data-disabled", "false");
    });

    it("should disable capture command when canCapture is false", () => {
      render(<CommandPanel onSelectCommand={vi.fn()} canCapture={false} />);

      expect(screen.getByTestId("command-capture")).toBeDisabled();
      expect(screen.getByTestId("command-capture")).toHaveAttribute("data-disabled", "true");
    });
  });

  describe("click selection", () => {
    it("should call onSelectCommand when command is clicked", () => {
      const onSelectCommand = vi.fn();
      render(<CommandPanel onSelectCommand={onSelectCommand} />);

      fireEvent.click(screen.getByTestId("command-fight"));

      expect(onSelectCommand).toHaveBeenCalledWith("fight");
    });

    it("should call onSelectCommand with correct command", () => {
      const onSelectCommand = vi.fn();
      render(<CommandPanel onSelectCommand={onSelectCommand} />);

      fireEvent.click(screen.getByTestId("command-item"));
      expect(onSelectCommand).toHaveBeenCalledWith("item");

      fireEvent.click(screen.getByTestId("command-run"));
      expect(onSelectCommand).toHaveBeenCalledWith("run");
    });

    it("should not call onSelectCommand when disabled capture is clicked", () => {
      const onSelectCommand = vi.fn();
      render(<CommandPanel onSelectCommand={onSelectCommand} canCapture={false} />);

      fireEvent.click(screen.getByTestId("command-capture"));

      expect(onSelectCommand).not.toHaveBeenCalled();
    });

    it("should update selected index on click", () => {
      render(<CommandPanel onSelectCommand={vi.fn()} />);

      fireEvent.click(screen.getByTestId("command-item"));

      expect(screen.getByTestId("command-item")).toHaveAttribute("data-selected", "true");
      expect(screen.getByTestId("command-fight")).toHaveAttribute("data-selected", "false");
    });
  });

  describe("keyboard navigation", () => {
    it("should navigate down with ArrowDown key", () => {
      render(<CommandPanel onSelectCommand={vi.fn()} onKeyInput="ArrowDown" />);

      // Index 0 -> 2 (fight -> capture)
      expect(screen.getByTestId("command-capture")).toHaveAttribute("data-selected", "true");
    });

    it("should navigate up with ArrowUp key", () => {
      render(
        <CommandPanel onSelectCommand={vi.fn()} initialSelectedIndex={2} onKeyInput="ArrowUp" />,
      );

      // Index 2 -> 0 (capture -> fight)
      expect(screen.getByTestId("command-fight")).toHaveAttribute("data-selected", "true");
    });

    it("should navigate right with ArrowRight key", () => {
      render(<CommandPanel onSelectCommand={vi.fn()} onKeyInput="ArrowRight" />);

      // Index 0 -> 1 (fight -> item)
      expect(screen.getByTestId("command-item")).toHaveAttribute("data-selected", "true");
    });

    it("should navigate left with ArrowLeft key", () => {
      render(
        <CommandPanel onSelectCommand={vi.fn()} initialSelectedIndex={1} onKeyInput="ArrowLeft" />,
      );

      // Index 1 -> 0 (item -> fight)
      expect(screen.getByTestId("command-fight")).toHaveAttribute("data-selected", "true");
    });

    it("should navigate with WASD keys", () => {
      const { rerender } = render(<CommandPanel onSelectCommand={vi.fn()} onKeyInput="s" />);
      expect(screen.getByTestId("command-capture")).toHaveAttribute("data-selected", "true");

      rerender(<CommandPanel onSelectCommand={vi.fn()} initialSelectedIndex={2} onKeyInput="w" />);
      expect(screen.getByTestId("command-fight")).toHaveAttribute("data-selected", "true");

      rerender(<CommandPanel onSelectCommand={vi.fn()} onKeyInput="d" />);
      expect(screen.getByTestId("command-item")).toHaveAttribute("data-selected", "true");

      rerender(<CommandPanel onSelectCommand={vi.fn()} initialSelectedIndex={1} onKeyInput="a" />);
      expect(screen.getByTestId("command-fight")).toHaveAttribute("data-selected", "true");
    });

    it("should select command with Enter key", () => {
      const onSelectCommand = vi.fn();
      render(<CommandPanel onSelectCommand={onSelectCommand} onKeyInput="Enter" />);

      expect(onSelectCommand).toHaveBeenCalledWith("fight");
    });

    it("should select command with Space key", () => {
      const onSelectCommand = vi.fn();
      render(<CommandPanel onSelectCommand={onSelectCommand} onKeyInput=" " />);

      expect(onSelectCommand).toHaveBeenCalledWith("fight");
    });

    it("should not select disabled capture with Enter key", () => {
      const onSelectCommand = vi.fn();
      render(
        <CommandPanel
          onSelectCommand={onSelectCommand}
          canCapture={false}
          initialSelectedIndex={2}
          onKeyInput="Enter"
        />,
      );

      expect(onSelectCommand).not.toHaveBeenCalled();
    });
  });

  describe("command description", () => {
    it("should show description for selected command", () => {
      render(<CommandPanel onSelectCommand={vi.fn()} />);

      expect(screen.getByTestId("command-description")).toHaveTextContent("技を選んで攻撃する");
    });

    it("should update description when selection changes", () => {
      render(<CommandPanel onSelectCommand={vi.fn()} initialSelectedIndex={1} />);

      expect(screen.getByTestId("command-description")).toHaveTextContent("アイテムを使う");
    });

    it("should show capture description", () => {
      render(<CommandPanel onSelectCommand={vi.fn()} initialSelectedIndex={2} />);

      expect(screen.getByTestId("command-description")).toHaveTextContent("ゴーストを捕まえる");
    });

    it("should show run description", () => {
      render(<CommandPanel onSelectCommand={vi.fn()} initialSelectedIndex={3} />);

      expect(screen.getByTestId("command-description")).toHaveTextContent("バトルから逃げる");
    });
  });
});
