import { InventorySchema, PartySchema, PlayerPositionSchema } from "@ghost-game/shared";
import { zValidator } from "@hono/zod-validator";
import { type Context, Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { createDB } from "./db";
import { ghostSpecies, moves } from "./db/schema";
import { authMiddleware, getAuthInfo, requireAuth } from "./middleware/auth";
import { getPlayerSaveData, savePlayerData } from "./services/save";

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
    return c.json({ message: "Hello, Ghost Game API!" });
  })
  // マスタデータ取得API
  .get("/api/master/ghosts", async (c: Context<{ Bindings: Env }>) => {
    const db = createDB(c.env.DB);
    const allGhosts = await db.select().from(ghostSpecies);
    return c.json({ ghosts: allGhosts });
  })
  .get("/api/master/moves", async (c: Context<{ Bindings: Env }>) => {
    const db = createDB(c.env.DB);
    const allMoves = await db.select().from(moves);
    return c.json({ moves: allMoves });
  })
  // 認証情報を返すエンドポイント
  .get("/api/me", (c) => {
    const auth = getAuthInfo(c);
    if (!auth?.userId) {
      return c.json({ authenticated: false }, 200);
    }
    return c.json({
      authenticated: true,
      userId: auth.userId,
    });
  })
  // セーブデータAPI
  .get("/api/save", requireAuth(), async (c: Context<{ Bindings: Env }>) => {
    const auth = getAuthInfo(c);
    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const db = createDB(c.env.DB);
    const saveData = await getPlayerSaveData(db, auth.userId);

    if (!saveData) {
      return c.json({ error: "Save data not found" }, 404);
    }

    return c.json({ data: saveData });
  })
  .post(
    "/api/save",
    requireAuth(),
    zValidator(
      "json",
      z.object({
        position: PlayerPositionSchema.optional(),
        party: PartySchema.optional(),
        inventory: InventorySchema.optional(),
      }),
    ),
    async (c: Context<{ Bindings: Env }>) => {
      const auth = getAuthInfo(c);
      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const body = c.req.valid("json" as never);
      const db = createDB(c.env.DB);

      const success = await savePlayerData(db, auth.userId, body);

      if (!success) {
        return c.json({ error: "Failed to save data" }, 500);
      }

      return c.json({ success: true });
    },
  );

export type AppType = typeof app;
export default app;
