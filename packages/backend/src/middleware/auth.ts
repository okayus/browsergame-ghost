import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import type { Context, MiddlewareHandler, Next } from "hono";

/**
 * Clerk認証ミドルウェア
 * JWTトークンを検証し、認証情報をコンテキストに設定する
 */
export const authMiddleware = (): MiddlewareHandler => {
  return clerkMiddleware();
};

/**
 * 認証必須ミドルウェア
 * 認証されていない場合は401エラーを返す
 */
export const requireAuth = (): MiddlewareHandler => {
  return async (c: Context, next: Next) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    await next();
  };
};

/**
 * 認証情報を取得するヘルパー
 */
export const getAuthInfo = (c: Context): { userId: string | null } | null => {
  const auth = getAuth(c);
  if (!auth) return null;
  return { userId: auth.userId };
};
