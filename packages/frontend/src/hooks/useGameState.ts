import type { Inventory, OwnedGhost, Party } from "@ghost-game/shared";
import { useCallback, useState } from "react";

/**
 * ゲーム画面の種類
 */
export type GameScreen = "map" | "battle" | "party" | "menu" | "shop";

/**
 * ゲーム全体の状態
 */
export interface GameState {
  /** 現在の画面 */
  currentScreen: GameScreen;
  /** プレイヤーのパーティ */
  party: Party | null;
  /** プレイヤーのインベントリ */
  inventory: Inventory;
  /** ゲームがロード済みか */
  isLoaded: boolean;
}

/**
 * ゲーム状態管理フックの戻り値
 */
export interface UseGameStateReturn {
  /** 現在のゲーム状態 */
  state: GameState;
  /** 画面を切り替える */
  setScreen: (screen: GameScreen) => void;
  /** パーティを設定する */
  setParty: (party: Party) => void;
  /** パーティのゴーストを更新する */
  updatePartyGhost: (ghostId: string, updates: Partial<OwnedGhost>) => void;
  /** インベントリを設定する */
  setInventory: (inventory: Inventory) => void;
  /** アイテムを使用する（数量を減らす） */
  useItem: (itemId: string, quantity?: number) => boolean;
  /** アイテムを追加する */
  addItem: (itemId: string, quantity?: number) => void;
  /** ゲームをロード済みにする */
  setLoaded: () => void;
  /** ゲーム状態をリセットする */
  resetGame: () => void;
}

/**
 * 初期状態
 */
const initialState: GameState = {
  currentScreen: "map",
  party: null,
  inventory: { items: [] },
  isLoaded: false,
};

/**
 * ゲーム全体の状態を管理するフック
 *
 * - 現在画面（マップ/バトル/パーティ/メニュー/ショップ）の状態管理
 * - 画面切り替えアクション
 * - パーティとインベントリの状態保持
 */
export function useGameState(): UseGameStateReturn {
  const [state, setState] = useState<GameState>(initialState);

  const setScreen = useCallback((screen: GameScreen) => {
    setState((prev) => ({ ...prev, currentScreen: screen }));
  }, []);

  const setParty = useCallback((party: Party) => {
    setState((prev) => ({ ...prev, party }));
  }, []);

  const updatePartyGhost = useCallback((ghostId: string, updates: Partial<OwnedGhost>) => {
    setState((prev) => {
      if (!prev.party) return prev;

      const updatedGhosts = prev.party.ghosts.map((ghost) =>
        ghost.id === ghostId ? { ...ghost, ...updates } : ghost,
      );

      return {
        ...prev,
        party: { ...prev.party, ghosts: updatedGhosts },
      };
    });
  }, []);

  const setInventory = useCallback((inventory: Inventory) => {
    setState((prev) => ({ ...prev, inventory }));
  }, []);

  const useItem = useCallback(
    (itemId: string, quantity = 1): boolean => {
      // NOTE: setStateは非同期のため、コールバック内で設定した値を同期的に返すことができない
      // そのため、stateを直接参照して先にアイテムの使用可否を判定する
      const itemIndex = state.inventory.items.findIndex((item) => item.itemId === itemId);

      if (itemIndex === -1) return false;

      const item = state.inventory.items[itemIndex];
      if (item.quantity < quantity) return false;

      setState((prev) => {
        const currentItemIndex = prev.inventory.items.findIndex((i) => i.itemId === itemId);
        if (currentItemIndex === -1) return prev;

        const currentItem = prev.inventory.items[currentItemIndex];
        if (currentItem.quantity < quantity) return prev;

        const newQuantity = currentItem.quantity - quantity;
        const updatedItems =
          newQuantity > 0
            ? prev.inventory.items.map((i, idx) =>
                idx === currentItemIndex ? { ...i, quantity: newQuantity } : i,
              )
            : prev.inventory.items.filter((_, idx) => idx !== currentItemIndex);

        return {
          ...prev,
          inventory: { items: updatedItems },
        };
      });

      return true;
    },
    [state.inventory.items],
  );

  const addItem = useCallback((itemId: string, quantity = 1) => {
    setState((prev) => {
      const itemIndex = prev.inventory.items.findIndex((item) => item.itemId === itemId);

      if (itemIndex !== -1) {
        // 既存アイテムの数量を増やす
        const updatedItems = prev.inventory.items.map((item, idx) =>
          idx === itemIndex ? { ...item, quantity: Math.min(99, item.quantity + quantity) } : item,
        );
        return { ...prev, inventory: { items: updatedItems } };
      }
      // 新規アイテムを追加
      return {
        ...prev,
        inventory: {
          items: [...prev.inventory.items, { itemId, quantity: Math.min(99, quantity) }],
        },
      };
    });
  }, []);

  const setLoaded = useCallback(() => {
    setState((prev) => ({ ...prev, isLoaded: true }));
  }, []);

  const resetGame = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    setScreen,
    setParty,
    updatePartyGhost,
    setInventory,
    useItem,
    addItem,
    setLoaded,
    resetGame,
  };
}
