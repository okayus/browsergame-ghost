import { desc } from "drizzle-orm";
import type { Context } from "hono";
import type { DB } from "../db";
import { tasks } from "../db/schema";

export const getTaskList = async (db: DB, c: Context<{ Bindings: Env }>) => {
  const allTasks = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  return c.json({ tasks: allTasks }, 200);
};
