import type { OwnedGhost, Party } from "@ghost-game/shared";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { syncPartyHpAfterBattle, useBattleEndSync } from "./useBattleEndSync";
import type { BattleEndReason, BattleState } from "./useBattleState";
import { useGameState } from "./useGameState";

const createMockGhost = (id: string, currentHp: number, maxHp: number): OwnedGhost => ({
  id,
  speciesId: "fireling",
  level: 5,
  experience: 0,
  currentHp,
  maxHp,
  stats: { hp: maxHp, attack: 10, defense: 8, speed: 12 },
  moves: [],
});

const createMockParty = (ghosts: OwnedGhost[]): Party => ({
  ghosts,
});

const createMockBattleState = (
  playerCurrentHp: number,
  playerMaxHp: number,
  endReason: BattleEndReason | null,
): BattleState => ({
  phase: "result",
  playerGhost: {
    ghost: createMockGhost("ghost-1", playerMaxHp, playerMaxHp),
    currentHp: playerCurrentHp,
    statModifiers: { attack: 0, defense: 0, speed: 0 },
  },
  enemyGhost: {
    ghost: createMockGhost("enemy-1", 20, 20),
    currentHp: 0,
    statModifiers: { attack: 0, defense: 0, speed: 0 },
  },
  turnCount: 5,
  escapeAttempts: 0,
  messages: [],
  isActive: false,
  endReason,
});

describe("syncPartyHpAfterBattle", () => {
  describe("player_win", () => {
    it("should update party ghost HP to battle HP on victory", () => {
      const party = createMockParty([
        createMockGhost("ghost-1", 50, 50),
        createMockGhost("ghost-2", 40, 40),
      ]);
      const battleState = createMockBattleState(30, 50, "player_win");

      const result = syncPartyHpAfterBattle(battleState, "player_win", party, "ghost-1");

      expect(result.updatedParty.ghosts[0].currentHp).toBe(30);
      expect(result.updatedParty.ghosts[1].currentHp).toBe(40); // unchanged
    });
  });

  describe("escape", () => {
    it("should update party ghost HP to battle HP on escape", () => {
      const party = createMockParty([createMockGhost("ghost-1", 50, 50)]);
      const battleState = createMockBattleState(25, 50, "escape");

      const result = syncPartyHpAfterBattle(battleState, "escape", party, "ghost-1");

      expect(result.updatedParty.ghosts[0].currentHp).toBe(25);
    });
  });

  describe("capture", () => {
    it("should update party ghost HP to battle HP on capture", () => {
      const party = createMockParty([createMockGhost("ghost-1", 50, 50)]);
      const battleState = createMockBattleState(35, 50, "capture");

      const result = syncPartyHpAfterBattle(battleState, "capture", party, "ghost-1");

      expect(result.updatedParty.ghosts[0].currentHp).toBe(35);
    });
  });

  describe("player_lose", () => {
    it("should restore all party ghosts to max HP on defeat", () => {
      const party = createMockParty([
        createMockGhost("ghost-1", 10, 50),
        createMockGhost("ghost-2", 5, 40),
        createMockGhost("ghost-3", 0, 30),
      ]);
      const battleState = createMockBattleState(0, 50, "player_lose");

      const result = syncPartyHpAfterBattle(battleState, "player_lose", party, "ghost-1");

      expect(result.updatedParty.ghosts[0].currentHp).toBe(50);
      expect(result.updatedParty.ghosts[1].currentHp).toBe(40);
      expect(result.updatedParty.ghosts[2].currentHp).toBe(30);
    });
  });

  describe("edge cases", () => {
    it("should handle null playerGhost in battleState", () => {
      const party = createMockParty([createMockGhost("ghost-1", 50, 50)]);
      const battleState: BattleState = {
        phase: "result",
        playerGhost: null,
        enemyGhost: null,
        turnCount: 1,
        escapeAttempts: 0,
        messages: [],
        isActive: false,
        endReason: "player_win",
      };

      const result = syncPartyHpAfterBattle(battleState, "player_win", party, "ghost-1");

      // Should not crash and return unchanged party
      expect(result.updatedParty.ghosts[0].currentHp).toBe(50);
    });

    it("should handle ghost not found in party", () => {
      const party = createMockParty([createMockGhost("ghost-2", 50, 50)]);
      const battleState = createMockBattleState(30, 50, "player_win");

      const result = syncPartyHpAfterBattle(battleState, "player_win", party, "ghost-1");

      // Should not crash and return unchanged party
      expect(result.updatedParty.ghosts[0].currentHp).toBe(50);
    });

    it("should return saveRequired true for all end reasons", () => {
      const party = createMockParty([createMockGhost("ghost-1", 50, 50)]);

      const winResult = syncPartyHpAfterBattle(
        createMockBattleState(30, 50, "player_win"),
        "player_win",
        party,
        "ghost-1",
      );
      expect(winResult.saveRequired).toBe(true);

      const loseResult = syncPartyHpAfterBattle(
        createMockBattleState(0, 50, "player_lose"),
        "player_lose",
        party,
        "ghost-1",
      );
      expect(loseResult.saveRequired).toBe(true);

      const escapeResult = syncPartyHpAfterBattle(
        createMockBattleState(25, 50, "escape"),
        "escape",
        party,
        "ghost-1",
      );
      expect(escapeResult.saveRequired).toBe(true);

      const captureResult = syncPartyHpAfterBattle(
        createMockBattleState(35, 50, "capture"),
        "capture",
        party,
        "ghost-1",
      );
      expect(captureResult.saveRequired).toBe(true);
    });
  });
});

