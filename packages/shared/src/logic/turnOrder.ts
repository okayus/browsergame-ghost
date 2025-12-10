/**
 * ターン順序決定結果
 */
export interface TurnOrderResult {
  /** 先攻側の識別子 */
  first: "player" | "enemy";
  /** 後攻側の識別子 */
  second: "player" | "enemy";
  /** 同速だった場合にランダムで決定されたか */
  wasSpeedTie: boolean;
}

/**
 * ターン順序を決定する
 *
 * 素早さが高い方が先攻となる。
 * 素早さが同じ場合は50%の確率でどちらかが先攻になる。
 *
 * @param playerSpeed プレイヤー側ゴーストの素早さ
 * @param enemySpeed 敵側ゴーストの素早さ
 * @param tieBreaker 同速時の乱数（0-1、テスト用に外部から注入可能）
 * @returns ターン順序決定結果
 */
export function determineTurnOrder(
  playerSpeed: number,
  enemySpeed: number,
  tieBreaker?: number,
): TurnOrderResult {
  // プレイヤーの方が速い
  if (playerSpeed > enemySpeed) {
    return {
      first: "player",
      second: "enemy",
      wasSpeedTie: false,
    };
  }

  // 敵の方が速い
  if (enemySpeed > playerSpeed) {
    return {
      first: "enemy",
      second: "player",
      wasSpeedTie: false,
    };
  }

  // 同速の場合は50%でランダム決定
  const roll = tieBreaker ?? Math.random();
  if (roll < 0.5) {
    return {
      first: "player",
      second: "enemy",
      wasSpeedTie: true,
    };
  }
  return {
    first: "enemy",
    second: "player",
    wasSpeedTie: true,
  };
}

/**
 * 先攻かどうかを判定する
 *
 * @param mySpeed 自分の素早さ
 * @param opponentSpeed 相手の素早さ
 * @param tieBreaker 同速時の乱数（テスト用）
 * @returns 自分が先攻ならtrue
 */
export function goesFirst(mySpeed: number, opponentSpeed: number, tieBreaker?: number): boolean {
  if (mySpeed > opponentSpeed) {
    return true;
  }
  if (mySpeed < opponentSpeed) {
    return false;
  }
  // 同速の場合
  const roll = tieBreaker ?? Math.random();
  return roll < 0.5;
}
