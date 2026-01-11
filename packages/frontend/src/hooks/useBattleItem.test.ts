import type { Inventory, Item, OwnedGhost, Party } from "@ghost-game/shared";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { applyHealingItem, getCaptureBonus, useBattleItem } from "./useBattleItem";
import { useGameState } from "./useGameState";

const createMockItem = (overrides: Partial<Item> = {}): Item => ({
  id: "potion",
  name: "ポーション",
  category: "healing",
  effectValue: 30,
  price: 200,
  ...overrides,
});

const createMockGhost = (currentHp: number, maxHp: number): OwnedGhost => ({
  id: "ghost-1",
  speciesId: "fireling",
  level: 5,
  experience: 0,
  currentHp,
  maxHp,
  stats: { hp: maxHp, attack: 10, defense: 8, speed: 12 },
  moves: [],
});

describe("applyHealingItem", () => {
  describe("HP回復", () => {
    it("should heal ghost HP by item effect value", () => {
      const item = createMockItem({ effectValue: 30 });
      const ghost = createMockGhost(20, 50);

      const result = applyHealingItem(item, ghost);

      expect(result.success).toBe(true);
      expect(result.healedAmount).toBe(30);
      expect(result.newHp).toBe(50);
    });

    it("should not exceed max HP when healing", () => {
      const item = createMockItem({ effectValue: 100 });
      const ghost = createMockGhost(40, 50);

      const result = applyHealingItem(item, ghost);

      expect(result.success).toBe(true);
      expect(result.healedAmount).toBe(10); // 50 - 40 = 10
      expect(result.newHp).toBe(50);
    });

    it("should return 0 healed amount when HP is already full", () => {
      const item = createMockItem({ effectValue: 30 });
      const ghost = createMockGhost(50, 50);

      const result = applyHealingItem(item, ghost);

      expect(result.success).toBe(true);
      expect(result.healedAmount).toBe(0);
      expect(result.newHp).toBe(50);
    });

    it("should fail when item is not a healing item", () => {
      const item = createMockItem({ category: "capture", effectValue: 50 });
      const ghost = createMockGhost(20, 50);

      const result = applyHealingItem(item, ghost);

      expect(result.success).toBe(false);
      expect(result.healedAmount).toBe(0);
      expect(result.newHp).toBe(20);
    });
  });
});

describe("getCaptureBonus", () => {
  describe("捕獲ボーナス計算", () => {
    it("should return 1.0 for basic capture item (0% bonus)", () => {
      const item = createMockItem({
        id: "ghost-ball",
        category: "capture",
        effectValue: 0,
      });

      const bonus = getCaptureBonus(item);

      expect(bonus).toBe(1.0);
    });

    it("should return 1.5 for super ball (50% bonus)", () => {
      const item = createMockItem({
        id: "super-ball",
        category: "capture",
        effectValue: 50,
      });

      const bonus = getCaptureBonus(item);

      expect(bonus).toBe(1.5);
    });

    it("should return 2.0 for hyper ball (100% bonus)", () => {
      const item = createMockItem({
        id: "hyper-ball",
        category: "capture",
        effectValue: 100,
      });

      const bonus = getCaptureBonus(item);

      expect(bonus).toBe(2.0);
    });

    it("should return 1.0 for non-capture item", () => {
      const item = createMockItem({
        category: "healing",
        effectValue: 30,
      });

      const bonus = getCaptureBonus(item);

      expect(bonus).toBe(1.0);
    });
  });
});

/**
 * useBattleItem フックの統合テスト
 *
 * Task 23.2: バトル中アイテム使用のテスト
 * - 回復アイテム使用テスト
 * - 捕獲アイテム使用テスト
 * - アイテム消費テスト
 * - キャンセル処理テスト
 */
