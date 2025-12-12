import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Clerk useAuth hook mock
const mockUseAuth = vi.fn();
vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => mockUseAuth(),
}));

// useSaveData hook mock
const mockLoadSaveData = vi.fn();
const mockUseSaveData = vi.fn();
vi.mock("../api/useSaveData", () => ({
  useSaveData: () => mockUseSaveData(),
}));

// useApiClient hook mock
const mockInitializePlayer = vi.fn();
const mockGetApiClient = vi.fn();
vi.mock("../api/useApiClient", () => ({
  useApiClient: () => ({
    getApiClient: mockGetApiClient,
  }),
}));

import { useAuthState } from "./useAuthState";

describe("useAuthState", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      userId: null,
    });

    // loadSaveDataは常にPromiseを返すようにする
    mockLoadSaveData.mockResolvedValue(null);

    mockUseSaveData.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      loadSaveData: mockLoadSaveData,
    });

    mockGetApiClient.mockResolvedValue({
      api: {
        save: {
          initialize: {
            $post: mockInitializePlayer,
          },
        },
      },
    });
  });

  describe("初期状態", () => {
    it("Clerkが読み込み中の場合、isAuthLoadingがtrue", () => {
      mockUseAuth.mockReturnValue({
        isLoaded: false,
        isSignedIn: false,
        userId: null,
      });

      const { result } = renderHook(() => useAuthState());

      expect(result.current.state.isAuthLoading).toBe(true);
      expect(result.current.state.currentScreen).toBe("loading");
    });

    it("未認証の場合、welcome画面を表示", () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
        userId: null,
      });

      const { result } = renderHook(() => useAuthState());

      expect(result.current.state.isAuthenticated).toBe(false);
      expect(result.current.state.currentScreen).toBe("welcome");
    });

    it("認証済みの場合、isAuthenticatedがtrue", async () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: "user_123",
      });

      mockLoadSaveData.mockResolvedValue(null);

      const { result } = renderHook(() => useAuthState());

      await waitFor(() => {
        expect(result.current.state.isAuthenticated).toBe(true);
      });
    });
  });

  describe("セーブデータ読み込み", () => {
    it("認証成功後にセーブデータを読み込む", async () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: "user_123",
      });

      mockLoadSaveData.mockResolvedValue({
        id: "player_1",
        position: { mapId: "map-001", x: 5, y: 5 },
        party: { ghosts: [] },
        inventory: { items: [] },
      });

      mockUseSaveData.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        loadSaveData: mockLoadSaveData,
      });

      renderHook(() => useAuthState());

      await waitFor(() => {
        expect(mockLoadSaveData).toHaveBeenCalled();
      });
    });

    it("セーブデータ読み込み中はloading画面を表示", () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: "user_123",
      });

      mockUseSaveData.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        loadSaveData: mockLoadSaveData,
      });

      const { result } = renderHook(() => useAuthState());

      expect(result.current.state.currentScreen).toBe("loading");
    });

    it("セーブデータ読み込み成功後はgame画面を表示", () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: "user_123",
      });

      mockUseSaveData.mockReturnValue({
        data: {
          id: "player_1",
          position: { mapId: "map-001", x: 5, y: 5 },
          party: { ghosts: [] },
          inventory: { items: [] },
        },
        loading: false,
        error: null,
        loadSaveData: mockLoadSaveData,
      });

      const { result } = renderHook(() => useAuthState());

      expect(result.current.state.isDataLoaded).toBe(true);
      expect(result.current.state.currentScreen).toBe("game");
    });

    it("セーブデータ読み込みエラー時はerror画面を表示", () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: "user_123",
      });

      mockUseSaveData.mockReturnValue({
        data: null,
        loading: false,
        error: "Failed to load save data",
        loadSaveData: mockLoadSaveData,
      });

      const { result } = renderHook(() => useAuthState());

      expect(result.current.state.currentScreen).toBe("error");
      expect(result.current.state.error).toBe("Failed to load save data");
    });
  });

  describe("新規プレイヤー初期化", () => {
    it("セーブデータがない場合に自動で初期化APIを呼ぶ", async () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: "user_123",
      });

      // 最初はセーブデータなし（loadSaveDataがnullを返す）
      mockLoadSaveData.mockResolvedValue(null);

      mockUseSaveData.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        loadSaveData: mockLoadSaveData,
      });

      // 初期化API成功
      mockInitializePlayer.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              id: "player_1",
              position: { mapId: "map-001", x: 5, y: 5 },
              party: { ghosts: [] },
              inventory: { items: [] },
            },
          }),
      });

      const { result } = renderHook(() => useAuthState());

      // 初期化を手動でトリガー
      await act(async () => {
        await result.current.initializeNewPlayer();
      });

      expect(mockInitializePlayer).toHaveBeenCalled();
    });

    it("初期化成功後はセーブデータを再読み込みする", async () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: "user_123",
      });

      mockLoadSaveData.mockResolvedValue(null);

      mockUseSaveData.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        loadSaveData: mockLoadSaveData,
      });

      mockInitializePlayer.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              id: "player_1",
              position: { mapId: "map-001", x: 5, y: 5 },
              party: { ghosts: [] },
              inventory: { items: [] },
            },
          }),
      });

      const { result } = renderHook(() => useAuthState());

      await act(async () => {
        await result.current.initializeNewPlayer();
      });

      // 初期化後にloadSaveDataが再度呼ばれる
      expect(mockLoadSaveData).toHaveBeenCalledTimes(2);
    });

    it("初期化エラー時はerror画面を表示", async () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: "user_123",
      });

      mockLoadSaveData.mockResolvedValue(null);

      mockUseSaveData.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        loadSaveData: mockLoadSaveData,
      });

      mockInitializePlayer.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useAuthState());

      await act(async () => {
        await result.current.initializeNewPlayer();
      });

      expect(result.current.state.currentScreen).toBe("error");
      expect(result.current.state.error).toBeTruthy();
    });
  });

  describe("リトライ機能", () => {
    it("retry関数でセーブデータ読み込みを再試行できる", async () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: "user_123",
      });

      mockUseSaveData.mockReturnValue({
        data: null,
        loading: false,
        error: "Network error",
        loadSaveData: mockLoadSaveData,
      });

      const { result } = renderHook(() => useAuthState());

      expect(result.current.state.currentScreen).toBe("error");

      // リトライ実行
      await act(async () => {
        await result.current.retry();
      });

      // loadSaveDataが再度呼ばれる（初回 + リトライ）
      expect(mockLoadSaveData).toHaveBeenCalledTimes(2);
    });

    it("リトライでエラーがクリアされる", async () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: "user_123",
      });

      // 最初はエラー状態（内部エラーを使用）
      mockInitializePlayer.mockResolvedValue({
        ok: false,
        status: 500,
      });

      mockUseSaveData.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        loadSaveData: mockLoadSaveData,
      });

      const { result } = renderHook(() => useAuthState());

      // 初期化を実行してエラーを発生させる
      await act(async () => {
        await result.current.initializeNewPlayer();
      });

      // エラーが発生していることを確認
      expect(result.current.state.error).toBeTruthy();

      // リトライ実行
      await act(async () => {
        await result.current.retry();
      });

      // 内部エラーがクリアされる
      expect(result.current.state.error).toBeNull();
    });
  });

  describe("サインアウト", () => {
    it("サインアウト後はwelcome画面に戻る", () => {
      // 最初は認証済み
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: "user_123",
      });

      mockUseSaveData.mockReturnValue({
        data: {
          id: "player_1",
          position: { mapId: "map-001", x: 5, y: 5 },
          party: { ghosts: [] },
          inventory: { items: [] },
        },
        loading: false,
        error: null,
        loadSaveData: mockLoadSaveData,
      });

      const { result, rerender } = renderHook(() => useAuthState());

      expect(result.current.state.currentScreen).toBe("game");

      // サインアウト
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
        userId: null,
      });

      rerender();

      expect(result.current.state.isAuthenticated).toBe(false);
      expect(result.current.state.currentScreen).toBe("welcome");
    });

    it("サインアウト後はisDataLoadedがfalseにリセットされる", () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: "user_123",
      });

      mockUseSaveData.mockReturnValue({
        data: {
          id: "player_1",
          position: { mapId: "map-001", x: 5, y: 5 },
          party: { ghosts: [] },
          inventory: { items: [] },
        },
        loading: false,
        error: null,
        loadSaveData: mockLoadSaveData,
      });

      const { result, rerender } = renderHook(() => useAuthState());

      expect(result.current.state.isDataLoaded).toBe(true);

      // サインアウト
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
        userId: null,
      });

      mockUseSaveData.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        loadSaveData: mockLoadSaveData,
      });

      rerender();

      expect(result.current.state.isDataLoaded).toBe(false);
    });
  });

  describe("needsInitialization", () => {
    it("認証済みでセーブデータがない場合はtrueを返す", async () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: "user_123",
      });

      // loadSaveDataがnullを返す（セーブデータなし）
      mockLoadSaveData.mockResolvedValue(null);

      mockUseSaveData.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        loadSaveData: mockLoadSaveData,
      });

      const { result } = renderHook(() => useAuthState());

      // loadSaveDataが完了するまで待つ
      await waitFor(() => {
        expect(result.current.needsInitialization).toBe(true);
      });
    });

    it("セーブデータがある場合はfalseを返す", async () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: "user_123",
      });

      mockLoadSaveData.mockResolvedValue({
        id: "player_1",
        position: { mapId: "map-001", x: 5, y: 5 },
        party: { ghosts: [] },
        inventory: { items: [] },
      });

      mockUseSaveData.mockReturnValue({
        data: {
          id: "player_1",
          position: { mapId: "map-001", x: 5, y: 5 },
          party: { ghosts: [] },
          inventory: { items: [] },
        },
        loading: false,
        error: null,
        loadSaveData: mockLoadSaveData,
      });

      const { result } = renderHook(() => useAuthState());

      await waitFor(() => {
        expect(result.current.needsInitialization).toBe(false);
      });
    });

    it("読み込み中はfalseを返す", () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: "user_123",
      });

      mockUseSaveData.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        loadSaveData: mockLoadSaveData,
      });

      const { result } = renderHook(() => useAuthState());

      expect(result.current.needsInitialization).toBe(false);
    });
  });
});
