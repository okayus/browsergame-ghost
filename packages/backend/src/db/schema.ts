import { relations, sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ===================
// マスタデータテーブル
// ===================

/**
 * ゴースト種族マスタ
 */
export const ghostSpecies = sqliteTable("ghost_species", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // fire, water, grass, electric, ghost, normal
  description: text("description"),
  rarity: text("rarity").notNull(), // common, uncommon, rare, legendary
  baseHp: integer("base_hp").notNull(),
  baseAttack: integer("base_attack").notNull(),
  baseDefense: integer("base_defense").notNull(),
  baseSpeed: integer("base_speed").notNull(),
});

/**
 * 技マスタ
 */
export const moves = sqliteTable("moves", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  power: integer("power").notNull(),
  accuracy: integer("accuracy").notNull(),
  pp: integer("pp").notNull(),
  description: text("description"),
});

/**
 * 習得可能技（種族と技の多対多リレーション）
 */
export const learnableMoves = sqliteTable(
  "learnable_moves",
  {
    speciesId: text("species_id")
      .notNull()
      .references(() => ghostSpecies.id),
    moveId: text("move_id")
      .notNull()
      .references(() => moves.id),
    level: integer("level").notNull(),
  },
  (table) => [primaryKey({ columns: [table.speciesId, table.moveId] })],
);

/**
 * アイテムマスタ
 */
export const items = sqliteTable("items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // healing, capture, other
  description: text("description"),
  effectValue: integer("effect_value").notNull(),
  price: integer("price").notNull().default(0),
});

// ===================
// プレイヤーデータテーブル
// ===================

/**
 * プレイヤー
 */
export const players = sqliteTable("players", {
  id: text("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  name: text("name").notNull(),
  mapId: text("map_id").notNull().default("map-001"),
  x: integer("x").notNull().default(5),
  y: integer("y").notNull().default(5),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

/**
 * プレイヤー所持ゴースト
 */
export const playerGhosts = sqliteTable("player_ghosts", {
  id: text("id").primaryKey(),
  playerId: text("player_id")
    .notNull()
    .references(() => players.id),
  speciesId: text("species_id")
    .notNull()
    .references(() => ghostSpecies.id),
  nickname: text("nickname"),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  currentHp: integer("current_hp").notNull(),
  maxHp: integer("max_hp").notNull(),
  statHp: integer("stat_hp").notNull(),
  statAttack: integer("stat_attack").notNull(),
  statDefense: integer("stat_defense").notNull(),
  statSpeed: integer("stat_speed").notNull(),
  partyOrder: integer("party_order"), // NULL = ボックス内、0-5 = パーティ内の順番
});

/**
 * プレイヤーゴーストの技
 */
export const playerGhostMoves = sqliteTable(
  "player_ghost_moves",
  {
    playerGhostId: text("player_ghost_id")
      .notNull()
      .references(() => playerGhosts.id),
    moveId: text("move_id")
      .notNull()
      .references(() => moves.id),
    slot: integer("slot").notNull(), // 0-3
    currentPp: integer("current_pp").notNull(),
    maxPp: integer("max_pp").notNull(),
  },
  (table) => [primaryKey({ columns: [table.playerGhostId, table.slot] })],
);

/**
 * プレイヤー所持アイテム
 */
export const playerItems = sqliteTable(
  "player_items",
  {
    playerId: text("player_id")
      .notNull()
      .references(() => players.id),
    itemId: text("item_id")
      .notNull()
      .references(() => items.id),
    quantity: integer("quantity").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.playerId, table.itemId] })],
);

// ===================
// リレーション定義
// ===================

export const ghostSpeciesRelations = relations(ghostSpecies, ({ many }) => ({
  learnableMoves: many(learnableMoves),
  playerGhosts: many(playerGhosts),
}));

export const movesRelations = relations(moves, ({ many }) => ({
  learnableMoves: many(learnableMoves),
  playerGhostMoves: many(playerGhostMoves),
}));

export const learnableMovesRelations = relations(learnableMoves, ({ one }) => ({
  species: one(ghostSpecies, {
    fields: [learnableMoves.speciesId],
    references: [ghostSpecies.id],
  }),
  move: one(moves, {
    fields: [learnableMoves.moveId],
    references: [moves.id],
  }),
}));

export const itemsRelations = relations(items, ({ many }) => ({
  playerItems: many(playerItems),
}));

export const playersRelations = relations(players, ({ many }) => ({
  ghosts: many(playerGhosts),
  items: many(playerItems),
}));

export const playerGhostsRelations = relations(playerGhosts, ({ one, many }) => ({
  player: one(players, {
    fields: [playerGhosts.playerId],
    references: [players.id],
  }),
  species: one(ghostSpecies, {
    fields: [playerGhosts.speciesId],
    references: [ghostSpecies.id],
  }),
  moves: many(playerGhostMoves),
}));

export const playerGhostMovesRelations = relations(playerGhostMoves, ({ one }) => ({
  playerGhost: one(playerGhosts, {
    fields: [playerGhostMoves.playerGhostId],
    references: [playerGhosts.id],
  }),
  move: one(moves, {
    fields: [playerGhostMoves.moveId],
    references: [moves.id],
  }),
}));

export const playerItemsRelations = relations(playerItems, ({ one }) => ({
  player: one(players, {
    fields: [playerItems.playerId],
    references: [players.id],
  }),
  item: one(items, {
    fields: [playerItems.itemId],
    references: [items.id],
  }),
}));

// ===================
// 型定義エクスポート
// ===================

export type GhostSpeciesRow = typeof ghostSpecies.$inferSelect;
export type NewGhostSpeciesRow = typeof ghostSpecies.$inferInsert;

export type MoveRow = typeof moves.$inferSelect;
export type NewMoveRow = typeof moves.$inferInsert;

export type LearnableMoveRow = typeof learnableMoves.$inferSelect;
export type NewLearnableMoveRow = typeof learnableMoves.$inferInsert;

export type ItemRow = typeof items.$inferSelect;
export type NewItemRow = typeof items.$inferInsert;

export type PlayerRow = typeof players.$inferSelect;
export type NewPlayerRow = typeof players.$inferInsert;

export type PlayerGhostRow = typeof playerGhosts.$inferSelect;
export type NewPlayerGhostRow = typeof playerGhosts.$inferInsert;

export type PlayerGhostMoveRow = typeof playerGhostMoves.$inferSelect;
export type NewPlayerGhostMoveRow = typeof playerGhostMoves.$inferInsert;

export type PlayerItemRow = typeof playerItems.$inferSelect;
export type NewPlayerItemRow = typeof playerItems.$inferInsert;
