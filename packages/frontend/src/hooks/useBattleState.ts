import type {
  BattleGhostState,
  BattlePhase,
  GhostType,
  OwnedGhost,
  OwnedMove,
} from "@ghost-game/shared";
import {
  attemptCapture,
  attemptEscape,
  calculateDamage,
  determineTurnOrder,
} from "@ghost-game/shared";
import { useCallback, useState } from "react";

/**
 * バトルコマンドの種類
 */
export type BattleCommand = "fight" | "item" | "capture" | "escape";

/**
 * バトルアクションの種類
 */
export type BattleAction =
  | { type: "attack"; moveIndex: number }
  | { type: "item"; itemId: string; healAmount: number }
  | { type: "capture"; itemBonus: number }
  | { type: "escape" };

/**
 * バトル終了理由
 */
export type BattleEndReason = "player_win" | "player_lose" | "escape" | "capture";

/**
 * ターン実行結果
 */
export interface TurnResult {
  /** プレイヤーのアクション結果メッセージ */
  playerActionMessage: string | null;
  /** 敵のアクション結果メッセージ */
  enemyActionMessage: string | null;
  /** バトルが終了したか */
  battleEnded: boolean;
  /** バトル終了理由 */
  endReason: BattleEndReason | null;
  /** ダメージ情報（表示用） */
  damageInfo: {
    playerDamage: number | null;
    enemyDamage: number | null;
  };
}

/**
 * バトル状態
 */
export interface BattleState {
  /** 現在のフェーズ */
  phase: BattlePhase;
  /** プレイヤーのゴースト状態 */
  playerGhost: BattleGhostState | null;
  /** 敵のゴースト状態 */
  enemyGhost: BattleGhostState | null;
  /** 現在のターン数 */
  turnCount: number;
  /** 逃走試行回数 */
  escapeAttempts: number;
  /** メッセージキュー */
  messages: string[];
  /** バトル中かどうか */
  isActive: boolean;
  /** バトル終了理由 */
  endReason: BattleEndReason | null;
}

/**
 * バトル状態管理フックの戻り値
 */
export interface UseBattleStateReturn {
  /** 現在の状態 */
  state: BattleState;
  /** バトルを開始する */
  startBattle: (playerGhost: OwnedGhost, enemyGhost: OwnedGhost, enemyType: GhostType) => void;
  /** フェーズを変更する */
  setPhase: (phase: BattlePhase) => void;
  /** プレイヤーのアクションを実行する */
  executePlayerAction: (
    action: BattleAction,
    playerType: GhostType,
    enemyType: GhostType,
    randomValues?: { critical?: number; escape?: number; capture?: number },
  ) => TurnResult;
  /** メッセージを追加する */
  addMessage: (message: string) => void;
  /** メッセージをクリアする */
  clearMessages: () => void;
  /** バトルを終了する */
  endBattle: () => void;
  /** 状態をリセットする */
  reset: () => void;
}

/**
 * 初期状態
 */
const initialState: BattleState = {
  phase: "command_select",
  playerGhost: null,
  enemyGhost: null,
  turnCount: 1,
  escapeAttempts: 0,
  messages: [],
  isActive: false,
  endReason: null,
};

/**
 * OwnedGhostからBattleGhostStateを作成
 */
function createBattleGhostState(ghost: OwnedGhost): BattleGhostState {
  return {
    ghost,
    currentHp: ghost.currentHp,
    statModifiers: { attack: 0, defense: 0, speed: 0 },
  };
}

/**
 * 敵AIの技選択（ランダム）
 */
function selectEnemyMove(moves: OwnedMove[]): number {
  const usableMoves = moves
    .map((move, index) => ({ move, index }))
    .filter(({ move }) => move.currentPP > 0);

  if (usableMoves.length === 0) {
    // PPがない場合は悪あがき（最初の技を使う）
    return 0;
  }

  return usableMoves[Math.floor(Math.random() * usableMoves.length)].index;
}

/**
 * バトル状態を管理するフック
 *
 * - バトルフェーズ（コマンド選択、技選択、実行中、結果）の状態管理
 * - プレイヤーゴーストと敵ゴーストの状態管理
 * - コマンド選択アクション
 * - ターン実行アクション（ダメージ計算ロジック呼び出し）
 * - バトル終了判定（HP0、逃走、捕獲）
 */
