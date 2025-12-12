import { calculateMaxHp, calculateStats } from "@ghost-game/shared";
import { eq } from "drizzle-orm";
import type { DB } from "../db";
import {
  ghostSpecies,
  learnableMoves,
  moves,
  playerGhostMoves,
  playerGhosts,
  playerItems,
  players,
} from "../db/schema";

/**
 * 初期ゴースト設定
 */
export const STARTER_GHOST_CONFIG = {
  /** 初期ゴーストの種族ID（スピリパフ - 初心者向け） */
  speciesId: "spiritpuff",
  /** 初期ゴーストのレベル */
  level: 5,
};

/**
 * 初期アイテム
 */
export const INITIAL_ITEMS: { itemId: string; quantity: number }[] = [
  { itemId: "ghostBall", quantity: 5 },
  { itemId: "potion", quantity: 3 },
];

/**
 * 初期位置
 */
export const INITIAL_POSITION = {
  mapId: "map-001",
  x: 5,
  y: 5,
};

/**
 * 初期ゴーストを作成
 */
export function createInitialGhost(
  speciesData: {
    id: string;
    baseHp: number;
    baseAttack: number;
    baseDefense: number;
    baseSpeed: number;
  },
  learnableMovesList: { moveId: string; level: number; pp: number }[],
  level: number,
): {
  speciesId: string;
  level: number;
  experience: number;
  currentHp: number;
  maxHp: number;
  stats: { hp: number; attack: number; defense: number; speed: number };
  moves: { moveId: string; currentPP: number; maxPP: number }[];
} {
  // 能力値を計算
  const baseStats = {
    hp: speciesData.baseHp,
    attack: speciesData.baseAttack,
    defense: speciesData.baseDefense,
    speed: speciesData.baseSpeed,
  };

  const stats = calculateStats(baseStats, level);
  const maxHp = calculateMaxHp(speciesData.baseHp, level);

  // 指定レベル以下で習得可能な技を取得（最大4つ）
  const availableMoves = learnableMovesList
    .filter((move) => move.level <= level)
    .sort((a, b) => b.level - a.level) // 高レベル技優先
    .slice(0, 4)
    .map((move) => ({
      moveId: move.moveId,
      currentPP: move.pp,
      maxPP: move.pp,
    }));

  return {
    speciesId: speciesData.id,
    level,
    experience: 0,
    currentHp: maxHp,
    maxHp,
    stats,
    moves: availableMoves,
  };
}

/**
 * 新規プレイヤーを初期化
 */
export async function initializePlayer(
  db: DB,
  clerkUserId: string,
): Promise<{
  success: boolean;
  playerId?: string;
  error?: string;
}> {
  // 既存プレイヤーチェック
  const existingPlayer = await db
    .select()
    .from(players)
    .where(eq(players.clerkUserId, clerkUserId))
    .limit(1);

  if (existingPlayer.length > 0) {
    return { success: false, error: "Player already exists" };
  }

  // 初期ゴーストの種族データを取得
  const speciesResult = await db
    .select()
    .from(ghostSpecies)
    .where(eq(ghostSpecies.id, STARTER_GHOST_CONFIG.speciesId))
    .limit(1);

  if (speciesResult.length === 0) {
    return { success: false, error: "Starter ghost species not found" };
  }

  const species = speciesResult[0];

  // 習得可能技を取得（PPも含める）
  const learnableMovesResult = await db
    .select({
      moveId: learnableMoves.moveId,
      level: learnableMoves.level,
      pp: moves.pp,
    })
    .from(learnableMoves)
    .innerJoin(moves, eq(learnableMoves.moveId, moves.id))
    .where(eq(learnableMoves.speciesId, STARTER_GHOST_CONFIG.speciesId));

  // 初期ゴーストを作成
  const ghostData = createInitialGhost(
    {
      id: species.id,
      baseHp: species.baseHp,
      baseAttack: species.baseAttack,
      baseDefense: species.baseDefense,
      baseSpeed: species.baseSpeed,
    },
    learnableMovesResult,
    STARTER_GHOST_CONFIG.level,
  );

  // プレイヤーIDを生成
  const playerId = `player_${crypto.randomUUID()}`;
  const ghostId = `ghost_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  // プレイヤーを作成
  await db.insert(players).values({
    id: playerId,
    clerkUserId,
    name: "プレイヤー",
    mapId: INITIAL_POSITION.mapId,
    x: INITIAL_POSITION.x,
    y: INITIAL_POSITION.y,
    createdAt: now,
    updatedAt: now,
  });

  // 初期ゴーストを作成
  await db.insert(playerGhosts).values({
    id: ghostId,
    playerId,
    speciesId: ghostData.speciesId,
    nickname: null,
    level: ghostData.level,
    experience: ghostData.experience,
    currentHp: ghostData.currentHp,
    maxHp: ghostData.maxHp,
    statHp: ghostData.stats.hp,
    statAttack: ghostData.stats.attack,
    statDefense: ghostData.stats.defense,
    statSpeed: ghostData.stats.speed,
    partyOrder: 0, // パーティの先頭
  });

  // 初期ゴーストの技を作成
  for (let slot = 0; slot < ghostData.moves.length; slot++) {
    const move = ghostData.moves[slot];
    await db.insert(playerGhostMoves).values({
      playerGhostId: ghostId,
      moveId: move.moveId,
      slot,
      currentPp: move.currentPP,
      maxPp: move.maxPP,
    });
  }

  // 初期アイテムを付与
  for (const item of INITIAL_ITEMS) {
    await db.insert(playerItems).values({
      playerId,
      itemId: item.itemId,
      quantity: item.quantity,
    });
  }

  return { success: true, playerId };
}