describe("useBattleItem hook", () => {
  const createMockParty = (): Party => ({
    ghosts: [
      createMockGhost(20, 50), // HP 20/50
      { ...createMockGhost(30, 40), id: "ghost-2" },
    ],
  });

  const createMockInventory = (): Inventory => ({
    items: [
      { itemId: "potion", quantity: 5 },
      { itemId: "super-potion", quantity: 2 },
      { itemId: "ghost-ball", quantity: 10 },
    ],
  });

  describe("回復アイテム使用テスト", () => {
    it("回復アイテムを使用するとゴーストのHPが回復する", () => {
      const mockUpdatePendingSaveData = vi.fn();
      const { result: gameStateResult } = renderHook(() => useGameState());

      // パーティとインベントリをセット
      act(() => {
        gameStateResult.current.setParty(createMockParty());
        gameStateResult.current.setInventory(createMockInventory());
      });

      // consumeItemの動作をシミュレート
      const consumeItem = vi.fn((itemId: string) => {
        act(() => {
          gameStateResult.current.useItem(itemId);
        });
        return true;
      });

      const { result: battleItemResult } = renderHook(() =>
        useBattleItem(gameStateResult.current, consumeItem, mockUpdatePendingSaveData),
      );

      const healingItem = createMockItem({ effectValue: 30 });

      let useResult: ReturnType<typeof battleItemResult.current.useHealingItem>;
      act(() => {
        useResult = battleItemResult.current.useHealingItem(healingItem, "ghost-1");
      });

      // 使用成功
      expect(useResult!.success).toBe(true);
      expect(useResult!.category).toBe("healing");
      expect(useResult!.healingResult?.healedAmount).toBe(30);
      expect(useResult!.healingResult?.newHp).toBe(50);

      // パーティのHPが更新されている
      expect(gameStateResult.current.state.party?.ghosts[0].currentHp).toBe(50);

      // アイテムが消費されている
      expect(consumeItem).toHaveBeenCalledWith("potion");

      // セーブデータ更新が呼ばれている
      expect(mockUpdatePendingSaveData).toHaveBeenCalledWith({
        party: expect.objectContaining({
          ghosts: expect.arrayContaining([
            expect.objectContaining({ id: "ghost-1", currentHp: 50 }),
          ]),
        }),
        inventory: expect.any(Object),
      });
    });

    it("HPが満タンの場合は回復量が0になる", () => {
      const mockUpdatePendingSaveData = vi.fn();
      const { result: gameStateResult } = renderHook(() => useGameState());

      act(() => {
        gameStateResult.current.setParty({
          ghosts: [createMockGhost(50, 50)], // HP満タン
        });
        gameStateResult.current.setInventory(createMockInventory());
      });

      const consumeItem = vi.fn(() => true);

      const { result: battleItemResult } = renderHook(() =>
        useBattleItem(gameStateResult.current, consumeItem, mockUpdatePendingSaveData),
      );

      const healingItem = createMockItem({ effectValue: 30 });

      let useResult: ReturnType<typeof battleItemResult.current.useHealingItem>;
      act(() => {
        useResult = battleItemResult.current.useHealingItem(healingItem, "ghost-1");
      });

      expect(useResult!.success).toBe(true);
      expect(useResult!.healingResult?.healedAmount).toBe(0);
      expect(useResult!.message).toContain("満タン");
    });

    it("最大HPを超えて回復しない", () => {
      const mockUpdatePendingSaveData = vi.fn();
      const { result: gameStateResult } = renderHook(() => useGameState());

      act(() => {
        gameStateResult.current.setParty({
          ghosts: [createMockGhost(45, 50)], // あと5しか回復できない
        });
        gameStateResult.current.setInventory(createMockInventory());
      });

      const consumeItem = vi.fn(() => true);

      const { result: battleItemResult } = renderHook(() =>
        useBattleItem(gameStateResult.current, consumeItem, mockUpdatePendingSaveData),
      );

      const healingItem = createMockItem({ effectValue: 30 }); // 30回復しようとする

      let useResult: ReturnType<typeof battleItemResult.current.useHealingItem>;
      act(() => {
        useResult = battleItemResult.current.useHealingItem(healingItem, "ghost-1");
      });

      expect(useResult!.healingResult?.healedAmount).toBe(5); // 実際には5しか回復しない
      expect(useResult!.healingResult?.newHp).toBe(50);
    });
  });

  describe("捕獲アイテム使用テスト", () => {
    it("捕獲アイテムの効果ボーナスが正しく計算される", () => {
      const mockUpdatePendingSaveData = vi.fn();
      const { result: gameStateResult } = renderHook(() => useGameState());

      act(() => {
        gameStateResult.current.setParty(createMockParty());
      });

      const consumeItem = vi.fn(() => true);

      const { result: battleItemResult } = renderHook(() =>
        useBattleItem(gameStateResult.current, consumeItem, mockUpdatePendingSaveData),
      );

      // 通常ボール（0%ボーナス）
      const normalBall = createMockItem({
        id: "ghost-ball",
        category: "capture",
        effectValue: 0,
      });
      expect(battleItemResult.current.getCaptureItemBonus(normalBall)).toBe(1.0);

      // スーパーボール（50%ボーナス）
      const superBall = createMockItem({
        id: "super-ball",
        category: "capture",
        effectValue: 50,
      });
      expect(battleItemResult.current.getCaptureItemBonus(superBall)).toBe(1.5);

      // ハイパーボール（100%ボーナス）
      const hyperBall = createMockItem({
        id: "hyper-ball",
        category: "capture",
        effectValue: 100,
      });
      expect(battleItemResult.current.getCaptureItemBonus(hyperBall)).toBe(2.0);
    });
  });

  describe("アイテム消費テスト", () => {
    it("アイテム使用後に所持数が1減る", () => {
      const mockUpdatePendingSaveData = vi.fn();
      const { result: gameStateResult } = renderHook(() => useGameState());

      act(() => {
        gameStateResult.current.setParty(createMockParty());
        gameStateResult.current.setInventory({
          items: [{ itemId: "potion", quantity: 3 }],
        });
      });

      const consumeItem = vi.fn((itemId: string) => {
        // 実際にアイテムを消費
        let success = false;
        act(() => {
          success = gameStateResult.current.useItem(itemId);
        });
        return success;
      });

      const { result: battleItemResult } = renderHook(() =>
        useBattleItem(gameStateResult.current, consumeItem, mockUpdatePendingSaveData),
      );

      const healingItem = createMockItem({ id: "potion", effectValue: 30 });

      act(() => {
        battleItemResult.current.useHealingItem(healingItem, "ghost-1");
      });

      // アイテム数が減っている
      const potionEntry = gameStateResult.current.state.inventory.items.find(
        (i) => i.itemId === "potion",
      );
      expect(potionEntry?.quantity).toBe(2);
    });

    it("アイテム消費に失敗した場合は使用失敗となる", () => {
      const mockUpdatePendingSaveData = vi.fn();
      const { result: gameStateResult } = renderHook(() => useGameState());

      act(() => {
        gameStateResult.current.setParty(createMockParty());
        gameStateResult.current.setInventory({
          items: [{ itemId: "potion", quantity: 0 }], // 所持数0
        });
      });

      // 消費失敗を返す
      const consumeItem = vi.fn(() => false);

      const { result: battleItemResult } = renderHook(() =>
        useBattleItem(gameStateResult.current, consumeItem, mockUpdatePendingSaveData),
      );

      const healingItem = createMockItem({ effectValue: 30 });

      let useResult: ReturnType<typeof battleItemResult.current.useHealingItem>;
      act(() => {
        useResult = battleItemResult.current.useHealingItem(healingItem, "ghost-1");
      });

      expect(useResult!.success).toBe(false);
      expect(useResult!.message).toContain("使用できませんでした");
      expect(mockUpdatePendingSaveData).not.toHaveBeenCalled();
    });
  });

  describe("キャンセル処理テスト", () => {
    it("回復アイテム以外を回復に使おうとすると失敗する", () => {
      const mockUpdatePendingSaveData = vi.fn();
      const { result: gameStateResult } = renderHook(() => useGameState());

      act(() => {
        gameStateResult.current.setParty(createMockParty());
        gameStateResult.current.setInventory(createMockInventory());
      });

      const consumeItem = vi.fn(() => true);

      const { result: battleItemResult } = renderHook(() =>
        useBattleItem(gameStateResult.current, consumeItem, mockUpdatePendingSaveData),
      );

      // 捕獲アイテムを回復に使おうとする
      const captureItem = createMockItem({
        id: "ghost-ball",
        category: "capture",
        effectValue: 10,
      });

      let useResult: ReturnType<typeof battleItemResult.current.useHealingItem>;
      act(() => {
        useResult = battleItemResult.current.useHealingItem(captureItem, "ghost-1");
      });

      expect(useResult!.success).toBe(false);
      expect(useResult!.message).toContain("回復アイテムではありません");
      expect(consumeItem).not.toHaveBeenCalled();
    });

    it("存在しないゴーストに対してアイテムを使おうとすると失敗する", () => {
      const mockUpdatePendingSaveData = vi.fn();
      const { result: gameStateResult } = renderHook(() => useGameState());

      act(() => {
        gameStateResult.current.setParty(createMockParty());
        gameStateResult.current.setInventory(createMockInventory());
      });

      const consumeItem = vi.fn(() => true);

      const { result: battleItemResult } = renderHook(() =>
        useBattleItem(gameStateResult.current, consumeItem, mockUpdatePendingSaveData),
      );

      const healingItem = createMockItem({ effectValue: 30 });

      let useResult: ReturnType<typeof battleItemResult.current.useHealingItem>;
      act(() => {
        useResult = battleItemResult.current.useHealingItem(healingItem, "nonexistent-ghost");
      });

      expect(useResult!.success).toBe(false);
      expect(useResult!.message).toContain("ゴーストが見つかりません");
      expect(consumeItem).not.toHaveBeenCalled();
    });
  });

  describe("セーブデータ更新", () => {
    it("アイテム使用後にセーブデータにパーティとインベントリが追加される", () => {
      const mockUpdatePendingSaveData = vi.fn();
      const { result: gameStateResult } = renderHook(() => useGameState());

      act(() => {
        gameStateResult.current.setParty(createMockParty());
        gameStateResult.current.setInventory(createMockInventory());
      });

      const consumeItem = vi.fn(() => true);

      const { result: battleItemResult } = renderHook(() =>
        useBattleItem(gameStateResult.current, consumeItem, mockUpdatePendingSaveData),
      );

      const healingItem = createMockItem({ effectValue: 30 });

      act(() => {
        battleItemResult.current.useHealingItem(healingItem, "ghost-1");
      });

      expect(mockUpdatePendingSaveData).toHaveBeenCalledTimes(1);
      expect(mockUpdatePendingSaveData).toHaveBeenCalledWith({
        party: expect.objectContaining({
          ghosts: expect.any(Array),
        }),
        inventory: expect.objectContaining({
          items: expect.any(Array),
        }),
      });
    });
  });
});
