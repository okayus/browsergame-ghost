import { useAuth } from "@clerk/clerk-react";
import { useMemo } from "react";

/**
 * アプリの表示画面タイプ
 */
export type AppScreen = "welcome" | "loading" | "authenticated";

/**
 * 認証状態
 */
export interface AuthState {
	/** 認証済みかどうか */
	isAuthenticated: boolean;
	/** 認証読み込み中 */
	isAuthLoading: boolean;
	/** 現在表示すべき画面 */
	currentScreen: AppScreen;
}

/**
 * 認証状態を管理するシンプルなフック
 *
 * - Clerk認証状態を監視し、適切な画面を決定
 * - データ取得はTanStack Queryに委譲（useSaveDataQuery）
 *
 * 画面遷移:
 * 1. loading → Clerkの認証状態を読み込み中
 * 2. welcome → 未認証（サインイン画面を表示）
 * 3. authenticated → 認証済み（ゲームコンテンツを表示）
 */
export function useAuthState() {
	const { isLoaded, isSignedIn } = useAuth();

	// 認証状態から派生する状態
	const isAuthenticated = isLoaded && isSignedIn === true;
	const isAuthLoading = !isLoaded;

	// 現在の画面を決定
	const currentScreen = useMemo((): AppScreen => {
		// 認証読み込み中
		if (!isLoaded) {
			return "loading";
		}

		// 未認証
		if (!isSignedIn) {
			return "welcome";
		}

		// 認証済み（データ取得はSuspenseに委譲）
		return "authenticated";
	}, [isLoaded, isSignedIn]);

	// 状態オブジェクト
	const state: AuthState = {
		isAuthenticated,
		isAuthLoading,
		currentScreen,
	};

	return { state };
}
