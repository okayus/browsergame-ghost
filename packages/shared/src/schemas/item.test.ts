import { describe, expect, it } from "vitest";
import { InventoryEntrySchema, InventorySchema, ItemCategorySchema, ItemSchema } from "./item";

describe("ItemCategorySchema", () => {
  it("should accept valid item categories", () => {
    expect(ItemCategorySchema.parse("healing")).toBe("healing");
    expect(ItemCategorySchema.parse("capture")).toBe("capture");
    expect(ItemCategorySchema.parse("other")).toBe("other");
  });

  it("should reject invalid categories", () => {
    expect(() => ItemCategorySchema.parse("invalid")).toThrow();
  });
});

describe("ItemSchema", () => {
  it("should accept valid healing item", () => {
    const item = {
      id: "potion",
      name: "Potion",
      category: "healing",
      effectValue: 20,
      price: 100,
    };
    expect(ItemSchema.parse(item)).toEqual(item);
  });

  it("should accept valid capture item", () => {
    const item = {
      id: "ghost-ball",
      name: "Ghost Ball",
      category: "capture",
      description: "A basic ball for catching ghosts",
      effectValue: 10,
      price: 200,
    };
    expect(ItemSchema.parse(item)).toEqual(item);
  });

  it("should accept item without price (defaults to 0)", () => {
    const item = {
      id: "rare-item",
      name: "Rare Item",
      category: "other",
      effectValue: 0,
    };
    const parsed = ItemSchema.parse(item);
    expect(parsed.price).toBe(0);
  });

  it("should reject item with invalid category", () => {
    expect(() =>
      ItemSchema.parse({
        id: "test",
        name: "Test",
        category: "invalid",
        effectValue: 10,
      }),
    ).toThrow();
  });
});

describe("InventoryEntrySchema", () => {
  it("should accept valid inventory entry", () => {
    const entry = { itemId: "potion", quantity: 5 };
    expect(InventoryEntrySchema.parse(entry)).toEqual(entry);
  });

  it("should accept entry with 0 quantity", () => {
    const entry = { itemId: "potion", quantity: 0 };
    expect(InventoryEntrySchema.parse(entry)).toEqual(entry);
  });

  it("should reject quantity over 99", () => {
    expect(() => InventoryEntrySchema.parse({ itemId: "potion", quantity: 100 })).toThrow();
  });

  it("should reject negative quantity", () => {
    expect(() => InventoryEntrySchema.parse({ itemId: "potion", quantity: -1 })).toThrow();
  });
});

describe("InventorySchema", () => {
  it("should accept valid inventory", () => {
    const inventory = {
      items: [
        { itemId: "potion", quantity: 5 },
        { itemId: "ghost-ball", quantity: 10 },
      ],
    };
    expect(InventorySchema.parse(inventory)).toEqual(inventory);
  });

  it("should accept empty inventory", () => {
    const inventory = { items: [] };
    expect(InventorySchema.parse(inventory)).toEqual(inventory);
  });
});