export function useBattleState(): UseBattleStateReturn {
  const [state, setState] = useState<BattleState>(initialState);

  const startBattle = useCallback(
    (playerGhost: OwnedGhost, enemyGhost: OwnedGhost, _enemyType: GhostType) => {
      setState({
        phase: "command_select",
        playerGhost: createBattleGhostState(playerGhost),
        enemyGhost: createBattleGhostState(enemyGhost),
        turnCount: 1,
        escapeAttempts: 0,
        messages: [`野生の${enemyGhost.speciesId}が現れた！`],
        isActive: true,
        endReason: null,
      });
    },
    [],
  );

  const setPhase = useCallback((phase: BattlePhase) => {
    setState((prev) => ({ ...prev, phase }));
  }, []);

  const addMessage = useCallback((message: string) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }, []);

  const clearMessages = useCallback(() => {
    setState((prev) => ({ ...prev, messages: [] }));
  }, []);

  const executePlayerAction = useCallback(
    (
      action: BattleAction,
      playerType: GhostType,
      enemyType: GhostType,
      randomValues?: { critical?: number; escape?: number; capture?: number },
    ): TurnResult => {
      if (!state.playerGhost || !state.enemyGhost) {
        return {
          playerActionMessage: null,
          enemyActionMessage: null,
          battleEnded: false,
          endReason: null,
          damageInfo: { playerDamage: null, enemyDamage: null },
        };
      }

      // nullチェック後にローカル変数に代入してTypeScriptに型を認識させる
      const playerGhostState = state.playerGhost;
      const enemyGhostState = state.enemyGhost;

      let playerActionMessage: string | null = null;
      let enemyActionMessage: string | null = null;
      let battleEnded = false;
      let endReason: BattleEndReason | null = null;
      let playerDamage: number | null = null;
      let enemyDamage: number | null = null;

      let newPlayerHp = playerGhostState.currentHp;
      let newEnemyHp = enemyGhostState.currentHp;
      let newEscapeAttempts = state.escapeAttempts;

      // 逃走アクション
      if (action.type === "escape") {
        const escapeResult = attemptEscape(
          playerGhostState.ghost.stats.speed,
          enemyGhostState.ghost.stats.speed,
          state.escapeAttempts,
          randomValues?.escape,
        );

        newEscapeAttempts++;

        if (escapeResult.success) {
          playerActionMessage = "うまく逃げ切った！";
          battleEnded = true;
          endReason = "escape";
        } else {
          playerActionMessage = "逃げられなかった！";
          // 敵のターン
          const enemyMoveIndex = selectEnemyMove(enemyGhostState.ghost.moves);
          const enemyMove = enemyGhostState.ghost.moves[enemyMoveIndex];

          if (enemyMove && enemyMove.currentPP > 0) {
            const damageResult = calculateDamage(
              {
                movePower: 40, // 仮の威力
                moveType: enemyType,
                attackerAttack: enemyGhostState.ghost.stats.attack,
                attackerType: enemyType,
                attackerLevel: enemyGhostState.ghost.level,
                defenderDefense: playerGhostState.ghost.stats.defense,
                defenderType: playerType,
              },
              randomValues?.critical,
            );

            playerDamage = damageResult.damage;
            newPlayerHp = Math.max(0, newPlayerHp - damageResult.damage);
            enemyActionMessage = `敵の${enemyGhostState.ghost.speciesId}の攻撃！${damageResult.damage}ダメージ！`;

            if (damageResult.isCritical) {
              enemyActionMessage += " 急所に当たった！";
            }

            if (newPlayerHp === 0) {
              battleEnded = true;
              endReason = "player_lose";
            }
          }
        }
      }

      // アイテム使用アクション（回復）
      else if (action.type === "item") {
        // HP回復処理
        const maxHp = playerGhostState.ghost.maxHp;
        const currentHp = playerGhostState.currentHp;
        const healAmount = Math.min(action.healAmount, maxHp - currentHp);
        newPlayerHp = currentHp + healAmount;

        if (healAmount > 0) {
          playerActionMessage = `HPが${healAmount}回復した！`;
        } else {
          playerActionMessage = "HPは満タンだ！";
        }

        // 敵のターン
        const enemyMoveIndex = selectEnemyMove(enemyGhostState.ghost.moves);
        const enemyMove = enemyGhostState.ghost.moves[enemyMoveIndex];

        if (enemyMove && enemyMove.currentPP > 0) {
          const damageResult = calculateDamage(
            {
              movePower: 40,
              moveType: enemyType,
              attackerAttack: enemyGhostState.ghost.stats.attack,
              attackerType: enemyType,
              attackerLevel: enemyGhostState.ghost.level,
              defenderDefense: playerGhostState.ghost.stats.defense,
              defenderType: playerType,
            },
            randomValues?.critical,
          );

          playerDamage = damageResult.damage;
          newPlayerHp = Math.max(0, newPlayerHp - damageResult.damage);
          enemyActionMessage = `敵の${enemyGhostState.ghost.speciesId}の攻撃！${damageResult.damage}ダメージ！`;

          if (damageResult.isCritical) {
            enemyActionMessage += " 急所に当たった！";
          }

          if (newPlayerHp === 0) {
            battleEnded = true;
            endReason = "player_lose";
          }
        }
      }

      // 捕獲アクション
      else if (action.type === "capture") {
        const captureResult = attemptCapture(
          enemyGhostState.currentHp,
          enemyGhostState.ghost.maxHp,
          action.itemBonus,
          randomValues?.capture,
        );

        if (captureResult.success) {
          playerActionMessage = `${enemyGhostState.ghost.speciesId}を捕まえた！`;
          battleEnded = true;
          endReason = "capture";
        } else {
          playerActionMessage = "捕獲に失敗した...";
          // 敵のターン
          const enemyMoveIndex = selectEnemyMove(enemyGhostState.ghost.moves);
          const enemyMove = enemyGhostState.ghost.moves[enemyMoveIndex];

          if (enemyMove && enemyMove.currentPP > 0) {
            const damageResult = calculateDamage(
              {
                movePower: 40,
                moveType: enemyType,
                attackerAttack: enemyGhostState.ghost.stats.attack,
                attackerType: enemyType,
                attackerLevel: enemyGhostState.ghost.level,
                defenderDefense: playerGhostState.ghost.stats.defense,
                defenderType: playerType,
              },
              randomValues?.critical,
            );

            playerDamage = damageResult.damage;
            newPlayerHp = Math.max(0, newPlayerHp - damageResult.damage);
            enemyActionMessage = `敵の${enemyGhostState.ghost.speciesId}の攻撃！${damageResult.damage}ダメージ！`;

            if (newPlayerHp === 0) {
              battleEnded = true;
              endReason = "player_lose";
            }
          }
        }
      }

      // 攻撃アクション
      else if (action.type === "attack") {
        const playerMove = playerGhostState.ghost.moves[action.moveIndex];

        if (!playerMove || playerMove.currentPP <= 0) {
          playerActionMessage = "技が使えない！";
        } else {
          // ターン順序決定
          const turnOrder = determineTurnOrder(
            playerGhostState.ghost.stats.speed,
            enemyGhostState.ghost.stats.speed,
          );

          const executePlayerAttack = () => {
            const damageResult = calculateDamage(
              {
                movePower: 40, // 仮の威力
                moveType: playerType,
                attackerAttack: playerGhostState.ghost.stats.attack,
                attackerType: playerType,
                attackerLevel: playerGhostState.ghost.level,
                defenderDefense: enemyGhostState.ghost.stats.defense,
                defenderType: enemyType,
              },
              randomValues?.critical,
            );

            enemyDamage = damageResult.damage;
            newEnemyHp = Math.max(0, newEnemyHp - damageResult.damage);
            let msg = `${playerGhostState.ghost.speciesId}の攻撃！${damageResult.damage}ダメージ！`;
            if (damageResult.isCritical) {
              msg += " 急所に当たった！";
            }
            return msg;
          };

          const executeEnemyAttack = () => {
            const enemyMoveIndex = selectEnemyMove(enemyGhostState.ghost.moves);
            const enemyMove = enemyGhostState.ghost.moves[enemyMoveIndex];

            if (!enemyMove || enemyMove.currentPP <= 0) {
              return null;
            }

            const damageResult = calculateDamage(
              {
                movePower: 40,
                moveType: enemyType,
                attackerAttack: enemyGhostState.ghost.stats.attack,
                attackerType: enemyType,
                attackerLevel: enemyGhostState.ghost.level,
                defenderDefense: playerGhostState.ghost.stats.defense,
                defenderType: playerType,
              },
              randomValues?.critical,
            );

            playerDamage = damageResult.damage;
            newPlayerHp = Math.max(0, newPlayerHp - damageResult.damage);
            let msg = `敵の${enemyGhostState.ghost.speciesId}の攻撃！${damageResult.damage}ダメージ！`;
            if (damageResult.isCritical) {
              msg += " 急所に当たった！";
            }
            return msg;
          };

          if (turnOrder.first === "player") {
            // プレイヤー先攻
            playerActionMessage = executePlayerAttack();

            if (newEnemyHp === 0) {
              battleEnded = true;
              endReason = "player_win";
            } else {
              // 敵のターン
              enemyActionMessage = executeEnemyAttack();
              if (newPlayerHp === 0) {
                battleEnded = true;
                endReason = "player_lose";
              }
            }
          } else {
            // 敵先攻
            enemyActionMessage = executeEnemyAttack();

            if (newPlayerHp === 0) {
              battleEnded = true;
              endReason = "player_lose";
            } else {
              // プレイヤーのターン
              playerActionMessage = executePlayerAttack();
              if (newEnemyHp === 0) {
                battleEnded = true;
                endReason = "player_win";
              }
            }
          }
        }
      }

      // 状態更新
      setState((prev) => ({
        ...prev,
        playerGhost: prev.playerGhost ? { ...prev.playerGhost, currentHp: newPlayerHp } : null,
        enemyGhost: prev.enemyGhost ? { ...prev.enemyGhost, currentHp: newEnemyHp } : null,
        turnCount: prev.turnCount + 1,
        escapeAttempts: newEscapeAttempts,
        phase: battleEnded ? "result" : "command_select",
        isActive: !battleEnded,
        endReason,
        messages: [
          ...prev.messages,
          ...(playerActionMessage ? [playerActionMessage] : []),
          ...(enemyActionMessage ? [enemyActionMessage] : []),
        ],
      }));

      return {
        playerActionMessage,
        enemyActionMessage,
        battleEnded,
        endReason,
        damageInfo: { playerDamage, enemyDamage },
      };
    },
    [state.playerGhost, state.enemyGhost, state.escapeAttempts],
  );

  const endBattle = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isActive: false,
      phase: "result",
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    startBattle,
    setPhase,
    executePlayerAction,
    addMessage,
    clearMessages,
    endBattle,
    reset,
  };
}
