import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { DisplayItem } from "./ItemSelectPanel";
import { ItemSelectPanel } from "./ItemSelectPanel";

const mockItems: DisplayItem[] = [
  {
    item: {
      id: "potion",
      name: "ポーション",
      category: "healing",
      effectValue: 20,
      price: 100,
    },
    entry: { itemId: "potion", quantity: 5 },
  },
  {
    item: {
      id: "ghost_ball",
      name: "ゴーストボール",
      category: "capture",
      effectValue: 10,
      price: 200,
    },
    entry: { itemId: "ghost_ball", quantity: 3 },
  },
  {
    item: {
      id: "empty_item",
      name: "からっぽ",
      category: "other",
      effectValue: 0,
      price: 0,
    },
    entry: { itemId: "empty_item", quantity: 0 },
  },
];

describe("ItemSelectPanel", () => {
  describe("rendering", () => {
    it("should render item select panel", () => {
      render(<ItemSelectPanel items={mockItems} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("item-select-panel")).toBeInTheDocument();
    });

    it("should render all items", () => {
      render(<ItemSelectPanel items={mockItems} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("item-potion")).toBeInTheDocument();
      expect(screen.getByTestId("item-ghost_ball")).toBeInTheDocument();
      expect(screen.getByTestId("item-empty_item")).toBeInTheDocument();
    });

    it("should render back button", () => {
      render(<ItemSelectPanel items={mockItems} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("item-back")).toBeInTheDocument();
      expect(screen.getByText("もどる")).toBeInTheDocument();
    });

    it("should display item names", () => {
      render(<ItemSelectPanel items={mockItems} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByText("ポーション")).toBeInTheDocument();
      expect(screen.getByText("ゴーストボール")).toBeInTheDocument();
      expect(screen.getByText("からっぽ")).toBeInTheDocument();
    });

    it("should display item categories in Japanese", () => {
      render(<ItemSelectPanel items={mockItems} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("item-category-potion")).toHaveTextContent("回復");
      expect(screen.getByTestId("item-category-ghost_ball")).toHaveTextContent("捕獲");
      expect(screen.getByTestId("item-category-empty_item")).toHaveTextContent("その他");
    });

    it("should display quantity for each item", () => {
      render(<ItemSelectPanel items={mockItems} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("item-quantity-potion")).toHaveTextContent("×5");
      expect(screen.getByTestId("item-quantity-ghost_ball")).toHaveTextContent("×3");
      expect(screen.getByTestId("item-quantity-empty_item")).toHaveTextContent("×0");
    });

    it("should show first item as selected by default", () => {
      render(<ItemSelectPanel items={mockItems} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("item-potion")).toHaveAttribute("data-selected", "true");
    });

    it("should respect initialSelectedIndex", () => {
      render(
        <ItemSelectPanel
          items={mockItems}
          onSelectItem={vi.fn()}
          onBack={vi.fn()}
          initialSelectedIndex={1}
        />,
      );

      expect(screen.getByTestId("item-ghost_ball")).toHaveAttribute("data-selected", "true");
    });
  });

  describe("quantity availability", () => {
    it("should disable item with 0 quantity", () => {
      render(<ItemSelectPanel items={mockItems} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("item-empty_item")).toBeDisabled();
      expect(screen.getByTestId("item-empty_item")).toHaveAttribute("data-disabled", "true");
    });

    it("should enable item with quantity > 0", () => {
      render(<ItemSelectPanel items={mockItems} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("item-potion")).not.toBeDisabled();
      expect(screen.getByTestId("item-potion")).toHaveAttribute("data-disabled", "false");
    });
  });

  describe("click selection", () => {
    it("should call onSelectItem when item is clicked", () => {
      const onSelectItem = vi.fn();
      render(<ItemSelectPanel items={mockItems} onSelectItem={onSelectItem} onBack={vi.fn()} />);

      fireEvent.click(screen.getByTestId("item-potion"));

      expect(onSelectItem).toHaveBeenCalledWith("potion");
    });

    it("should call onSelectItem with correct itemId", () => {
      const onSelectItem = vi.fn();
      render(<ItemSelectPanel items={mockItems} onSelectItem={onSelectItem} onBack={vi.fn()} />);

      fireEvent.click(screen.getByTestId("item-ghost_ball"));

      expect(onSelectItem).toHaveBeenCalledWith("ghost_ball");
    });

    it("should not call onSelectItem when disabled item is clicked", () => {
      const onSelectItem = vi.fn();
      render(<ItemSelectPanel items={mockItems} onSelectItem={onSelectItem} onBack={vi.fn()} />);

      fireEvent.click(screen.getByTestId("item-empty_item"));

      expect(onSelectItem).not.toHaveBeenCalled();
    });

    it("should call onBack when back button is clicked", () => {
      const onBack = vi.fn();
      render(<ItemSelectPanel items={mockItems} onSelectItem={vi.fn()} onBack={onBack} />);

      fireEvent.click(screen.getByTestId("item-back"));

      expect(onBack).toHaveBeenCalled();
    });
  });

  describe("keyboard navigation", () => {
    it("should navigate down with ArrowDown key", () => {
      render(
        <ItemSelectPanel
          items={mockItems}
          onSelectItem={vi.fn()}
          onBack={vi.fn()}
          onKeyInput="ArrowDown"
        />,
      );

      expect(screen.getByTestId("item-ghost_ball")).toHaveAttribute("data-selected", "true");
    });

    it("should navigate up with ArrowUp key", () => {
      render(
        <ItemSelectPanel
          items={mockItems}
          onSelectItem={vi.fn()}
          onBack={vi.fn()}
          initialSelectedIndex={1}
          onKeyInput="ArrowUp"
        />,
      );

      expect(screen.getByTestId("item-potion")).toHaveAttribute("data-selected", "true");
    });

    it("should navigate with WASD keys", () => {
      const { rerender } = render(
        <ItemSelectPanel
          items={mockItems}
          onSelectItem={vi.fn()}
          onBack={vi.fn()}
          onKeyInput="s"
        />,
      );
      expect(screen.getByTestId("item-ghost_ball")).toHaveAttribute("data-selected", "true");

      rerender(
        <ItemSelectPanel
          items={mockItems}
          onSelectItem={vi.fn()}
          onBack={vi.fn()}
          initialSelectedIndex={1}
          onKeyInput="w"
        />,
      );
      expect(screen.getByTestId("item-potion")).toHaveAttribute("data-selected", "true");
    });

    it("should wrap to back button when navigating down from last item", () => {
      render(
        <ItemSelectPanel
          items={mockItems}
          onSelectItem={vi.fn()}
          onBack={vi.fn()}
          initialSelectedIndex={2}
          onKeyInput="ArrowDown"
        />,
      );

      expect(screen.getByTestId("item-back")).toHaveAttribute("data-selected", "true");
    });

    it("should wrap to last item when navigating up from first item", () => {
      render(
        <ItemSelectPanel
          items={mockItems}
          onSelectItem={vi.fn()}
          onBack={vi.fn()}
          onKeyInput="ArrowUp"
        />,
      );

      expect(screen.getByTestId("item-back")).toHaveAttribute("data-selected", "true");
    });

    it("should select item with Enter key", () => {
      const onSelectItem = vi.fn();
      render(
        <ItemSelectPanel
          items={mockItems}
          onSelectItem={onSelectItem}
          onBack={vi.fn()}
          onKeyInput="Enter"
        />,
      );

      expect(onSelectItem).toHaveBeenCalledWith("potion");
    });

    it("should select item with Space key", () => {
      const onSelectItem = vi.fn();
      render(
        <ItemSelectPanel
          items={mockItems}
          onSelectItem={onSelectItem}
          onBack={vi.fn()}
          onKeyInput=" "
        />,
      );

      expect(onSelectItem).toHaveBeenCalledWith("potion");
    });

    it("should not select disabled item with Enter key", () => {
      const onSelectItem = vi.fn();
      render(
        <ItemSelectPanel
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
        <ItemSelectPanel
          items={mockItems}
          onSelectItem={vi.fn()}
          onBack={onBack}
          onKeyInput="Escape"
        />,
      );

      expect(onBack).toHaveBeenCalled();
    });

    it("should call onBack when back button is selected and Enter is pressed", () => {
      const onBack = vi.fn();
      render(
        <ItemSelectPanel
          items={mockItems}
          onSelectItem={vi.fn()}
          onBack={onBack}
          initialSelectedIndex={3}
          onKeyInput="Enter"
        />,
      );

      expect(onBack).toHaveBeenCalled();
    });
  });

  describe("empty items", () => {
    it("should only show back button when no items", () => {
      render(<ItemSelectPanel items={[]} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("item-back")).toBeInTheDocument();
      expect(screen.getByTestId("item-back")).toHaveAttribute("data-selected", "true");
    });

    it("should show empty message when no items", () => {
      render(<ItemSelectPanel items={[]} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.getByTestId("item-empty-message")).toBeInTheDocument();
      expect(screen.getByText("使えるアイテムがありません")).toBeInTheDocument();
    });

    it("should not show empty message when items exist", () => {
      render(<ItemSelectPanel items={mockItems} onSelectItem={vi.fn()} onBack={vi.fn()} />);

      expect(screen.queryByTestId("item-empty-message")).not.toBeInTheDocument();
    });

    it("should call onBack with Escape key when no items", () => {
      const onBack = vi.fn();
      render(<ItemSelectPanel items={[]} onSelectItem={vi.fn()} onBack={onBack} onKeyInput="Escape" />);

      expect(onBack).toHaveBeenCalled();
    });
  });
});
