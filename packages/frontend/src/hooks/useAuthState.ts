import { useAuth } from "@clerk/clerk-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useApiClient } from "../api/useApiClient";
import { useSaveData } from "../api/useSaveData";

/**
 * アプリの表示画面タイプ
 */
export type AppScreen = "welcome" | "loading" | "game" | "error";

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
  /** セーブデータ読み込み済みかどうか */
  isDataLoaded: boolean;
  /** エラーメッセージ */
  error: string | null;
}

/**
 * 認証状態を管理し、アプリ画面を制御するフック
 *
 * - Clerk認証状態を監視し、適切な画面を決定
 * - 認証成功時にセーブデータ読み込みをトリガー
 * - セーブデータがない場合に新規プレイヤー初期化を実行
 * - エラー発生時のリトライ機能を提供
 */
export function useAuthState() {
  const { isLoaded, isSignedIn } = useAuth();
  const saveDataHook = useSaveData();
  const {
    data: saveData,
    loading: saveLoading,
    error: saveError,
    saving,
    hasPendingCache,
    lastSavedAt,
    loadSaveData,
  } = saveDataHook;
  const { getApiClient } = useApiClient();

  const [internalError, setInternalError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasTriedLoading, setHasTriedLoading] = useState(false);

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

    // エラー状態
    if (saveError || internalError) {
      return "error";
    }

    // セーブデータ読み込み中または初期化中
    if (saveLoading || isInitializing) {
      return "loading";
    }

    // セーブデータあり
    if (saveData) {
      return "game";
    }

    // 認証済みだがデータ読み込みが完了していない（新規プレイヤーの可能性）
    // loading表示を維持
    return "loading";
  }, [isLoaded, isSignedIn, saveError, internalError, saveLoading, isInitializing, saveData]);

  // セーブデータが読み込まれているかどうか
  const isDataLoaded = saveData !== null && !saveLoading;

  // 新規プレイヤー初期化が必要かどうか
  const needsInitialization =
    isAuthenticated && !saveLoading && saveData === null && hasTriedLoading && !saveError;

  /**
   * 新規プレイヤーを初期化
   */
  const initializeNewPlayer = useCallback(async () => {
    setIsInitializing(true);
    setInternalError(null);

    try {
      const client = await getApiClient();
      const response = await client.api.save.initialize.$post();

      if (!response.ok) {
        throw new Error(`Failed to initialize player: ${response.status}`);
      }

      // 初期化成功後、セーブデータを再読み込み
      await loadSaveData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setInternalError(errorMessage);
    } finally {
      setIsInitializing(false);
    }
  }, [getApiClient, loadSaveData]);

  /**
   * エラー発生時にリトライ
   */
  const retry = useCallback(async () => {
    setInternalError(null);
    setHasTriedLoading(false);
    await loadSaveData();
    setHasTriedLoading(true);
  }, [loadSaveData]);

  // 認証成功時にセーブデータを読み込む
  useEffect(() => {
    if (isAuthenticated && !hasTriedLoading && !saveLoading) {
      loadSaveData().then(() => {
        setHasTriedLoading(true);
      });
    }
  }, [isAuthenticated, hasTriedLoading, saveLoading, loadSaveData]);

  // サインアウト時に状態をリセット
  useEffect(() => {
    if (!isSignedIn && hasTriedLoading) {
      setHasTriedLoading(false);
      setInternalError(null);
    }
  }, [isSignedIn, hasTriedLoading]);

  // 状態オブジェクト
  const state: AuthState = {
    isAuthenticated,
    isAuthLoading,
    currentScreen,
    isDataLoaded,
    error: saveError || internalError,
  };

  return {
    state,
    needsInitialization,
    initializeNewPlayer,
    retry,
    // セーブデータ関連（App.tsxで使用）
    saveData,
    saving,
    hasPendingCache,
    lastSavedAt,
  };
}
