import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	useAutoSave,
	useInitializePlayerMutation,
	useSaveDataMutation,
} from "./useSaveData";

// Mock useApiClient
const mockGetApiClient = vi.fn();
vi.mock("./useApiClient", () => ({
	useApiClient: () => ({
		getApiClient: mockGetApiClient,
	}),
}));

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: vi.fn((key: string) => store[key] || null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value;
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			store = {};
		}),
	};
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Sample save data
const mockSaveData = {
	id: "player-1",
	clerkUserId: "clerk-123",
	name: "Test Player",
	party: {
		ghosts: [
			{
				id: "ghost-1",
				speciesId: "species-1",
				nickname: "Test Ghost",
				level: 5,
				experience: 0,
				currentHp: 50,
				maxHp: 50,
				stats: { attack: 10, defense: 10, speed: 10 },
				moves: [],
			},
		],
	},
	inventory: { items: [] },
	position: { x: 5, y: 5, mapId: "map-1" },
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-01T00:00:00Z",
};

// QueryClient wrapper for testing hooks
function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
			mutations: {
				retry: false,
			},
		},
	});
	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}

describe("useSaveData hooks", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorageMock.clear();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("useSaveDataMutation", () => {
		it("バックエンドにセーブデータを保存する", async () => {
			const mockPost = vi.fn().mockResolvedValue({ ok: true });
			mockGetApiClient.mockResolvedValue({
				api: {
					save: {
						$post: mockPost,
					},
				},
			});

			const { result } = renderHook(() => useSaveDataMutation(), {
				wrapper: createWrapper(),
			});

			const dataToSave = { position: { x: 10, y: 10, mapId: "map-1" } };
			await act(async () => {
				await result.current.mutateAsync(dataToSave);
			});

			expect(mockPost).toHaveBeenCalledWith({ json: dataToSave });
		});

		it("保存失敗時にローカルキャッシュに保存する", async () => {
			const mockPost = vi.fn().mockResolvedValue({ ok: false, status: 500 });
			mockGetApiClient.mockResolvedValue({
				api: {
					save: {
						$post: mockPost,
					},
				},
			});

			const { result } = renderHook(() => useSaveDataMutation(), {
				wrapper: createWrapper(),
			});

			const dataToSave = { position: { x: 10, y: 10, mapId: "map-1" } };

			try {
				await act(async () => {
					await result.current.mutateAsync(dataToSave);
				});
			} catch {
				// エラーは想定内
			}

			// ローカルキャッシュに保存されていることを確認
			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				"ghost-game-pending-save",
				expect.any(String),
			);
		});
	});

	describe("useInitializePlayerMutation", () => {
		it("新規プレイヤーを初期化する", async () => {
			const mockInitPost = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ data: mockSaveData }),
			});
			mockGetApiClient.mockResolvedValue({
				api: {
					save: {
						initialize: {
							$post: mockInitPost,
						},
					},
				},
			});

			const { result } = renderHook(() => useInitializePlayerMutation(), {
				wrapper: createWrapper(),
			});

			await act(async () => {
				await result.current.mutateAsync();
			});

			expect(mockInitPost).toHaveBeenCalled();
		});

		it("初期化失敗時にエラーをスローする", async () => {
			const mockInitPost = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
			});
			mockGetApiClient.mockResolvedValue({
				api: {
					save: {
						initialize: {
							$post: mockInitPost,
						},
					},
				},
			});

			const { result } = renderHook(() => useInitializePlayerMutation(), {
				wrapper: createWrapper(),
			});

			await expect(
				act(async () => {
					await result.current.mutateAsync();
				}),
			).rejects.toThrow();
		});
	});

	describe("useAutoSave", () => {
		it("updatePendingSaveDataでデータを更新できる", async () => {
			const mockPost = vi.fn().mockResolvedValue({ ok: true });
			mockGetApiClient.mockResolvedValue({
				api: {
					save: {
						$post: mockPost,
					},
				},
			});

			const { result } = renderHook(() => useAutoSave(), {
				wrapper: createWrapper(),
			});

			act(() => {
				result.current.updatePendingSaveData({ position: { x: 5, y: 5, mapId: "map-1" } });
			});

			await act(async () => {
				await result.current.executeAutoSave();
			});

			expect(mockPost).toHaveBeenCalledWith({
				json: { position: { x: 5, y: 5, mapId: "map-1" } },
			});
		});

		it("30秒間隔で自動セーブが設定される", async () => {
			const mockPost = vi.fn().mockResolvedValue({ ok: true });
			mockGetApiClient.mockResolvedValue({
				api: {
					save: {
						$post: mockPost,
					},
				},
			});

			const { result } = renderHook(() => useAutoSave(), {
				wrapper: createWrapper(),
			});

			act(() => {
				result.current.updatePendingSaveData({ position: { x: 5, y: 5, mapId: "map-1" } });
			});

			// 30秒経過させてインターバルを発火
			await act(async () => {
				vi.advanceTimersByTime(30000);
				await Promise.resolve();
			});

			expect(mockPost).toHaveBeenCalled();
		});

		it("保留キャッシュを同期できる", async () => {
			// このテストはreal timersを使用（waitForのため）
			vi.useRealTimers();

			// まず保留キャッシュを設定
			const cachedData = {
				position: { x: 10, y: 10, mapId: "map-1" },
				timestamp: Date.now(),
			};
			localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData));

			const mockPost = vi.fn().mockResolvedValue({ ok: true });
			mockGetApiClient.mockResolvedValue({
				api: {
					save: {
						$post: mockPost,
					},
				},
			});

			const { result } = renderHook(() => useAutoSave(), {
				wrapper: createWrapper(),
			});

			// 初期状態で保留キャッシュがあることを確認
			expect(result.current.hasPendingCache).toBe(true);

			// 同期を実行
			await act(async () => {
				const success = await result.current.syncPendingCache();
				expect(success).toBe(true);
			});

			// キャッシュがクリアされたことを確認
			await waitFor(() => {
				expect(result.current.hasPendingCache).toBe(false);
			});
		});
	});
});
