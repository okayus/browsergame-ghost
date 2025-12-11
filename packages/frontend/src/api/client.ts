import { hc } from "hono/client";
import type { AppType } from "../../../backend/src/index";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * 認証なしのAPIクライアントを作成
 */
export function createApiClient() {
  return hc<AppType>(API_BASE_URL);
}

/**
 * 認証付きのAPIクライアントを作成
 * @param token - Clerkから取得した認証トークン
 */
export function createAuthenticatedApiClient(token: string | null) {
  return hc<AppType>(API_BASE_URL, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export type ApiClient = ReturnType<typeof createApiClient>;
