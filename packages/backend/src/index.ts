import { type Context, Hono } from "hono";
import { cors } from "hono/cors";
import { createDB } from "./db";
import { getTaskList } from "./handlers/taskList";
import { authMiddleware, getAuthInfo } from "./middleware/auth";

const app = new Hono<{ Bindings: Env }>()
  .use(
    "/*",
    cors({
      origin: [
        "http://localhost:5173", // Local development
        "https://ghost-game-2yd.pages.dev", // Production
      ],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }),
  )
  // Clerk認証ミドルウェアを適用（全ルートでトークン検証）
  .use("/*", authMiddleware())
  .get("/", (c) => {
    return c.json({ message: "Hello, World!" });
  })
  .get("/api/tasks", async (c: Context<{ Bindings: Env }>) => {
    const db = createDB(c.env.DB);
    return getTaskList(db, c);
  })
  // 認証情報を返すエンドポイント（テスト用）
  .get("/api/me", (c) => {
    const auth = getAuthInfo(c);
    if (!auth?.userId) {
      return c.json({ authenticated: false }, 200);
    }
    return c.json({
      authenticated: true,
      userId: auth.userId,
    });
  });

export type AppType = typeof app;
export default app;
