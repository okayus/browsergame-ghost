import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useScreenTransition } from "./useScreenTransition";

describe("useScreenTransition", () => {
  describe("初期状態", () => {
    it("初期状態でisTransitioningがfalse", () => {
      const onScreenChange = vi.fn();
      const { result } = renderHook(() => useScreenTransition("map", onScreenChange));

      expect(result.current.state.isTransitioning).toBe(false);
      expect(result.current.state.pendingScreen).toBeNull();
    });

    it("初期状態でトランジションタイプがfade", () => {
      const onScreenChange = vi.fn();
      const { result } = renderHook(() => useScreenTransition("map", onScreenChange));

      expect(result.current.state.transitionType).toBe("fade");
    });
  });

  describe("startTransition", () => {
    it("トランジションを開始するとisTransitioningがtrueになる", () => {
      const onScreenChange = vi.fn();
      const { result } = renderHook(() => useScreenTransition("map", onScreenChange));

      act(() => {
        result.current.startTransition("battle");
      });

      expect(result.current.state.isTransitioning).toBe(true);
      expect(result.current.state.pendingScreen).toBe("battle");
    });

    it("マップからバトルへの遷移でbattle-enterタイプが設定される", () => {
      const onScreenChange = vi.fn();
      const { result } = renderHook(() => useScreenTransition("map", onScreenChange));

      act(() => {
        result.current.startTransition("battle");
      });

      expect(result.current.state.transitionType).toBe("battle-enter");
    });

    it("バトルからマップへの遷移でbattle-exitタイプが設定される", () => {
      const onScreenChange = vi.fn();
      const { result } = renderHook(() => useScreenTransition("battle", onScreenChange));

      act(() => {
        result.current.startTransition("map");
      });

      expect(result.current.state.transitionType).toBe("battle-exit");
    });

    it("同じ画面への遷移は無視される", () => {
      const onScreenChange = vi.fn();
      const { result } = renderHook(() => useScreenTransition("map", onScreenChange));

      act(() => {
        result.current.startTransition("map");
      });

      expect(result.current.state.isTransitioning).toBe(false);
    });
  });

  describe("onTransitionComplete", () => {
    it("トランジション完了時にonScreenChangeが呼ばれる", () => {
      const onScreenChange = vi.fn();
      const { result } = renderHook(() => useScreenTransition("map", onScreenChange));

      act(() => {
        result.current.startTransition("battle");
      });

      act(() => {
        result.current.onTransitionComplete();
      });

      expect(onScreenChange).toHaveBeenCalledWith("battle");
    });

    it("トランジション完了後に状態がリセットされる", () => {
      const onScreenChange = vi.fn();
      const { result } = renderHook(() => useScreenTransition("map", onScreenChange));

      act(() => {
        result.current.startTransition("battle");
      });

      act(() => {
        result.current.onTransitionComplete();
      });

      expect(result.current.state.isTransitioning).toBe(false);
      expect(result.current.state.pendingScreen).toBeNull();
    });
  });

  describe("skipTransition", () => {
    it("トランジションをスキップして即座に画面変更", () => {
      const onScreenChange = vi.fn();
      const { result } = renderHook(() => useScreenTransition("map", onScreenChange));

      act(() => {
        result.current.skipTransition("battle");
      });

      expect(onScreenChange).toHaveBeenCalledWith("battle");
      expect(result.current.state.isTransitioning).toBe(false);
    });

    it("進行中のトランジションをスキップできる", () => {
      const onScreenChange = vi.fn();
      const { result } = renderHook(() => useScreenTransition("map", onScreenChange));

      act(() => {
        result.current.startTransition("battle");
      });

      expect(result.current.state.isTransitioning).toBe(true);

      act(() => {
        result.current.skipTransition("menu");
      });

      expect(onScreenChange).toHaveBeenCalledWith("menu");
      expect(result.current.state.isTransitioning).toBe(false);
      expect(result.current.state.pendingScreen).toBeNull();
    });
  });
});
