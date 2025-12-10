import type { Inventory, Item } from "@ghost-game/shared";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MAX_ITEM_QUANTITY, useInventoryState } from "./useInventoryState";

const createMockInventory = (): Inventory => ({
  items: [
    { itemId: "potion", quantity: 5 },
    { itemId: "ghostBall", quantity: 10 },
    { itemId: "superPotion", quantity: 3 },
  ],
});

const createMockItemMaster = (): Item[] => [
  {
    id: "potion",
    name: "ポーション",
    category: "healing",
    effectValue: 20,
    price: 100,
  },
  {
    id: "superPotion",
    name: "スーパーポーション",
    category: "healing",
    effectValue: 50,
    price: 300,
  },
  {
    id: "ghostBall",
    name: "ゴーストボール",
    category: "capture",
    effectValue: 0,
    price: 200,
  },
  {
    id: "greatBall",
    name: "スーパーボール",
    category: "capture",
    effectValue: 20,
    price: 600,
  },
];

describe("useInventoryState", () => {
  describe("initial state", () => {
    it("should start with empty items", () => {
      const { result } = renderHook(() => useInventoryState());
      expect(result.current.state.items).toEqual([]);
    });
  });

  describe("setInventory", () => {
    it("should set inventory items", () => {
      const { result } = renderHook(() => useInventoryState());
      const inventory = createMockInventory();

      act(() => {
        result.current.setInventory(inventory);
      });

      expect(result.current.state.items).toEqual(inventory.items);
    });

    it("should replace existing inventory", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setInventory(createMockInventory());
      });

      act(() => {
        result.current.setInventory({ items: [{ itemId: "newItem", quantity: 1 }] });
      });

      expect(result.current.state.items).toEqual([{ itemId: "newItem", quantity: 1 }]);
    });
  });

  describe("useItem", () => {
    it("should decrease item quantity", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setInventory(createMockInventory());
      });

      let useResult: ReturnType<typeof result.current.useItem>;
      act(() => {
        useResult = result.current.useItem("potion");
      });

      expect(useResult!.success).toBe(true);
      expect(useResult!.remainingQuantity).toBe(4);
      expect(result.current.getItemQuantity("potion")).toBe(4);
    });

    it("should use multiple items at once", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setInventory(createMockInventory());
      });

      let useResult: ReturnType<typeof result.current.useItem>;
      act(() => {
        useResult = result.current.useItem("potion", 3);
      });

      expect(useResult!.success).toBe(true);
      expect(useResult!.remainingQuantity).toBe(2);
      expect(result.current.getItemQuantity("potion")).toBe(2);
    });

    it("should remove item when quantity reaches 0", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setInventory({ items: [{ itemId: "potion", quantity: 1 }] });
      });

      act(() => {
        result.current.useItem("potion");
      });

      expect(result.current.state.items.find((i) => i.itemId === "potion")).toBeUndefined();
      expect(result.current.getItemQuantity("potion")).toBe(0);
    });

    it("should fail when item not found", () => {
      const { result } = renderHook(() => useInventoryState());

      let useResult: ReturnType<typeof result.current.useItem>;
      act(() => {
        useResult = result.current.useItem("nonexistent");
      });

      expect(useResult!.success).toBe(false);
      expect(useResult!.remainingQuantity).toBe(0);
    });

    it("should fail when insufficient quantity", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setInventory({ items: [{ itemId: "potion", quantity: 2 }] });
      });

      let useResult: ReturnType<typeof result.current.useItem>;
      act(() => {
        useResult = result.current.useItem("potion", 5);
      });

      expect(useResult!.success).toBe(false);
      expect(useResult!.remainingQuantity).toBe(2);
      expect(result.current.getItemQuantity("potion")).toBe(2); // Unchanged
    });
  });

  describe("addItem", () => {
    it("should add new item", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.addItem("potion", 5);
      });

      expect(result.current.getItemQuantity("potion")).toBe(5);
    });

    it("should increase existing item quantity", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setInventory({ items: [{ itemId: "potion", quantity: 5 }] });
      });

      act(() => {
        result.current.addItem("potion", 3);
      });

      expect(result.current.getItemQuantity("potion")).toBe(8);
    });

    it("should cap quantity at MAX_ITEM_QUANTITY", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setInventory({ items: [{ itemId: "potion", quantity: 95 }] });
      });

      act(() => {
        result.current.addItem("potion", 10);
      });

      expect(result.current.getItemQuantity("potion")).toBe(MAX_ITEM_QUANTITY);
    });

    it("should cap new item quantity at MAX_ITEM_QUANTITY", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.addItem("potion", 150);
      });

      expect(result.current.getItemQuantity("potion")).toBe(MAX_ITEM_QUANTITY);
    });

    it("should default to quantity 1", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.addItem("potion");
      });

      expect(result.current.getItemQuantity("potion")).toBe(1);
    });
  });

  describe("removeItem", () => {
    it("should remove item completely", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setInventory(createMockInventory());
      });

      act(() => {
        result.current.removeItem("potion");
      });

      expect(result.current.state.items.find((i) => i.itemId === "potion")).toBeUndefined();
      expect(result.current.getItemQuantity("potion")).toBe(0);
    });

    it("should not affect other items", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setInventory(createMockInventory());
      });

      act(() => {
        result.current.removeItem("potion");
      });

      expect(result.current.getItemQuantity("ghostBall")).toBe(10);
    });
  });

  describe("getItemQuantity", () => {
    it("should return quantity for existing item", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setInventory(createMockInventory());
      });

      expect(result.current.getItemQuantity("potion")).toBe(5);
      expect(result.current.getItemQuantity("ghostBall")).toBe(10);
    });

    it("should return 0 for non-existent item", () => {
      const { result } = renderHook(() => useInventoryState());

      expect(result.current.getItemQuantity("nonexistent")).toBe(0);
    });
  });

  describe("hasItem", () => {
    it("should return true when item exists with sufficient quantity", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setInventory(createMockInventory());
      });

      expect(result.current.hasItem("potion")).toBe(true);
      expect(result.current.hasItem("potion", 5)).toBe(true);
    });

    it("should return false when item does not exist", () => {
      const { result } = renderHook(() => useInventoryState());

      expect(result.current.hasItem("nonexistent")).toBe(false);
    });

    it("should return false when quantity is insufficient", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setInventory({ items: [{ itemId: "potion", quantity: 3 }] });
      });

      expect(result.current.hasItem("potion", 5)).toBe(false);
    });
  });

  describe("getItemsByCategory", () => {
    it("should return healing items only", () => {
      const { result } = renderHook(() => useInventoryState());
      const itemMaster = createMockItemMaster();

      act(() => {
        result.current.setInventory(createMockInventory());
      });

      const healingItems = result.current.getItemsByCategory("healing", itemMaster);

      expect(healingItems).toHaveLength(2);
      expect(healingItems.map((i) => i.itemId)).toContain("potion");
      expect(healingItems.map((i) => i.itemId)).toContain("superPotion");
    });

    it("should return capture items only", () => {
      const { result } = renderHook(() => useInventoryState());
      const itemMaster = createMockItemMaster();

      act(() => {
        result.current.setInventory(createMockInventory());
      });

      const captureItems = result.current.getItemsByCategory("capture", itemMaster);

      expect(captureItems).toHaveLength(1);
      expect(captureItems[0].itemId).toBe("ghostBall");
    });

    it("should return empty array when no items match category", () => {
      const { result } = renderHook(() => useInventoryState());
      const itemMaster = createMockItemMaster();

      act(() => {
        result.current.setInventory({ items: [{ itemId: "potion", quantity: 5 }] });
      });

      const captureItems = result.current.getItemsByCategory("capture", itemMaster);

      expect(captureItems).toHaveLength(0);
    });
  });

  describe("clear", () => {
    it("should clear all items", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setInventory(createMockInventory());
      });

      expect(result.current.state.items.length).toBeGreaterThan(0);

      act(() => {
        result.current.clear();
      });

      expect(result.current.state.items).toEqual([]);
    });
  });
});
