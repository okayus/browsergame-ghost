import type { InventoryEntry, OwnedGhost, PlayerData } from "@ghost-game/shared";
import { eq } from "drizzle-orm";
import type { DB } from "../db";
import { playerGhostMoves, playerGhosts, playerItems, players } from "../db/schema";

/**
 * プレイヤーのセーブデータを取得
 */
export async function getPlayerSaveData(db: DB, clerkUserId: string): Promise<PlayerData | null> {
  // プレイヤー情報を取得
  const playerResult = await db
    .select()
    .from(players)
    .where(eq(players.clerkUserId, clerkUserId))
    .limit(1);

  if (playerResult.length === 0) {
    return null;
  }

  const player = playerResult[0];

  // パーティのゴーストを取得（partyOrder != null のもの、順番順）
  const ghostsResult = await db
    .select()
    .from(playerGhosts)
    .where(eq(playerGhosts.playerId, player.id));

  // パーティ内のゴーストのみフィルタ（partyOrder が null でないもの）
  const partyGhosts = ghostsResult
    .filter((g) => g.partyOrder !== null)
    .sort((a, b) => (a.partyOrder ?? 0) - (b.partyOrder ?? 0));

  // 各ゴーストの技を取得
  const ghosts: OwnedGhost[] = await Promise.all(
    partyGhosts.map(async (ghost) => {
      const movesResult = await db
        .select()
        .from(playerGhostMoves)
        .where(eq(playerGhostMoves.playerGhostId, ghost.id));

      // スロット順にソート
      const sortedMoves = movesResult.sort((a, b) => a.slot - b.slot);

      return {
        id: ghost.id,
        speciesId: ghost.speciesId,
        nickname: ghost.nickname ?? undefined,
        level: ghost.level,
        experience: ghost.experience,
        currentHp: ghost.currentHp,
        maxHp: ghost.maxHp,
        stats: {
          hp: ghost.statHp,
          attack: ghost.statAttack,
          defense: ghost.statDefense,
          speed: ghost.statSpeed,
        },
        moves: sortedMoves.map((m) => ({
          moveId: m.moveId,
          currentPP: m.currentPp,
          maxPP: m.maxPp,
        })),
      };
    }),
  );

  // アイテムを取得
  const itemsResult = await db
    .select()
    .from(playerItems)
    .where(eq(playerItems.playerId, player.id));

  const items: InventoryEntry[] = itemsResult.map((item) => ({
    itemId: item.itemId,
    quantity: item.quantity,
  }));

  return {
    id: player.id,
    clerkUserId: player.clerkUserId,
    name: player.name,
    party: {
      ghosts,
    },
    inventory: {
      items,
    },
    position: {
      mapId: player.mapId,
      x: player.x,
      y: player.y,
    },
    createdAt: player.createdAt,
    updatedAt: player.updatedAt,
  };
}

/**
 * プレイヤーのセーブデータを保存（更新）
 */
export async function savePlayerData(
  db: DB,
  clerkUserId: string,
  data: {
    position?: { mapId: string; x: number; y: number };
    party?: { ghosts: OwnedGhost[] };
    inventory?: { items: InventoryEntry[] };
  },
): Promise<boolean> {
  // プレイヤーを取得
  const playerResult = await db
    .select()
    .from(players)
    .where(eq(players.clerkUserId, clerkUserId))
    .limit(1);

  if (playerResult.length === 0) {
    return false;
  }

  const player = playerResult[0];
  const now = new Date().toISOString();

  // 位置情報の更新
  if (data.position) {
    await db
      .update(players)
      .set({
        mapId: data.position.mapId,
        x: data.position.x,
        y: data.position.y,
        updatedAt: now,
      })
      .where(eq(players.id, player.id));
  }

  // パーティの更新
  if (data.party) {
    // 各ゴーストを更新
    for (let i = 0; i < data.party.ghosts.length; i++) {
      const ghost = data.party.ghosts[i];
      await db
        .update(playerGhosts)
        .set({
          nickname: ghost.nickname ?? null,
          level: ghost.level,
          experience: ghost.experience,
          currentHp: ghost.currentHp,
          maxHp: ghost.maxHp,
          statHp: ghost.stats.hp,
          statAttack: ghost.stats.attack,
          statDefense: ghost.stats.defense,
          statSpeed: ghost.stats.speed,
          partyOrder: i,
        })
        .where(eq(playerGhosts.id, ghost.id));

      // 技の更新
      // 既存の技を削除
      await db.delete(playerGhostMoves).where(eq(playerGhostMoves.playerGhostId, ghost.id));

      // 新しい技を挿入
      for (let slot = 0; slot < ghost.moves.length; slot++) {
        const move = ghost.moves[slot];
        await db.insert(playerGhostMoves).values({
          playerGhostId: ghost.id,
          moveId: move.moveId,
          slot,
          currentPp: move.currentPP,
          maxPp: move.maxPP,
        });
      }
    }
  }

  // インベントリの更新
  if (data.inventory) {
    // 既存のアイテムを削除
    await db.delete(playerItems).where(eq(playerItems.playerId, player.id));

    // 新しいアイテムを挿入
    for (const item of data.inventory.items) {
      if (item.quantity > 0) {
        await db.insert(playerItems).values({
          playerId: player.id,
          itemId: item.itemId,
          quantity: item.quantity,
        });
      }
    }
  }

  return true;
}