/**
 * useBattleEndSync フックの統合テスト
 *
 * Task 23.1: バトル終了HP同期のテスト
 * - 勝利時のHP同期テスト
 * - 敗北時の全回復テスト
 * - 逃走/捕獲時のHP同期テスト
 * - セーブキュー追加の確認テスト
 */
describe("useBattleEndSync hook", () => {
  const createMockPartyForHook = (): Party => ({
    ghosts: [createMockGhost("ghost-1", 50, 50), createMockGhost("ghost-2", 40, 40)],
  });

  describe("勝利時のHP同期", () => {
    it("勝利時にバトル中のHPがパーティに反映される", () => {
      const mockUpdatePendingSaveData = vi.fn();
      const { result: gameStateResult } = renderHook(() => useGameState());

      // パーティをセット
      act(() => {
        gameStateResult.current.setParty(createMockPartyForHook());
      });

      // フックをレンダリング
      const { result: syncResult } = renderHook(() =>
        useBattleEndSync(gameStateResult.current, mockUpdatePendingSaveData),
      );

      // バトル状態（勝利、HP30残り）
      const battleState = createMockBattleState(30, 50, "player_win");

      // HP同期を実行
      act(() => {
        syncResult.current.syncPartyHp(battleState, "player_win", "ghost-1");
      });

      // パーティのHPが更新されていることを確認
      expect(gameStateResult.current.state.party?.ghosts[0].currentHp).toBe(30);
      expect(gameStateResult.current.state.party?.ghosts[1].currentHp).toBe(40); // 変更なし

      // セーブキューに追加されていることを確認
      expect(mockUpdatePendingSaveData).toHaveBeenCalledWith({
        party: expect.objectContaining({
          ghosts: expect.arrayContaining([
            expect.objectContaining({ id: "ghost-1", currentHp: 30 }),
          ]),
        }),
      });
    });

    it("勝利時にHPが0でもパーティに反映される", () => {
      const mockUpdatePendingSaveData = vi.fn();
      const { result: gameStateResult } = renderHook(() => useGameState());

      act(() => {
        gameStateResult.current.setParty(createMockPartyForHook());
      });

      const { result: syncResult } = renderHook(() =>
        useBattleEndSync(gameStateResult.current, mockUpdatePendingSaveData),
      );

      // HPが0で勝利（相打ちのようなケース）
      const battleState = createMockBattleState(0, 50, "player_win");

      act(() => {
        syncResult.current.syncPartyHp(battleState, "player_win", "ghost-1");
      });

      expect(gameStateResult.current.state.party?.ghosts[0].currentHp).toBe(0);
    });
  });

  describe("敗北時の全回復", () => {
    it("敗北時にパーティ全員のHPが最大HPまで回復する", () => {
      const mockUpdatePendingSaveData = vi.fn();
      const { result: gameStateResult } = renderHook(() => useGameState());

      // ダメージを受けた状態のパーティをセット
      act(() => {
        gameStateResult.current.setParty({
          ghosts: [
            createMockGhost("ghost-1", 10, 50),
            createMockGhost("ghost-2", 5, 40),
            createMockGhost("ghost-3", 0, 30),
          ],
        });
      });

      const { result: syncResult } = renderHook(() =>
        useBattleEndSync(gameStateResult.current, mockUpdatePendingSaveData),
      );

      const battleState = createMockBattleState(0, 50, "player_lose");

      act(() => {
        syncResult.current.syncPartyHp(battleState, "player_lose", "ghost-1");
      });

      // 全員が最大HPまで回復していることを確認
      expect(gameStateResult.current.state.party?.ghosts[0].currentHp).toBe(50);
      expect(gameStateResult.current.state.party?.ghosts[1].currentHp).toBe(40);
      expect(gameStateResult.current.state.party?.ghosts[2].currentHp).toBe(30);

      // セーブキューに追加されていることを確認
      expect(mockUpdatePendingSaveData).toHaveBeenCalledWith({
        party: expect.objectContaining({
          ghosts: expect.arrayContaining([
            expect.objectContaining({ id: "ghost-1", currentHp: 50 }),
            expect.objectContaining({ id: "ghost-2", currentHp: 40 }),
            expect.objectContaining({ id: "ghost-3", currentHp: 30 }),
          ]),
        }),
      });
    });
  });

  describe("逃走時のHP同期", () => {
    it("逃走成功時にバトル中のHPがパーティに反映される", () => {
      const mockUpdatePendingSaveData = vi.fn();
      const { result: gameStateResult } = renderHook(() => useGameState());

      act(() => {
        gameStateResult.current.setParty(createMockPartyForHook());
      });

      const { result: syncResult } = renderHook(() =>
        useBattleEndSync(gameStateResult.current, mockUpdatePendingSaveData),
      );

      const battleState = createMockBattleState(25, 50, "escape");

      act(() => {
        syncResult.current.syncPartyHp(battleState, "escape", "ghost-1");
      });

      expect(gameStateResult.current.state.party?.ghosts[0].currentHp).toBe(25);
      expect(mockUpdatePendingSaveData).toHaveBeenCalled();
    });
  });

  describe("捕獲時のHP同期", () => {
    it("捕獲成功時にバトル中のHPがパーティに反映される", () => {
      const mockUpdatePendingSaveData = vi.fn();
      const { result: gameStateResult } = renderHook(() => useGameState());

      act(() => {
        gameStateResult.current.setParty(createMockPartyForHook());
      });

      const { result: syncResult } = renderHook(() =>
        useBattleEndSync(gameStateResult.current, mockUpdatePendingSaveData),
      );

      const battleState = createMockBattleState(35, 50, "capture");

      act(() => {
        syncResult.current.syncPartyHp(battleState, "capture", "ghost-1");
      });

      expect(gameStateResult.current.state.party?.ghosts[0].currentHp).toBe(35);
      expect(mockUpdatePendingSaveData).toHaveBeenCalled();
    });
  });

  describe("セーブキュー追加の確認", () => {
    it("全てのバトル終了理由でセーブキューに追加される", () => {
      const endReasons: BattleEndReason[] = ["player_win", "player_lose", "escape", "capture"];

      for (const reason of endReasons) {
        const mockUpdatePendingSaveData = vi.fn();
        const { result: gameStateResult } = renderHook(() => useGameState());

        act(() => {
          gameStateResult.current.setParty(createMockPartyForHook());
        });

        const { result: syncResult } = renderHook(() =>
          useBattleEndSync(gameStateResult.current, mockUpdatePendingSaveData),
        );

        const battleState = createMockBattleState(30, 50, reason);

        act(() => {
          syncResult.current.syncPartyHp(battleState, reason, "ghost-1");
        });

        expect(mockUpdatePendingSaveData).toHaveBeenCalledTimes(1);
        expect(mockUpdatePendingSaveData).toHaveBeenCalledWith({
          party: expect.any(Object),
        });
      }
    });
  });

  describe("エッジケース", () => {
    it("パーティがnullの場合は何もしない", () => {
      const mockUpdatePendingSaveData = vi.fn();
      const { result: gameStateResult } = renderHook(() => useGameState());

      // パーティをセットしない（null）

      const { result: syncResult } = renderHook(() =>
        useBattleEndSync(gameStateResult.current, mockUpdatePendingSaveData),
      );

      const battleState = createMockBattleState(30, 50, "player_win");

      act(() => {
        syncResult.current.syncPartyHp(battleState, "player_win", "ghost-1");
      });

      // セーブキューに追加されないことを確認
      expect(mockUpdatePendingSaveData).not.toHaveBeenCalled();
      expect(gameStateResult.current.state.party).toBeNull();
    });

    it("対象ゴーストがパーティに存在しない場合でもクラッシュしない", () => {
      const mockUpdatePendingSaveData = vi.fn();
      const { result: gameStateResult } = renderHook(() => useGameState());

      act(() => {
        gameStateResult.current.setParty(createMockPartyForHook());
      });

      const { result: syncResult } = renderHook(() =>
        useBattleEndSync(gameStateResult.current, mockUpdatePendingSaveData),
      );

      const battleState = createMockBattleState(30, 50, "player_win");

      // 存在しないゴーストIDを指定
      act(() => {
        syncResult.current.syncPartyHp(battleState, "player_win", "nonexistent-ghost");
      });

      // クラッシュせずにセーブキューに追加される
      expect(mockUpdatePendingSaveData).toHaveBeenCalled();
      // 既存のゴーストのHPは変更されない
      expect(gameStateResult.current.state.party?.ghosts[0].currentHp).toBe(50);
    });
  });
});
