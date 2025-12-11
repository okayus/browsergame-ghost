import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { DisplayCaptureItem } from "./CaptureItemPanel";
import { CaptureItemPanel } from "./CaptureItemPanel";

const mockItems: DisplayCaptureItem[] = [
  {
    item: {
      id: "ghost_ball",
      name: "ゴーストボール",
      category: "capture",
      effectValue: 10,
      price: 200,
      description: "標準的な捕獲アイテム",
    },
    entry: { itemId: "ghost_ball", quantity: 5 },
  },
  {
    item: {
      id: "super_ball",
      name: "スーパーボール",
      category: "capture",
      effectValue: 25,
      price: 500,
      description: "捕獲率が高い",
    },
    entry: { itemId: "super_ball", quantity: 3 },
  },
  {
    item: {
      id: "master_ball",
      name: "マスターボール",
      category: "capture",
      effectValue: 100,
      price: 0,
      description: "必ず捕まえられる",
    },
    entry: { itemId: "master_ball", quantity: 0 },
  },
];

describe("CaptureItemPanel", () => {
  describe("rendering", () => {
    it("should render capture item panel", () => {
      render(<CaptureItemPanel items={mockItems} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("capture-item-panel")).toBeInTheDocument();
    });

    it("should render header", () => {
      render(<CaptureItemPanel items={mockItems} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByText("捕獲アイテムを選択")).toBeInTheDocument();
    });

    it("should render all capture items", () => {
      render(<CaptureItemPanel items={mockItems} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("capture-item-ghost_ball")).toBeInTheDocument();
      expect(screen.getByTestId("capture-item-super_ball")).toBeInTheDocument();
      expect(screen.getByTestId("capture-item-master_ball")).toBeInTheDocument();
    });

    it("should render back button", () => {
      render(<CaptureItemPanel items={mockItems} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("capture-back")).toBeInTheDocument();
      expect(screen.getByText("もどる")).toBeInTheDocument();
    });

    it("should display item names", () => {
      render(<CaptureItemPanel items={mockItems} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByText("ゴーストボール")).toBeInTheDocument();
      expect(screen.getByText("スーパーボール")).toBeInTheDocument();
      expect(screen.getByText("マスターボール")).toBeInTheDocument();
    });

    it("should display capture rate bonus", () => {
      render(<CaptureItemPanel items={mockItems} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("capture-item-bonus-ghost_ball")).toHaveTextContent("+10%");
      expect(screen.getByTestId("capture-item-bonus-super_ball")).toHaveTextContent("+25%");
      expect(screen.getByTestId("capture-item-bonus-master_ball")).toHaveTextContent("+100%");
    });

    it("should display quantity for each item", () => {
      render(<CaptureItemPanel items={mockItems} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("capture-item-quantity-ghost_ball")).toHaveTextContent("×5");
      expect(screen.getByTestId("capture-item-quantity-super_ball")).toHaveTextContent("×3");
      expect(screen.getByTestId("capture-item-quantity-master_ball")).toHaveTextContent("×0");
    });

    it("should display item description", () => {
      render(<CaptureItemPanel items={mockItems} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("capture-item-desc-ghost_ball")).toHaveTextContent(
        "標準的な捕獲アイテム",
      );
    });

    it("should show first item as selected by default", () => {
      render(<CaptureItemPanel items={mockItems} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("capture-item-ghost_ball")).toHaveAttribute(
        "data-selected",
        "true",
      );
    });
  });

  describe("quantity availability", () => {
    it("should disable item with 0 quantity", () => {
      render(<CaptureItemPanel items={mockItems} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("capture-item-master_ball")).toBeDisabled();
      expect(screen.getByTestId("capture-item-master_ball")).toHaveAttribute(
        "data-disabled",
        "true",
      );
    });

    it("should enable item with quantity > 0", () => {
      render(<CaptureItemPanel items={mockItems} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("capture-item-ghost_ball")).not.toBeDisabled();
      expect(screen.getByTestId("capture-item-ghost_ball")).toHaveAttribute(
        "data-disabled",
        "false",
      );
    });
  });

  describe("click selection", () => {
    it("should call onSelectItem when item is clicked", () => {
      const onSelectItem = vi.fn();
      render(<CaptureItemPanel items={mockItems} onSelectItem={onSelectItem} onBack={vi.fn()} />);

      fireEvent.click(screen.getByTestId("capture-item-ghost_ball"));

      expect(onSelectItem).toHaveBeenCalledWith("ghost_ball");
    });

    it("should call onSelectItem with correct itemId", () => {
      const onSelectItem = vi.fn();
      render(<CaptureItemPanel items={mockItems} onSelectItem={onSelectItem} onBack={vi.fn()} />);

      fireEvent.click(screen.getByTestId("capture-item-super_ball"));

      expect(onSelectItem).toHaveBeenCalledWith("super_ball");
    });

    it("should not call onSelectItem when disabled item is clicked", () => {
      const onSelectItem = vi.fn();
      render(<CaptureItemPanel items={mockItems} onSelectItem={onSelectItem} onBack={vi.fn()} />);

      fireEvent.click(screen.getByTestId("capture-item-master_ball"));

      expect(onSelectItem).not.toHaveBeenCalled();
    });

    it("should call onBack when back button is clicked", () => {
      const onBack = vi.fn();
      render(<CaptureItemPanel items={mockItems} onSelectItem={vi.fn()} onBack={onBack} />);

      fireEvent.click(screen.getByTestId("capture-back"));

      expect(onBack).toHaveBeenCalled();
    });
  });

  describe("keyboard navigation", () => {
    it("should navigate down with ArrowDown key", () => {
      render(
        <CaptureItemPanel
          items={mockItems}
          onSelectItem={vi.fn()}
          onBack={vi.fn()}
          onKeyInput="ArrowDown"
        />,
      );

      expect(screen.getByTestId("capture-item-super_ball")).toHaveAttribute(
        "data-selected",
        "true",
      );
    });

    it("should navigate up with ArrowUp key", () => {
      render(
        <CaptureItemPanel
          items={mockItems}
          onSelectItem={vi.fn()}
          onBack={vi.fn()}
          initialSelectedIndex={1}
          onKeyInput="ArrowUp"
        />,
      );

      expect(screen.getByTestId("capture-item-ghost_ball")).toHaveAttribute(
        "data-selected",
        "true",
      );
    });

    it("should select item with Enter key", () => {
      const onSelectItem = vi.fn();
      render(
        <CaptureItemPanel
          items={mockItems}
          onSelectItem={onSelectItem}
          onBack={vi.fn()}
          onKeyInput="Enter"
        />,
      );

      expect(onSelectItem).toHaveBeenCalledWith("ghost_ball");
    });

    it("should not select disabled item with Enter key", () => {
      const onSelectItem = vi.fn();
      render(
        <CaptureItemPanel
          items={mockItems}
          onSelectItem={onSelectItem}
          onBack={vi.fn()}
          initialSelectedIndex={2}
          onKeyInput="Enter"
        />,
      );

      expect(onSelectItem).not.toHaveBeenCalled();
    });

    it("should call onBack with Escape key", () => {
      const onBack = vi.fn();
      render(
        <CaptureItemPanel
          items={mockItems}
          onSelectItem={vi.fn()}
          onBack={onBack}
          onKeyInput="Escape"
        />,
      );

      expect(onBack).toHaveBeenCalled();
    });
  });

  describe("empty items", () => {
    it("should show message when no items", () => {
      render(<CaptureItemPanel items={[]} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("capture-no-items")).toBeInTheDocument();
      expect(screen.getByText("捕獲アイテムがありません")).toBeInTheDocument();
    });

    it("should show back button as selected when no items", () => {
      render(<CaptureItemPanel items={[]} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("capture-back")).toHaveAttribute("data-selected", "true");
    });
  });
});
