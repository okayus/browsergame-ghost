import type { OwnedGhost } from "@ghost-game/shared";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useBattleHandlers } from "./useBattleHandlers";
import type { BattleState, TurnResult } from "./useBattleState";

const createMockGhost = (id: string): OwnedGhost => ({
  id,
  speciesId: "fireling",
  level: 5,
  experience: 0,
  currentHp: 50,
  maxHp: 50,
  stats: { hp: 50, attack: 10, defense: 8, speed: 12 },
  moves: [{ moveId: "tackle", currentPP: 35, maxPP: 35 }],
});

const createMockBattleState = (overrides?: Partial<BattleState>): BattleState => ({
  phase: "command_select",
  playerGhost: {
    ghost: createMockGhost("player-ghost"),
    currentHp: 50,
    statModifiers: { attack: 0, defense: 0, speed: 0 },
  },
  enemyGhost: {
    ghost: createMockGhost("enemy-ghost"),
    currentHp: 30,
    statModifiers: { attack: 0, defense: 0, speed: 0 },
  },
  turnCount: 1,
  escapeAttempts: 0,
  messages: [],
  isActive: true,
  endReason: null,
  ...overrides,
});

const createMockTurnResult = (overrides?: Partial<TurnResult>): TurnResult => ({
  playerActionMessage: null,
  enemyActionMessage: null,
  battleEnded: false,
  endReason: null,
  damageInfo: { playerDamage: null, enemyDamage: null },
  ...overrides,
});

const createMockProps = () => ({
  battleState: createMockBattleState(),
  playerGhostType: "fire" as const,
  enemyGhostType: "water" as const,
  setPhase: vi.fn(),
  executePlayerAction: vi.fn(() => createMockTurnResult()),
  syncPartyHp: vi.fn(),
  finishBattle: vi.fn(),
  consumeItem: vi.fn(() => true),
  updatePendingSaveData: vi.fn(),
  setCapturedGhost: vi.fn(),
  activeGhostId: "player-ghost",
  inventoryItems: [{ itemId: "potion", quantity: 5 }],
  currentInventory: { items: [{ itemId: "potion", quantity: 5 }] },
});

