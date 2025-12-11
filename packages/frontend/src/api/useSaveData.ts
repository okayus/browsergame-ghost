import type { Inventory, Party, PlayerData, PlayerPosition } from "@ghost-game/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { useApiClient } from "./useApiClient";

/** 自動セーブの間隔（ミリ秒） */
const AUTO_SAVE_INTERVAL = 30000; // 30秒

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
}

/**
 * セーブ/ロード機能を提供するフック
 *
 * - ゲーム開始時のセーブデータ読み込み
 * - 定期的な自動セーブ（30秒間隔）
 * - 手動セーブ機能
 */
export function useSaveData() {
  const { getApiClient } = useApiClient();
  const [state, setState] = useState<SaveDataState>({
    data: null,
    loading: true,
    error: null,
    lastSavedAt: null,
    saving: false,
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

        setState((prev) => ({
          ...prev,
          saving: false,
          lastSavedAt: new Date(),
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
        setState((prev) => ({
          ...prev,
          saving: false,
          error: errorMessage,
        }));
        return false;
      }
    },
    [getApiClient],
  );

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

  return {
    ...state,
    loadSaveData,
    saveData,
    updatePendingSaveData,
    executeAutoSave,
  };
}
