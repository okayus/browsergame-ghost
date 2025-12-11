import { useAuth } from "@clerk/clerk-react";
import { useCallback } from "react";
import { createAuthenticatedApiClient } from "./client";

/**
 * 認証付きAPIクライアントを提供するフック
 *
 * @returns getApiClient - 認証トークン付きのAPIクライアントを取得する関数
 */
export function useApiClient() {
  const { getToken } = useAuth();

  const getApiClient = useCallback(async () => {
    const token = await getToken();
    return createAuthenticatedApiClient(token);
  }, [getToken]);

  return { getApiClient };
}