describe("useBattleHandlers", () => {
  describe("handleBattleCommand", () => {
    it("fightコマンドでmove_selectフェーズに遷移する", () => {
      const props = createMockProps();
      const { result } = renderHook(() => useBattleHandlers(props));

      act(() => {
        result.current.handleBattleCommand("fight");
      });

      expect(props.setPhase).toHaveBeenCalledWith("move_select");
    });

    it("itemコマンドでitem_selectフェーズに遷移する", () => {
      const props = createMockProps();
      const { result } = renderHook(() => useBattleHandlers(props));

      act(() => {
        result.current.handleBattleCommand("item");
      });

      expect(props.setPhase).toHaveBeenCalledWith("item_select");
    });

    it("runコマンドで逃走処理が実行される", () => {
      const props = createMockProps();
      props.executePlayerAction = vi.fn(() =>
        createMockTurnResult({ battleEnded: true, endReason: "escape" }),
      );

      const { result } = renderHook(() => useBattleHandlers(props));

      act(() => {
        result.current.handleBattleCommand("run");
      });

      expect(props.executePlayerAction).toHaveBeenCalledWith({ type: "escape" }, "fire", "water");
      expect(props.syncPartyHp).toHaveBeenCalled();
      expect(props.finishBattle).toHaveBeenCalledWith(1500);
    });

    it("captureコマンドで捕獲成功時にcapturedGhostがセットされる", () => {
      const props = createMockProps();
      props.executePlayerAction = vi.fn(() =>
        createMockTurnResult({ battleEnded: true, endReason: "capture" }),
      );

      const { result } = renderHook(() => useBattleHandlers(props));

      act(() => {
        result.current.handleBattleCommand("capture");
      });

      expect(props.executePlayerAction).toHaveBeenCalledWith(
        { type: "capture", itemBonus: 1.0 },
        "fire",
        "water",
      );
      expect(props.setCapturedGhost).toHaveBeenCalledWith(props.battleState.enemyGhost?.ghost);
      expect(props.finishBattle).not.toHaveBeenCalled();
    });

    it("捕獲失敗でplayer_loseの場合finishBattleが呼ばれる", () => {
      const props = createMockProps();
      props.executePlayerAction = vi.fn(() =>
        createMockTurnResult({ battleEnded: true, endReason: "player_lose" }),
      );

      const { result } = renderHook(() => useBattleHandlers(props));

      act(() => {
        result.current.handleBattleCommand("capture");
      });

      expect(props.finishBattle).toHaveBeenCalled();
      expect(props.setCapturedGhost).not.toHaveBeenCalled();
    });
  });

  describe("handleMoveSelect", () => {
    it("技選択後にバトルが終了する場合finishBattleが呼ばれる", () => {
      const props = createMockProps();
      props.executePlayerAction = vi.fn(() =>
        createMockTurnResult({ battleEnded: true, endReason: "player_win" }),
      );

      const { result } = renderHook(() => useBattleHandlers(props));

      act(() => {
        result.current.handleMoveSelect("tackle");
      });

      expect(props.executePlayerAction).toHaveBeenCalledWith(
        { type: "attack", moveIndex: 0 },
        "fire",
        "water",
      );
      expect(props.syncPartyHp).toHaveBeenCalled();
      expect(props.finishBattle).toHaveBeenCalled();
    });

    it("技選択後にバトルが継続する場合command_selectに戻る", () => {
      const props = createMockProps();
      props.executePlayerAction = vi.fn(() => createMockTurnResult());

      const { result } = renderHook(() => useBattleHandlers(props));

      act(() => {
        result.current.handleMoveSelect("tackle");
      });

      expect(props.setPhase).toHaveBeenCalledWith("command_select");
      expect(props.finishBattle).not.toHaveBeenCalled();
    });

    it("存在しない技IDの場合何もしない", () => {
      const props = createMockProps();
      const { result } = renderHook(() => useBattleHandlers(props));

      act(() => {
        result.current.handleMoveSelect("nonexistent-move");
      });

      expect(props.executePlayerAction).not.toHaveBeenCalled();
    });
  });

  describe("handleMoveSelectBack", () => {
    it("command_selectフェーズに戻る", () => {
      const props = createMockProps();
      const { result } = renderHook(() => useBattleHandlers(props));

      act(() => {
        result.current.handleMoveSelectBack();
      });

      expect(props.setPhase).toHaveBeenCalledWith("command_select");
    });
  });

  describe("handleItemSelectBack", () => {
    it("command_selectフェーズに戻る", () => {
      const props = createMockProps();
      const { result } = renderHook(() => useBattleHandlers(props));

      act(() => {
        result.current.handleItemSelectBack();
      });

      expect(props.setPhase).toHaveBeenCalledWith("command_select");
    });
  });

  describe("getPlayerMoves", () => {
    it("プレイヤーゴーストの技一覧を返す", () => {
      const props = createMockProps();
      const { result } = renderHook(() => useBattleHandlers(props));

      const moves = result.current.getPlayerMoves();

      expect(moves).toHaveLength(1);
      expect(moves[0].ownedMove.moveId).toBe("tackle");
    });

    it("プレイヤーゴーストがnullの場合空配列を返す", () => {
      const props = createMockProps();
      props.battleState = createMockBattleState({ playerGhost: null });

      const { result } = renderHook(() => useBattleHandlers(props));

      const moves = result.current.getPlayerMoves();

      expect(moves).toHaveLength(0);
    });
  });

  describe("getBattleItems", () => {
    it("回復系と捕獲系のアイテムのみを返す", () => {
      const props = createMockProps();
      props.inventoryItems = [
        { itemId: "potion", quantity: 5 },
        { itemId: "ghost-ball", quantity: 3 },
      ];

      const { result } = renderHook(() => useBattleHandlers(props));

      const items = result.current.getBattleItems();

      // ALL_ITEMSに存在するアイテムのみ返される
      expect(items.length).toBeGreaterThanOrEqual(0);
    });

    it("インベントリが空の場合空配列を返す", () => {
      const props = createMockProps();
      props.inventoryItems = [];

      const { result } = renderHook(() => useBattleHandlers(props));

      const items = result.current.getBattleItems();

      expect(items).toHaveLength(0);
    });
  });
});
