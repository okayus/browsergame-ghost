import type { Inventory, OwnedGhost, Party } from "@ghost-game/shared";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useGameState } from "./useGameState";

const createMockGhost = (id: string): OwnedGhost => ({
  id,
  speciesId: "fireling",
  level: 5,
  experience: 0,
  currentHp: 20,
  maxHp: 20,
  stats: { hp: 20, attack: 10, defense: 8, speed: 12 },
  moves: [],
});

const createMockParty = (): Party => ({
  ghosts: [createMockGhost("ghost-1"), createMockGhost("ghost-2")],
});

const createMockInventory = (): Inventory => ({
  items: [
    { itemId: "potion", quantity: 5 },
    { itemId: "ghostBall", quantity: 10 },
  ],
});

describe("useGameState", () => {
  describe("initial state", () => {
    it("should start with map screen", () => {
      const { result } = renderHook(() => useGameState());
      expect(result.current.state.currentScreen).toBe("map");
    });

    it("should start with null party", () => {
      const { result } = renderHook(() => useGameState());
      expect(result.current.state.party).toBeNull();
    });

    it("should start with empty inventory", () => {
      const { result } = renderHook(() => useGameState());
      expect(result.current.state.inventory.items).toEqual([]);
    });

    it("should start with isLoaded false", () => {
      const { result } = renderHook(() => useGameState());
      expect(result.current.state.isLoaded).toBe(false);
    });
  });

  describe("setScreen", () => {
    it("should change current screen", () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.setScreen("battle");
      });

      expect(result.current.state.currentScreen).toBe("battle");
    });

    it("should switch between different screens", () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.setScreen("party");
      });
      expect(result.current.state.currentScreen).toBe("party");

      act(() => {
        result.current.setScreen("menu");
      });
      expect(result.current.state.currentScreen).toBe("menu");
    });
  });

  describe("setParty", () => {
    it("should set party", () => {
      const { result } = renderHook(() => useGameState());
      const party = createMockParty();

      act(() => {
        result.current.setParty(party);
      });

      expect(result.current.state.party).toEqual(party);
    });
  });

  describe("updatePartyGhost", () => {
    it("should update specific ghost in party", () => {
      const { result } = renderHook(() => useGameState());
      const party = createMockParty();

      act(() => {
        result.current.setParty(party);
      });

      act(() => {
        result.current.updatePartyGhost("ghost-1", { currentHp: 10 });
      });

      expect(result.current.state.party?.ghosts[0].currentHp).toBe(10);
      expect(result.current.state.party?.ghosts[1].currentHp).toBe(20);
    });

    it("should not update if party is null", () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.updatePartyGhost("ghost-1", { currentHp: 10 });
      });

      expect(result.current.state.party).toBeNull();
    });
  });

  describe("setInventory", () => {
    it("should set inventory", () => {
      const { result } = renderHook(() => useGameState());
      const inventory = createMockInventory();

      act(() => {
        result.current.setInventory(inventory);
      });

      expect(result.current.state.inventory).toEqual(inventory);
    });
  });

  describe("useItem", () => {
    it("should decrease item quantity", () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.setInventory(createMockInventory());
      });

      let success: boolean;
      act(() => {
        success = result.current.useItem("potion");
      });

      expect(success!).toBe(true);
      expect(
        result.current.state.inventory.items.find((i) => i.itemId === "potion")?.quantity,
      ).toBe(4);
    });

    it("should remove item when quantity reaches 0", () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.setInventory({ items: [{ itemId: "potion", quantity: 1 }] });
      });

      act(() => {
        result.current.useItem("potion");
      });

      expect(
        result.current.state.inventory.items.find((i) => i.itemId === "potion"),
      ).toBeUndefined();
    });

    it("should return false when item not found", () => {
      const { result } = renderHook(() => useGameState());

      let success: boolean;
      act(() => {
        success = result.current.useItem("nonexistent");
      });

      expect(success!).toBe(false);
    });

    it("should return false when insufficient quantity", () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.setInventory({ items: [{ itemId: "potion", quantity: 1 }] });
      });

      let success: boolean;
      act(() => {
        success = result.current.useItem("potion", 2);
      });

      expect(success!).toBe(false);
    });
  });

  describe("addItem", () => {
    it("should add new item", () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.addItem("potion", 3);
      });

      expect(result.current.state.inventory.items).toContainEqual({
        itemId: "potion",
        quantity: 3,
      });
    });

    it("should increase existing item quantity", () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.setInventory({ items: [{ itemId: "potion", quantity: 5 }] });
      });

      act(() => {
        result.current.addItem("potion", 3);
      });

      expect(
        result.current.state.inventory.items.find((i) => i.itemId === "potion")?.quantity,
      ).toBe(8);
    });

    it("should cap quantity at 99", () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.setInventory({ items: [{ itemId: "potion", quantity: 95 }] });
      });

      act(() => {
        result.current.addItem("potion", 10);
      });

      expect(
        result.current.state.inventory.items.find((i) => i.itemId === "potion")?.quantity,
      ).toBe(99);
    });
  });

  describe("setLoaded", () => {
    it("should set isLoaded to true", () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.setLoaded();
      });

      expect(result.current.state.isLoaded).toBe(true);
    });
  });

  describe("resetGame", () => {
    it("should reset to initial state", () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.setScreen("battle");
        result.current.setParty(createMockParty());
        result.current.setInventory(createMockInventory());
        result.current.setLoaded();
      });

      act(() => {
        result.current.resetGame();
      });

      expect(result.current.state.currentScreen).toBe("map");
      expect(result.current.state.party).toBeNull();
      expect(result.current.state.inventory.items).toEqual([]);
      expect(result.current.state.isLoaded).toBe(false);
    });
  });
});
