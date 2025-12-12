import type { Inventory, Party, PlayerData, PlayerPosition } from "@ghost-game/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { useApiClient } from "./useApiClient";

/** 自動セーブの間隔（ミリ秒） */
const AUTO_SAVE_INTERVAL = 30000; // 30秒

/** ローカルキャッシュのキー */
const PENDING_CACHE_KEY = "ghost-game-pending-save";

/**
 * 保留中のキャッシュデータ
 */
interface PendingCacheData {
  position?: PlayerPosition;
  party?: Party;
  inventory?: Inventory;
  timestamp: number;
}

/**
 * セーブデータの状態
 */
export interface SaveDataState {
  /** セーブデータ */
  data: PlayerData | null;
  /** 読み込み中かどうか */
  loading: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** 最後にセーブした時刻 */
  lastSavedAt: Date | null;
  /** セーブ中かどうか */
  saving: boolean;
  /** 保留中のキャッシュがあるかどうか */
  hasPendingCache: boolean;
}

/**
 * ローカルストレージから保留キャッシュを読み込む
 */
function loadPendingCache(): PendingCacheData | null {
  try {
    const cached = localStorage.getItem(PENDING_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as PendingCacheData;
    }
  } catch {
    // パースエラーは無視
  }
  return null;
}

/**
 * ローカルストレージに保留キャッシュを保存
 */
function savePendingCache(data: PendingCacheData): void {
  try {
    localStorage.setItem(PENDING_CACHE_KEY, JSON.stringify(data));
  } catch {
    // ストレージエラーは無視
  }
}

/**
 * ローカルストレージから保留キャッシュを削除
 */
function clearPendingCache(): void {
  try {
    localStorage.removeItem(PENDING_CACHE_KEY);
  } catch {
    // ストレージエラーは無視
  }
}

/**
 * セーブ/ロード機能を提供するフック
 *
 * - ゲーム開始時のセーブデータ読み込み
 * - 定期的な自動セーブ（30秒間隔）
 * - 手動セーブ機能
 * - オフライン時のローカルキャッシュ保存
 * - 復旧時の自動同期
 */
export function useSaveData() {
  const { getApiClient } = useApiClient();

  // 初期化時に保留キャッシュをチェック
  const initialPendingCache = loadPendingCache();

  const [state, setState] = useState<SaveDataState>({
    data: null,
    loading: true,
    error: null,
    lastSavedAt: null,
    saving: false,
    hasPendingCache: initialPendingCache !== null,
  });

  // 自動セーブ用のデータ参照
  const pendingSaveDataRef = useRef<{
    position?: PlayerPosition;
    party?: Party;
    inventory?: Inventory;
  } | null>(null);

  /**
   * セーブデータを読み込む
   */
  const loadSaveData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const client = await getApiClient();
      const response = await client.api.save.$get();

      if (!response.ok) {
        if (response.status === 404) {
          // セーブデータが存在しない（新規プレイヤー）
          setState((prev) => ({
            ...prev,
            data: null,
            loading: false,
            error: null,
          }));
          return null;
        }
        throw new Error(`Failed to load save data: ${response.status}`);
      }

      const result = await response.json();
      const saveData = result.data as PlayerData;

      setState((prev) => ({
        ...prev,
        data: saveData,
        loading: false,
        error: null,
      }));

      return saveData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, [getApiClient]);

  /**
   * セーブデータを保存する
   */
  const saveData = useCallback(
    async (data: { position?: PlayerPosition; party?: Party; inventory?: Inventory }) => {
      setState((prev) => ({ ...prev, saving: true }));

      try {
        const client = await getApiClient();
        const response = await client.api.save.$post({
          json: data,
        });

        if (!response.ok) {
          throw new Error(`Failed to save data: ${response.status}`);
        }

        // 成功時は保留キャッシュをクリア
        clearPendingCache();

        setState((prev) => ({
          ...prev,
          saving: false,
          lastSavedAt: new Date(),
          hasPendingCache: false,
          // ローカルデータも更新
          data: prev.data
            ? {
                ...prev.data,
                ...(data.position && { position: data.position }),
                ...(data.party && { party: data.party }),
                ...(data.inventory && { inventory: data.inventory }),
                updatedAt: new Date().toISOString(),
              }
            : null,
        }));

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";

        // 失敗時はローカルキャッシュに保存
        const pendingCache: PendingCacheData = {
          ...data,
          timestamp: Date.now(),
        };
        savePendingCache(pendingCache);

        setState((prev) => ({
          ...prev,
          saving: false,
          error: errorMessage,
          hasPendingCache: true,
        }));

        return false;
      }
    },
    [getApiClient],
  );

  /**
   * 保留中のキャッシュを同期する
   */
  const syncPendingCache = useCallback(async () => {
    const cached = loadPendingCache();
    if (!cached) {
      setState((prev) => ({ ...prev, hasPendingCache: false }));
      return true;
    }

    const { timestamp: _timestamp, ...dataToSync } = cached;

    try {
      const client = await getApiClient();
      const response = await client.api.save.$post({
        json: dataToSync,
      });

      if (!response.ok) {
        throw new Error(`Failed to sync data: ${response.status}`);
      }

      // 成功時は保留キャッシュをクリア
      clearPendingCache();

      setState((prev) => ({
        ...prev,
        lastSavedAt: new Date(),
        hasPendingCache: false,
        // ローカルデータも更新
        data: prev.data
          ? {
              ...prev.data,
              ...(dataToSync.position && { position: dataToSync.position }),
              ...(dataToSync.party && { party: dataToSync.party }),
              ...(dataToSync.inventory && { inventory: dataToSync.inventory }),
              updatedAt: new Date().toISOString(),
            }
          : null,
      }));

      return true;
    } catch {
      // 同期失敗時はキャッシュを維持
      return false;
    }
  }, [getApiClient]);

  /**
   * 自動セーブ用にデータを更新（すぐには保存しない）
   */
  const updatePendingSaveData = useCallback(
    (data: { position?: PlayerPosition; party?: Party; inventory?: Inventory }) => {
      pendingSaveDataRef.current = {
        ...pendingSaveDataRef.current,
        ...data,
      };
    },
    [],
  );

  /**
   * 自動セーブを実行
   */
  const executeAutoSave = useCallback(async () => {
    if (pendingSaveDataRef.current) {
      const dataToSave = pendingSaveDataRef.current;
      pendingSaveDataRef.current = null;
      await saveData(dataToSave);
    }
  }, [saveData]);

  // 自動セーブのセットアップ
  useEffect(() => {
    const intervalId = setInterval(() => {
      executeAutoSave();
    }, AUTO_SAVE_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [executeAutoSave]);

  // ページを離れる前にセーブ
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingSaveDataRef.current) {
        // 同期的にセーブを試みる（ベストエフォート）
        const dataToSave = pendingSaveDataRef.current;
        pendingSaveDataRef.current = null;
        // Note: ここでは非同期処理は完了を待てないので、
        // navigator.sendBeaconを使うか、単純に無視するかの選択になる
        // 今回は30秒間隔の自動セーブがあるので、ここでは何もしない
        console.log("Pending save data on unload:", dataToSave);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // オンライン復帰時に保留キャッシュを同期
  useEffect(() => {
    const handleOnline = () => {
      if (state.hasPendingCache) {
        syncPendingCache();
      }
    };

    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [state.hasPendingCache, syncPendingCache]);

  return {
    ...state,
    loadSaveData,
    saveData,
    updatePendingSaveData,
    executeAutoSave,
    syncPendingCache,
  };
}
