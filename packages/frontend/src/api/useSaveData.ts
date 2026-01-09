import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import type {
	Inventory,
	Party,
	PlayerData,
	PlayerPosition,
} from "@ghost-game/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { useApiClient } from "./useApiClient";

/** 自動セーブの間隔（ミリ秒） */
const AUTO_SAVE_INTERVAL = 30000; // 30秒

/** ローカルキャッシュのキー */
const PENDING_CACHE_KEY = "ghost-game-pending-save";

/** クエリキー */
export const SAVE_DATA_QUERY_KEY = ["saveData"] as const;

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
 * セーブデータを取得するフック（Suspense対応）
 *
 * useSuspenseQueryを使用するため、親コンポーネントにSuspenseが必要。
 * 新規プレイヤーの場合はnullを返す（404レスポンス）。
 *
 * @example
 * ```tsx
 * <Suspense fallback={<Loading />}>
 *   <GameContent /> // ここで useSaveDataQuery を使用
 * </Suspense>
 * ```
 */
export function useSaveDataQuery() {
	const { getApiClient } = useApiClient();

	return useSuspenseQuery({
		queryKey: SAVE_DATA_QUERY_KEY,
		queryFn: async () => {
			const client = await getApiClient();
			const response = await client.api.save.$get();

			if (response.status === 404) {
				// セーブデータが存在しない（新規プレイヤー）
				return null;
			}

			if (!response.ok) {
				throw new Error(`Failed to load save data: ${response.status}`);
			}

			const result = await response.json();
			return result.data as PlayerData;
		},
	});
}

/**
 * セーブデータ更新用のMutationフック
 */
export function useSaveDataMutation() {
	const { getApiClient } = useApiClient();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: {
			position?: PlayerPosition;
			party?: Party;
			inventory?: Inventory;
		}) => {
			const client = await getApiClient();
			const response = await client.api.save.$post({
				json: data,
			});

			if (!response.ok) {
				throw new Error(`Failed to save data: ${response.status}`);
			}

			// 成功時は保留キャッシュをクリア
			clearPendingCache();

			return data;
		},
		onSuccess: (data) => {
			// キャッシュを更新
			queryClient.setQueryData(
				SAVE_DATA_QUERY_KEY,
				(oldData: PlayerData | null) => {
					if (!oldData) return null;
					return {
						...oldData,
						...(data.position && { position: data.position }),
						...(data.party && { party: data.party }),
						...(data.inventory && { inventory: data.inventory }),
						updatedAt: new Date().toISOString(),
					};
				},
			);
		},
		onError: (_error, data) => {
			// 失敗時はローカルキャッシュに保存
			const pendingCache: PendingCacheData = {
				...data,
				timestamp: Date.now(),
			};
			savePendingCache(pendingCache);
		},
	});
}

/**
 * 新規プレイヤー初期化用のMutationフック
 */
export function useInitializePlayerMutation() {
	const { getApiClient } = useApiClient();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const client = await getApiClient();
			const response = await client.api.save.initialize.$post();

			if (!response.ok) {
				throw new Error(`Failed to initialize player: ${response.status}`);
			}

			return response.json();
		},
		onSuccess: () => {
			// 初期化成功後、セーブデータを再取得
			queryClient.invalidateQueries({ queryKey: SAVE_DATA_QUERY_KEY });
		},
	});
}

/**
 * 自動セーブとオフライン同期を管理するフック
 *
 * - 30秒間隔の自動セーブ
 * - オンライン復帰時の保留キャッシュ同期
 * - ページ離脱前の処理
 */
export function useAutoSave() {
	const { getApiClient } = useApiClient();
	const saveMutation = useSaveDataMutation();

	// 初期化時に保留キャッシュをチェック
	const [hasPendingCache, setHasPendingCache] = useState(
		() => loadPendingCache() !== null,
	);
	const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

	// 自動セーブ用のデータ参照
	const pendingSaveDataRef = useRef<{
		position?: PlayerPosition;
		party?: Party;
		inventory?: Inventory;
	} | null>(null);

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

			try {
				await saveMutation.mutateAsync(dataToSave);
				setLastSavedAt(new Date());
				setHasPendingCache(false);
			} catch {
				setHasPendingCache(true);
			}
		}
	}, [saveMutation]);

	/**
	 * 保留中のキャッシュを同期する
	 */
	const syncPendingCache = useCallback(async () => {
		const cached = loadPendingCache();
		if (!cached) {
			setHasPendingCache(false);
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
			setLastSavedAt(new Date());
			setHasPendingCache(false);

			return true;
		} catch {
			// 同期失敗時はキャッシュを維持
			return false;
		}
	}, [getApiClient]);

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
			if (hasPendingCache) {
				syncPendingCache();
			}
		};

		window.addEventListener("online", handleOnline);
		return () => {
			window.removeEventListener("online", handleOnline);
		};
	}, [hasPendingCache, syncPendingCache]);

	return {
		saving: saveMutation.isPending,
		hasPendingCache,
		lastSavedAt,
		updatePendingSaveData,
		executeAutoSave,
		syncPendingCache,
	};
}
