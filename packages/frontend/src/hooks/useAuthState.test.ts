import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Clerk useAuth hook mock
const mockUseAuth = vi.fn();
vi.mock("@clerk/clerk-react", () => ({
	useAuth: () => mockUseAuth(),
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

		it("認証済みの場合、isAuthenticatedがtrueでauthenticated画面を表示", () => {
			mockUseAuth.mockReturnValue({
				isLoaded: true,
				isSignedIn: true,
				userId: "user_123",
			});

			const { result } = renderHook(() => useAuthState());

			expect(result.current.state.isAuthenticated).toBe(true);
			expect(result.current.state.currentScreen).toBe("authenticated");
		});
	});

	describe("画面遷移", () => {
		it("loading -> welcome: 認証読み込み完了後、未認証ならwelcome画面", () => {
			// 最初は読み込み中
			mockUseAuth.mockReturnValue({
				isLoaded: false,
				isSignedIn: false,
				userId: null,
			});

			const { result, rerender } = renderHook(() => useAuthState());
			expect(result.current.state.currentScreen).toBe("loading");

			// 読み込み完了（未認証）
			mockUseAuth.mockReturnValue({
				isLoaded: true,
				isSignedIn: false,
				userId: null,
			});

			rerender();

			expect(result.current.state.currentScreen).toBe("welcome");
		});

		it("loading -> authenticated: 認証読み込み完了後、認証済みならauthenticated画面", () => {
			// 最初は読み込み中
			mockUseAuth.mockReturnValue({
				isLoaded: false,
				isSignedIn: false,
				userId: null,
			});

			const { result, rerender } = renderHook(() => useAuthState());
			expect(result.current.state.currentScreen).toBe("loading");

			// 読み込み完了（認証済み）
			mockUseAuth.mockReturnValue({
				isLoaded: true,
				isSignedIn: true,
				userId: "user_123",
			});

			rerender();

			expect(result.current.state.currentScreen).toBe("authenticated");
		});

		it("authenticated -> welcome: サインアウト後はwelcome画面に戻る", () => {
			// 最初は認証済み
			mockUseAuth.mockReturnValue({
				isLoaded: true,
				isSignedIn: true,
				userId: "user_123",
			});

			const { result, rerender } = renderHook(() => useAuthState());
			expect(result.current.state.currentScreen).toBe("authenticated");

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
	});

	describe("状態の派生", () => {
		it("isAuthenticated は isLoaded && isSignedIn で決まる", () => {
			// 読み込み中は false
			mockUseAuth.mockReturnValue({
				isLoaded: false,
				isSignedIn: true,
				userId: "user_123",
			});

			const { result, rerender } = renderHook(() => useAuthState());
			expect(result.current.state.isAuthenticated).toBe(false);

			// 読み込み完了 + サインイン済みで true
			mockUseAuth.mockReturnValue({
				isLoaded: true,
				isSignedIn: true,
				userId: "user_123",
			});

			rerender();
			expect(result.current.state.isAuthenticated).toBe(true);
		});

		it("isAuthLoading は !isLoaded で決まる", () => {
			mockUseAuth.mockReturnValue({
				isLoaded: false,
				isSignedIn: false,
				userId: null,
			});

			const { result, rerender } = renderHook(() => useAuthState());
			expect(result.current.state.isAuthLoading).toBe(true);

			mockUseAuth.mockReturnValue({
				isLoaded: true,
				isSignedIn: false,
				userId: null,
			});

			rerender();
			expect(result.current.state.isAuthLoading).toBe(false);
		});
	});
});
