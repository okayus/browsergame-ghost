import type { OwnedGhost, Party } from "@ghost-game/shared";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCaptureHandlers } from "./useCaptureHandlers";

const createMockGhost = (id: string): OwnedGhost => ({
  id,
  speciesId: "fireling",
  level: 5,
  experience: 0,
  currentHp: 50,
  maxHp: 50,
  stats: { hp: 50, attack: 10, defense: 8, speed: 12 },
  moves: [],
});

const createMockParty = (count = 3): Party => ({
  ghosts: Array.from({ length: count }, (_, i) => createMockGhost(`ghost-${i}`)),
});

const createMockProps = (overrides?: Partial<ReturnType<typeof createMockPropsBase>>) => ({
  ...createMockPropsBase(),
  ...overrides,
});

const createMockPropsBase = () => ({
  capturedGhost: createMockGhost("captured-ghost") as OwnedGhost | null,
  setCapturedGhost: vi.fn(),
  addGhostToParty: vi.fn(() => true),
  swapPartyGhost: vi.fn(() => createMockGhost("swapped-ghost")),
  party: createMockParty() as Party | null,
  updatePendingSaveData: vi.fn(),
  resetBattle: vi.fn(),
  setScreen: vi.fn(),
  setPlayerGhostType: vi.fn(),
  setEnemyGhostType: vi.fn(),
});

describe("useCaptureHandlers", () => {
  describe("finishCaptureAndBattle", () => {
    it("捕獲ゴーストをクリアしてマップに遷移する", () => {
      const props = createMockProps();
      const { result } = renderHook(() => useCaptureHandlers(props));

      act(() => {
        result.current.finishCaptureAndBattle();
      });

      expect(props.setCapturedGhost).toHaveBeenCalledWith(null);
      expect(props.resetBattle).toHaveBeenCalled();
      expect(props.setScreen).toHaveBeenCalledWith("map");
      expect(props.setPlayerGhostType).toHaveBeenCalledWith(null);
      expect(props.setEnemyGhostType).toHaveBeenCalledWith(null);
    });
  });

  describe("handleAddCapturedToParty", () => {
    it("捕獲したゴーストをパーティに追加する", () => {
      const props = createMockProps();
      const { result } = renderHook(() => useCaptureHandlers(props));

      act(() => {
        result.current.handleAddCapturedToParty();
      });

      expect(props.addGhostToParty).toHaveBeenCalledWith(props.capturedGhost);
      expect(props.updatePendingSaveData).toHaveBeenCalledWith({ party: props.party });
      expect(props.setCapturedGhost).toHaveBeenCalledWith(null);
      expect(props.setScreen).toHaveBeenCalledWith("map");
    });

    it("capturedGhostがnullの場合addGhostToPartyは呼ばれない", () => {
      const props = createMockProps({ capturedGhost: null });

      const { result } = renderHook(() => useCaptureHandlers(props));

      act(() => {
        result.current.handleAddCapturedToParty();
      });

      expect(props.addGhostToParty).not.toHaveBeenCalled();
      // finishCaptureAndBattleは呼ばれる
      expect(props.setScreen).toHaveBeenCalledWith("map");
    });

    it("partyがnullの場合updatePendingSaveDataは呼ばれない", () => {
      const props = createMockProps({ party: null });

      const { result } = renderHook(() => useCaptureHandlers(props));

      act(() => {
        result.current.handleAddCapturedToParty();
      });

      expect(props.addGhostToParty).toHaveBeenCalled();
      expect(props.updatePendingSaveData).not.toHaveBeenCalled();
    });
  });

  describe("handleSendCapturedToBox", () => {
    it("ボックスに送る（現在は単純に終了）", () => {
      const props = createMockProps();
      const { result } = renderHook(() => useCaptureHandlers(props));

      act(() => {
        result.current.handleSendCapturedToBox();
      });

      // finishCaptureAndBattleが呼ばれる
      expect(props.setCapturedGhost).toHaveBeenCalledWith(null);
      expect(props.setScreen).toHaveBeenCalledWith("map");
    });
  });

  describe("handleSwapCapturedWithParty", () => {
    it("パーティのゴーストと入れ替える", () => {
      const props = createMockProps();
      const { result } = renderHook(() => useCaptureHandlers(props));

      act(() => {
        result.current.handleSwapCapturedWithParty(1);
      });

      expect(props.swapPartyGhost).toHaveBeenCalledWith(1, props.capturedGhost);
      expect(props.updatePendingSaveData).toHaveBeenCalledWith({ party: props.party });
      expect(props.setCapturedGhost).toHaveBeenCalledWith(null);
      expect(props.setScreen).toHaveBeenCalledWith("map");
    });

    it("capturedGhostがnullの場合swapPartyGhostは呼ばれない", () => {
      const props = createMockProps({ capturedGhost: null });

      const { result } = renderHook(() => useCaptureHandlers(props));

      act(() => {
        result.current.handleSwapCapturedWithParty(0);
      });

      expect(props.swapPartyGhost).not.toHaveBeenCalled();
      // finishCaptureAndBattleは呼ばれる
      expect(props.setScreen).toHaveBeenCalledWith("map");
    });
  });
});
