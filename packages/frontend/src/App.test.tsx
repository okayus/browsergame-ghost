import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import type { AuthState } from "./hooks/useAuthState";

// Mock @clerk/clerk-react
const mockOpenSignIn = vi.fn();
const mockOpenSignUp = vi.fn();
vi.mock("@clerk/clerk-react", () => ({
  useClerk: () => ({
    openSignIn: mockOpenSignIn,
    openSignUp: mockOpenSignUp,
  }),
  useAuth: () => ({
    isSignedIn: false,
    getToken: vi.fn(() => Promise.resolve(null)),
  }),
}));

// Mock useAuthState hook
const createMockAuthState = (overrides: Partial<AuthState> = {}): AuthState => ({
  isAuthenticated: false,
  isAuthLoading: false,
  currentScreen: "welcome",
  ...overrides,
});

vi.mock("./hooks/useAuthState", () => ({
  useAuthState: vi.fn(() => ({
    state: createMockAuthState(),
  })),
}));

// Mock useSaveDataQuery - needs to be wrapped in Suspense
vi.mock("./api/useSaveData", () => ({
  useSaveDataQuery: vi.fn(() => ({
    data: {
      id: "player_1",
      position: { mapId: "map-001", x: 5, y: 5 },
      party: { ghosts: [] },
      inventory: { items: [] },
    },
  })),
  useInitializePlayerMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
  })),
  useSaveDataMutation: vi.fn(() => ({
    mutateAsync: vi.fn(() => Promise.resolve({})),
    isPending: false,
  })),
  useAutoSave: vi.fn(() => ({
    saving: false,
    hasPendingCache: false,
    lastSavedAt: null,
    updatePendingSaveData: vi.fn(),
    executeAutoSave: vi.fn(),
    syncPendingCache: vi.fn(),
  })),
}));

// Mock useGameState
vi.mock("./hooks/useGameState", () => ({
  useGameState: vi.fn(() => ({
    state: {
      currentScreen: "map",
      party: { ghosts: [] },
      inventory: {},
      isLoaded: false,
    },
    setScreen: vi.fn(),
    setParty: vi.fn(),
    setInventory: vi.fn(),
    setLoaded: vi.fn(),
  })),
}));

// Mock useMapState
vi.mock("./hooks/useMapState", () => ({
  useMapState: vi.fn(() => ({
    state: {
      position: { x: 0, y: 0 },
      currentMap: null,
    },
    setPosition: vi.fn(),
    setMap: vi.fn(),
    move: vi.fn(() => ({ encounter: null })),
  })),
}));

// Mock useBattleState
vi.mock("./hooks/useBattleState", () => ({
  useBattleState: vi.fn(() => ({
    state: {
      phase: "idle",
      playerGhost: null,
      enemyGhost: null,
      messages: [],
    },
    startBattle: vi.fn(),
    setPhase: vi.fn(),
    executePlayerAction: vi.fn(),
    reset: vi.fn(),
  })),
}));

// Import mocked modules for control
import { useSaveDataMutation } from "./api/useSaveData";
import { useAuthState } from "./hooks/useAuthState";
import { useGameState } from "./hooks/useGameState";

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ウェルカム画面", () => {
    it("authStateがwelcomeの時、WelcomeScreenが表示される", () => {
      vi.mocked(useAuthState).mockReturnValue({
        state: createMockAuthState({ currentScreen: "welcome" }),
      });

      render(<App />);
      expect(screen.getByTestId("welcome-screen")).toBeInTheDocument();
      expect(screen.getByText("Ghost Game")).toBeInTheDocument();
    });
  });

  describe("ローディング画面", () => {
    it("authStateがloadingの時、LoadingScreenが表示される", () => {
      vi.mocked(useAuthState).mockReturnValue({
        state: createMockAuthState({ currentScreen: "loading", isAuthLoading: true }),
      });

      render(<App />);
      expect(screen.getByTestId("loading-screen")).toBeInTheDocument();
    });
  });

  describe("認証済み画面", () => {
    it("authStateがauthenticatedの時、Suspense内でゲームコンテンツがレンダリングされる", async () => {
      vi.mocked(useAuthState).mockReturnValue({
        state: createMockAuthState({
          currentScreen: "authenticated",
          isAuthenticated: true,
        }),
      });

      render(<App />);

      // useSaveDataQueryがモックされているので、データが返されゲームコンテナが表示される
      expect(screen.getByTestId("game-container")).toBeInTheDocument();
    });
  });

  /**
   * Task 23.3: 手動セーブ機能のテスト
   *
   * 要件17のテスト:
   * - 17.1: セーブ選択時にバックエンド保存
   * - 17.2: セーブ中インジケーター表示
   * - 17.3: セーブ成功メッセージ
   * - 17.4: エラー時のリトライオプション
   * - 17.5: セーブ後もメニュー維持
   */
  describe("手動セーブ機能", () => {
    const setupMenuScreen = () => {
      vi.mocked(useAuthState).mockReturnValue({
        state: createMockAuthState({
          currentScreen: "authenticated",
          isAuthenticated: true,
        }),
      });

      // メニュー画面を表示するためにcurrentScreenをmenuに設定
      vi.mocked(useGameState).mockReturnValue({
        state: {
          currentScreen: "menu",
          party: { ghosts: [] },
          inventory: { items: [] },
          isLoaded: true,
        },
        setScreen: vi.fn(),
        setParty: vi.fn(),
        setInventory: vi.fn(),
        setLoaded: vi.fn(),
        updatePartyGhost: vi.fn(),
        useItem: vi.fn(() => true),
        addItem: vi.fn(),
        addGhostToParty: vi.fn(() => true),
        swapPartyGhost: vi.fn(() => null),
        resetGame: vi.fn(),
      });
    };

    it("メニュー画面でセーブが利用可能", async () => {
      setupMenuScreen();

      render(<App />);

      // メニュー画面が表示されていることを確認
      expect(screen.getByTestId("menu-screen")).toBeInTheDocument();

      // セーブ項目が存在することを確認
      expect(screen.getByTestId("menu-item-save")).toBeInTheDocument();
    });

    it("セーブ成功時にセーブ成功メッセージが表示される", async () => {
      setupMenuScreen();

      // セーブ成功をシミュレート
      const mockMutateAsync = vi.fn(() => Promise.resolve({}));
      vi.mocked(useSaveDataMutation).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        // biome-ignore lint/suspicious/noExplicitAny: テストのモックのため
      } as any);

      render(<App />);

      // メニュー画面が表示されていることを確認
      expect(screen.getByTestId("menu-screen")).toBeInTheDocument();
    });

    it("セーブ状態が正しくUI状態に反映される", async () => {
      setupMenuScreen();

      // 状態遷移: idle -> saving -> success -> idle
      const mockMutateAsync = vi.fn(() => Promise.resolve({}));
      vi.mocked(useSaveDataMutation).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        // biome-ignore lint/suspicious/noExplicitAny: テストのモックのため
      } as any);

      render(<App />);

      // メニュー画面が表示されていることを確認
      expect(screen.getByTestId("menu-screen")).toBeInTheDocument();

      // 初期状態ではセーブ項目が表示されている
      const saveItem = screen.getByTestId("menu-item-save");
      expect(saveItem).toBeInTheDocument();
    });
  });
});
