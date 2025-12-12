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

describe("useInventoryState - インベントリ操作詳細テスト", () => {
  describe("アイテム数量境界テスト", () => {
    it.each([
      [1, 1, 0, "1個使用で0になる"],
      [5, 3, 2, "5個から3個使用で2個残る"],
      [10, 10, 0, "全数使用で0になる"],
      [99, 1, 98, "大量保有から1個使用"],
    ])("quantity=%d, use=%d → remaining=%d (%s)", (initial, useCount, expected, _desc) => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setInventory({ items: [{ itemId: "potion", quantity: initial }] });
      });

      act(() => {
        result.current.useItem("potion", useCount);
      });

      expect(result.current.getItemQuantity("potion")).toBe(expected);
    });

    it("使用後に数量0のアイテムはリストから削除される", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setInventory({ items: [{ itemId: "potion", quantity: 1 }] });
      });

      act(() => {
        result.current.useItem("potion", 1);
      });

      expect(result.current.state.items.find((i) => i.itemId === "potion")).toBeUndefined();
    });
  });

  describe("アイテム追加境界テスト", () => {
    it.each([
      [0, 1, 1, "0個から1個追加"],
      [50, 25, 75, "50個に25個追加"],
      [90, 15, MAX_ITEM_QUANTITY, "上限を超える追加は上限で止まる"],
      [99, 1, MAX_ITEM_QUANTITY, "99個に1個追加で上限"],
      [MAX_ITEM_QUANTITY, 1, MAX_ITEM_QUANTITY, "上限の状態で追加しても変わらない"],
    ])("current=%d, add=%d → result=%d (%s)", (current, addCount, expected, _desc) => {
      const { result } = renderHook(() => useInventoryState());

      if (current > 0) {
        act(() => {
          result.current.setInventory({ items: [{ itemId: "potion", quantity: current }] });
        });
      }

      act(() => {
        result.current.addItem("potion", addCount);
      });

      expect(result.current.getItemQuantity("potion")).toBe(expected);
    });
  });

  describe("複数アイテム管理テスト", () => {
    it("複数種類のアイテムを独立して管理", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.addItem("potion", 5);
        result.current.addItem("ghostBall", 10);
        result.current.addItem("superPotion", 3);
      });

      expect(result.current.getItemQuantity("potion")).toBe(5);
      expect(result.current.getItemQuantity("ghostBall")).toBe(10);
      expect(result.current.getItemQuantity("superPotion")).toBe(3);
    });

    it("1種類のアイテム使用が他に影響しない", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setInventory(createMockInventory());
      });

      act(() => {
        result.current.useItem("potion", 3);
      });

      expect(result.current.getItemQuantity("potion")).toBe(2);
      expect(result.current.getItemQuantity("ghostBall")).toBe(10); // 変更なし
      expect(result.current.getItemQuantity("superPotion")).toBe(3); // 変更なし
    });

    it("1種類のアイテム削除が他に影響しない", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setInventory(createMockInventory());
      });

      act(() => {
        result.current.removeItem("potion");
      });

      expect(result.current.getItemQuantity("potion")).toBe(0);
      expect(result.current.getItemQuantity("ghostBall")).toBe(10);
      expect(result.current.getItemQuantity("superPotion")).toBe(3);
    });
  });

  describe("hasItemテスト詳細", () => {
    it.each([
      [5, 1, true, "5個保有で1個要求"],
      [5, 5, true, "5個保有で5個要求"],
      [5, 6, false, "5個保有で6個要求"],
      [0, 1, false, "0個保有で1個要求"],
    ])("quantity=%d, required=%d → hasItem=%s (%s)", (quantity, required, expected, _desc) => {
      const { result } = renderHook(() => useInventoryState());

      if (quantity > 0) {
        act(() => {
          result.current.setInventory({ items: [{ itemId: "potion", quantity }] });
        });
      }

      expect(result.current.hasItem("potion", required)).toBe(expected);
    });

    it("存在しないアイテムはhasItem=false", () => {
      const { result } = renderHook(() => useInventoryState());

      expect(result.current.hasItem("nonexistent")).toBe(false);
      expect(result.current.hasItem("nonexistent", 1)).toBe(false);
    });
  });

  describe("使用失敗ケーステスト", () => {
    it("存在しないアイテムの使用は失敗", () => {
      const { result } = renderHook(() => useInventoryState());

      let useResult: ReturnType<typeof result.current.useItem>;
      act(() => {
        useResult = result.current.useItem("nonexistent");
      });

      expect(useResult!.success).toBe(false);
    });

    it("保有数を超える使用は失敗", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setInventory({ items: [{ itemId: "potion", quantity: 3 }] });
      });

      let useResult: ReturnType<typeof result.current.useItem>;
      act(() => {
        useResult = result.current.useItem("potion", 5);
      });

      expect(useResult!.success).toBe(false);
      expect(result.current.getItemQuantity("potion")).toBe(3); // 変更なし
    });

    it("使用失敗時も他のアイテムに影響なし", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setInventory(createMockInventory());
      });

      act(() => {
        result.current.useItem("potion", 100); // 失敗する
      });

      expect(result.current.getItemQuantity("ghostBall")).toBe(10);
    });
  });

  describe("カテゴリ別フィルタリングテスト", () => {
    it("回復アイテムのみ取得", () => {
      const { result } = renderHook(() => useInventoryState());
      const itemMaster = createMockItemMaster();

      act(() => {
        result.current.setInventory(createMockInventory());
      });

      const healingItems = result.current.getItemsByCategory("healing", itemMaster);

      expect(
        healingItems.every((item) => {
          const master = itemMaster.find((m) => m.id === item.itemId);
          return master?.category === "healing";
        }),
      ).toBe(true);
    });

    it("捕獲アイテムのみ取得", () => {
      const { result } = renderHook(() => useInventoryState());
      const itemMaster = createMockItemMaster();

      act(() => {
        result.current.setInventory(createMockInventory());
      });

      const captureItems = result.current.getItemsByCategory("capture", itemMaster);

      expect(
        captureItems.every((item) => {
          const master = itemMaster.find((m) => m.id === item.itemId);
          return master?.category === "capture";
        }),
      ).toBe(true);
    });

    it("存在しないカテゴリは空配列", () => {
      const { result } = renderHook(() => useInventoryState());
      const itemMaster = createMockItemMaster();

      act(() => {
        result.current.setInventory(createMockInventory());
      });

      const otherItems = result.current.getItemsByCategory("key" as Item["category"], itemMaster);

      expect(otherItems).toEqual([]);
    });
  });

  describe("インベントリリセットテスト", () => {
    it("clearで全アイテムが削除される", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setInventory(createMockInventory());
      });

      expect(result.current.state.items.length).toBe(3);

      act(() => {
        result.current.clear();
      });

      expect(result.current.state.items.length).toBe(0);
      expect(result.current.getItemQuantity("potion")).toBe(0);
      expect(result.current.getItemQuantity("ghostBall")).toBe(0);
    });

    it("setInventoryで完全に置き換わる", () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setInventory(createMockInventory());
      });

      act(() => {
        result.current.setInventory({ items: [{ itemId: "newItem", quantity: 1 }] });
      });

      expect(result.current.state.items.length).toBe(1);
      expect(result.current.getItemQuantity("newItem")).toBe(1);
      expect(result.current.getItemQuantity("potion")).toBe(0);
    });
  });
});
