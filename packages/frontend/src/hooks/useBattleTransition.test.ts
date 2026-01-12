import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useBattleTransition } from "./useBattleTransition";

describe("useBattleTransition", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("finishBattle", () => {
    it("デフォルトで2000ms後にバトル終了処理を実行する", () => {
      const mockResetBattle = vi.fn();
      const mockSetScreen = vi.fn();
      const mockSetPlayerGhostType = vi.fn();
      const mockSetEnemyGhostType = vi.fn();

      const { result } = renderHook(() =>
        useBattleTransition({
          resetBattle: mockResetBattle,
          setScreen: mockSetScreen,
          setPlayerGhostType: mockSetPlayerGhostType,
          setEnemyGhostType: mockSetEnemyGhostType,
        }),
      );

      act(() => {
        result.current.finishBattle();
      });

      // まだ実行されていない
      expect(mockResetBattle).not.toHaveBeenCalled();
      expect(mockSetScreen).not.toHaveBeenCalled();

      // 2000ms経過
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // 実行された
      expect(mockResetBattle).toHaveBeenCalledTimes(1);
      expect(mockSetScreen).toHaveBeenCalledWith("map");
      expect(mockSetPlayerGhostType).toHaveBeenCalledWith(null);
      expect(mockSetEnemyGhostType).toHaveBeenCalledWith(null);
    });

    it("カスタム遅延時間で実行できる", () => {
      const mockResetBattle = vi.fn();
      const mockSetScreen = vi.fn();
      const mockSetPlayerGhostType = vi.fn();
      const mockSetEnemyGhostType = vi.fn();

      const { result } = renderHook(() =>
        useBattleTransition({
          resetBattle: mockResetBattle,
          setScreen: mockSetScreen,
          setPlayerGhostType: mockSetPlayerGhostType,
          setEnemyGhostType: mockSetEnemyGhostType,
        }),
      );

      act(() => {
        result.current.finishBattle(1500);
      });

      // 1500ms経過前
      act(() => {
        vi.advanceTimersByTime(1499);
      });
      expect(mockResetBattle).not.toHaveBeenCalled();

      // 1500ms経過
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(mockResetBattle).toHaveBeenCalledTimes(1);
    });

    it("0msの遅延で即座に実行できる", () => {
      const mockResetBattle = vi.fn();
      const mockSetScreen = vi.fn();
      const mockSetPlayerGhostType = vi.fn();
      const mockSetEnemyGhostType = vi.fn();

      const { result } = renderHook(() =>
        useBattleTransition({
          resetBattle: mockResetBattle,
          setScreen: mockSetScreen,
          setPlayerGhostType: mockSetPlayerGhostType,
          setEnemyGhostType: mockSetEnemyGhostType,
        }),
      );

      act(() => {
        result.current.finishBattle(0);
      });

      // setTimeoutの0msは次のティックで実行
      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(mockResetBattle).toHaveBeenCalledTimes(1);
      expect(mockSetScreen).toHaveBeenCalledWith("map");
    });

    it("処理順序が正しい（resetBattle → setScreen → ゴーストタイプクリア）", () => {
      const callOrder: string[] = [];
      const mockResetBattle = vi.fn(() => callOrder.push("resetBattle"));
      const mockSetScreen = vi.fn(() => callOrder.push("setScreen"));
      const mockSetPlayerGhostType = vi.fn(() => callOrder.push("setPlayerGhostType"));
      const mockSetEnemyGhostType = vi.fn(() => callOrder.push("setEnemyGhostType"));

      const { result } = renderHook(() =>
        useBattleTransition({
          resetBattle: mockResetBattle,
          setScreen: mockSetScreen,
          setPlayerGhostType: mockSetPlayerGhostType,
          setEnemyGhostType: mockSetEnemyGhostType,
        }),
      );

      act(() => {
        result.current.finishBattle();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(callOrder).toEqual([
        "resetBattle",
        "setScreen",
        "setPlayerGhostType",
        "setEnemyGhostType",
      ]);
    });
  });

  describe("メモ化", () => {
    it("コールバックが変わらなければfinishBattleは同じ参照を保持する", () => {
      const mockResetBattle = vi.fn();
      const mockSetScreen = vi.fn();
      const mockSetPlayerGhostType = vi.fn();
      const mockSetEnemyGhostType = vi.fn();

      const { result, rerender } = renderHook(() =>
        useBattleTransition({
          resetBattle: mockResetBattle,
          setScreen: mockSetScreen,
          setPlayerGhostType: mockSetPlayerGhostType,
          setEnemyGhostType: mockSetEnemyGhostType,
        }),
      );

      const firstFinishBattle = result.current.finishBattle;

      rerender();

      expect(result.current.finishBattle).toBe(firstFinishBattle);
    });
  });
});
