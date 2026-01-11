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
import { useAuthState } from "./hooks/useAuthState";

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
});
