import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSaveData } from "./useSaveData";

// Mock useApiClient
const mockGetApiClient = vi.fn();
vi.mock("./useApiClient", () => ({
  useApiClient: () => ({
    getApiClient: mockGetApiClient,
  }),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Sample save data
const mockSaveData = {
  id: "player-1",
  clerkUserId: "clerk-123",
  name: "Test Player",
  party: [
    {
      id: "ghost-1",
      speciesId: "species-1",
      nickname: "Test Ghost",
      level: 5,
      experience: 0,
      currentHp: 50,
      maxHp: 50,
      stats: { attack: 10, defense: 10, speed: 10 },
      moves: [],
    },
  ],
  inventory: { potion: 3 },
  position: { x: 5, y: 5, mapId: "map-1" },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("useSaveData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("loadSaveData", () => {
    it("バックエンドからセーブデータを読み込む", async () => {
      mockGetApiClient.mockResolvedValue({
        api: {
          save: {
            $get: vi.fn().mockResolvedValue({
              ok: true,
              json: () => Promise.resolve({ data: mockSaveData }),
            }),
          },
        },
      });

      const { result } = renderHook(() => useSaveData());

      await act(async () => {
        await result.current.loadSaveData();
      });

      expect(result.current.data).toEqual(mockSaveData);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("404の場合はnullを返す（新規プレイヤー）", async () => {
      mockGetApiClient.mockResolvedValue({
        api: {
          save: {
            $get: vi.fn().mockResolvedValue({
              ok: false,
              status: 404,
            }),
          },
        },
      });

      const { result } = renderHook(() => useSaveData());

      await act(async () => {
        const data = await result.current.loadSaveData();
        expect(data).toBeNull();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it("エラー時はエラーメッセージを設定する", async () => {
      mockGetApiClient.mockResolvedValue({
        api: {
          save: {
            $get: vi.fn().mockResolvedValue({
              ok: false,
              status: 500,
            }),
          },
        },
      });

      const { result } = renderHook(() => useSaveData());

      await act(async () => {
        await result.current.loadSaveData();
      });

      expect(result.current.error).toBe("Failed to load save data: 500");
    });
  });

  describe("saveData", () => {
    it("バックエンドにセーブデータを保存する", async () => {
      const mockPost = vi.fn().mockResolvedValue({ ok: true });
      mockGetApiClient.mockResolvedValue({
        api: {
          save: {
            $post: mockPost,
          },
        },
      });

      const { result } = renderHook(() => useSaveData());

      const dataToSave = { position: { x: 10, y: 10, mapId: "map-1" } };
      await act(async () => {
        const success = await result.current.saveData(dataToSave);
        expect(success).toBe(true);
      });

      expect(mockPost).toHaveBeenCalledWith({ json: dataToSave });
      expect(result.current.lastSavedAt).not.toBeNull();
    });

    it("保存成功時にlastSavedAtが更新される", async () => {
      mockGetApiClient.mockResolvedValue({
        api: {
          save: {
            $post: vi.fn().mockResolvedValue({ ok: true }),
          },
        },
      });

      const { result } = renderHook(() => useSaveData());

      expect(result.current.lastSavedAt).toBeNull();

      await act(async () => {
        await result.current.saveData({ position: { x: 1, y: 1, mapId: "map-1" } });
      });

      expect(result.current.lastSavedAt).toBeInstanceOf(Date);
    });
  });

  describe("オフラインキャッシュ", () => {
    it("バックエンド通信失敗時にローカルキャッシュに保存する", async () => {
      mockGetApiClient.mockResolvedValue({
        api: {
          save: {
            $post: vi.fn().mockRejectedValue(new Error("Network error")),
          },
        },
      });

      const { result } = renderHook(() => useSaveData());

      const dataToSave = { position: { x: 10, y: 10, mapId: "map-1" } };
      await act(async () => {
        await result.current.saveData(dataToSave);
      });

      // ローカルキャッシュに保存されていることを確認
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "ghost-game-pending-save",
        expect.any(String),
      );
    });

    it("hasPendingCacheがtrueになる", async () => {
      mockGetApiClient.mockResolvedValue({
        api: {
          save: {
            $post: vi.fn().mockRejectedValue(new Error("Network error")),
          },
        },
      });

      const { result } = renderHook(() => useSaveData());

      await act(async () => {
        await result.current.saveData({ position: { x: 10, y: 10, mapId: "map-1" } });
      });

      expect(result.current.hasPendingCache).toBe(true);
    });

    it("復旧後に自動同期する", async () => {
      // 最初は失敗
      const mockPost = vi
        .fn()
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({ ok: true });

      mockGetApiClient.mockResolvedValue({
        api: {
          save: {
            $post: mockPost,
          },
        },
      });

      const { result } = renderHook(() => useSaveData());

      // 失敗して保留キャッシュに保存
      await act(async () => {
        await result.current.saveData({ position: { x: 10, y: 10, mapId: "map-1" } });
      });

      expect(result.current.hasPendingCache).toBe(true);

      // 同期を試みる
      await act(async () => {
        await result.current.syncPendingCache();
      });

      expect(result.current.hasPendingCache).toBe(false);
      expect(mockPost).toHaveBeenCalledTimes(2);
    });

    it("ローカルキャッシュからデータを復元できる", async () => {
      const cachedData = {
        position: { x: 10, y: 10, mapId: "map-1" },
        timestamp: Date.now(),
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData));

      const { result } = renderHook(() => useSaveData());

      expect(result.current.hasPendingCache).toBe(true);
    });
  });

  describe("自動セーブ", () => {
    it("updatePendingSaveDataでデータを更新できる", async () => {
      const { result } = renderHook(() => useSaveData());

      act(() => {
        result.current.updatePendingSaveData({ position: { x: 5, y: 5, mapId: "map-1" } });
      });

      // pendingデータが設定されていることを確認（内部状態なので直接確認できない）
      // executeAutoSaveを呼び出して確認
      const mockPost = vi.fn().mockResolvedValue({ ok: true });
      mockGetApiClient.mockResolvedValue({
        api: {
          save: {
            $post: mockPost,
          },
        },
      });

      await act(async () => {
        await result.current.executeAutoSave();
      });

      expect(mockPost).toHaveBeenCalledWith({
        json: { position: { x: 5, y: 5, mapId: "map-1" } },
      });
    });

    it("30秒間隔で自動セーブが実行される", async () => {
      const mockPost = vi.fn().mockResolvedValue({ ok: true });
      mockGetApiClient.mockResolvedValue({
        api: {
          save: {
            $post: mockPost,
          },
        },
      });

      const { result } = renderHook(() => useSaveData());

      act(() => {
        result.current.updatePendingSaveData({ position: { x: 5, y: 5, mapId: "map-1" } });
      });

      // 30秒経過させてインターバルを発火
      await act(async () => {
        vi.advanceTimersByTime(30000);
        // Promiseを解決させる
        await Promise.resolve();
      });

      expect(mockPost).toHaveBeenCalled();
    });
  });
});
