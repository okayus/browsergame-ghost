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
const mockInitializeNewPlayer = vi.fn();
const mockRetry = vi.fn();

const createMockAuthState = (overrides: Partial<AuthState> = {}): AuthState => ({
  isAuthenticated: false,
  isAuthLoading: false,
  currentScreen: "welcome",
  isDataLoaded: false,
  error: null,
  ...overrides,
});

vi.mock("./hooks/useAuthState", () => ({
  useAuthState: vi.fn(() => ({
    state: createMockAuthState(),
    needsInitialization: false,
    initializeNewPlayer: mockInitializeNewPlayer,
    retry: mockRetry,
    saveData: null,
    saving: false,
    hasPendingCache: false,
    lastSavedAt: null,
  })),
}));

// Mock useSaveData
vi.mock("./api", () => ({
  useSaveData: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
}));

// Mock useGameState
vi.mock("./hooks/useGameState", () => ({
  useGameState: vi.fn(() => ({
    state: {
      currentScreen: "map",
      party: [],
      inventory: {},
      isLoaded: false,
    },
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

// Import mocked modules for control
import { useAuthState } from "./hooks/useAuthState";

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ヘルパー関数: useAuthStateのモック値を作成
  const createMockUseAuthStateReturn = (
    stateOverrides: Partial<AuthState> = {},
    overrides: {
      needsInitialization?: boolean;
      saveData?: ReturnType<typeof useAuthState>["saveData"];
      saving?: boolean;
      hasPendingCache?: boolean;
      lastSavedAt?: Date | null;
    } = {},
  ) => ({
    state: createMockAuthState(stateOverrides),
    needsInitialization: overrides.needsInitialization ?? false,
    initializeNewPlayer: mockInitializeNewPlayer,
    retry: mockRetry,
    saveData: overrides.saveData ?? null,
    saving: overrides.saving ?? false,
    hasPendingCache: overrides.hasPendingCache ?? false,
    lastSavedAt: overrides.lastSavedAt ?? null,
  });

  describe("ウェルカム画面", () => {
    it("authStateがwelcomeの時、WelcomeScreenが表示される", () => {
      vi.mocked(useAuthState).mockReturnValue(
        createMockUseAuthStateReturn({ currentScreen: "welcome" }),
      );

      render(<App />);
      expect(screen.getByTestId("welcome-screen")).toBeInTheDocument();
      expect(screen.getByText("Ghost Game")).toBeInTheDocument();
    });
  });

  describe("ローディング画面", () => {
    it("authStateがloadingの時、LoadingScreenが表示される", () => {
      vi.mocked(useAuthState).mockReturnValue(
        createMockUseAuthStateReturn({ currentScreen: "loading", isAuthLoading: true }),
      );

      render(<App />);
      expect(screen.getByTestId("loading-screen")).toBeInTheDocument();
      expect(screen.getByText("ゲームデータを読み込み中...")).toBeInTheDocument();
    });
  });

  describe("エラー画面", () => {
    it("authStateがerrorの時、ErrorScreenが表示される", () => {
      vi.mocked(useAuthState).mockReturnValue(
        createMockUseAuthStateReturn({
          currentScreen: "error",
          error: "テストエラー",
          isAuthenticated: true,
        }),
      );

      render(<App />);
      expect(screen.getByTestId("error-screen")).toBeInTheDocument();
      expect(screen.getByText("テストエラー")).toBeInTheDocument();
    });
  });

  describe("ゲーム画面", () => {
    it("authStateがgameの時、GameContainerが表示される", () => {
      vi.mocked(useAuthState).mockReturnValue(
        createMockUseAuthStateReturn({
          currentScreen: "game",
          isAuthenticated: true,
          isDataLoaded: true,
        }),
      );

      render(<App />);
      expect(screen.getByTestId("game-container")).toBeInTheDocument();
    });
  });

  describe("デフォルト画面", () => {
    it("authStateが不明な状態の時、LoadingScreenが表示される", () => {
      vi.mocked(useAuthState).mockReturnValue(
        createMockUseAuthStateReturn({ currentScreen: "unknown" as "loading" }),
      );

      render(<App />);
      expect(screen.getByTestId("loading-screen")).toBeInTheDocument();
    });
  });

  describe("新規プレイヤー初期化", () => {
    it("needsInitializationがtrueの時、initializeNewPlayerが呼ばれる", () => {
      vi.mocked(useAuthState).mockReturnValue(
        createMockUseAuthStateReturn(
          { currentScreen: "loading", isAuthenticated: true },
          { needsInitialization: true },
        ),
      );

      render(<App />);
      expect(mockInitializeNewPlayer).toHaveBeenCalled();
    });
  });
});
