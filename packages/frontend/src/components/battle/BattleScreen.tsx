import type { BattleGhostState, BattlePhase } from "@ghost-game/shared";
import { GhostDisplay } from "./GhostDisplay";

/**
 * バトル画面のProps
 */
export interface BattleScreenProps {
  /** バトルフェーズ */
  phase: BattlePhase;
  /** プレイヤーのゴースト状態 */
  playerGhost: BattleGhostState | null;
  /** 敵のゴースト状態 */
  enemyGhost: BattleGhostState | null;
  /** プレイヤーゴーストのタイプ */
  playerGhostType?: string;
  /** 敵ゴーストのタイプ */
  enemyGhostType?: string;
  /** メッセージ */
  messages: string[];
  /** 現在のメッセージインデックス */
  currentMessageIndex?: number;
  /** コマンド選択パネル（子要素として受け取る） */
  commandPanel?: React.ReactNode;
  /** メッセージボックス（子要素として受け取る） */
  messageBox?: React.ReactNode;
}

/**
 * バトル画面コンポーネント
 *
 * - 味方ゴーストと敵ゴーストの表示
 * - HP、名前、レベルの表示
 * - バトルフェーズに応じたパネル切り替え
 */
export function BattleScreen({
  phase,
  playerGhost,
  enemyGhost,
  playerGhostType,
  enemyGhostType,
  commandPanel,
  messageBox,
}: BattleScreenProps) {
  return (
    <div
      className="relative flex h-full w-full flex-col bg-gradient-to-b from-ghost-bg to-ghost-surface"
      data-testid="battle-screen"
      data-phase={phase}
    >
      {/* バトルフィールド */}
      <div className="flex flex-1 flex-col p-4">
        {/* 敵ゴースト（上部） */}
        <div className="mb-4 flex justify-end">
          {enemyGhost && (
            <GhostDisplay ghostState={enemyGhost} isEnemy={true} ghostType={enemyGhostType} />
          )}
        </div>

        {/* 中央エリア（エフェクト用） */}
        <div className="flex-1" data-testid="battle-effect-area" />

        {/* プレイヤーゴースト（下部） */}
        <div className="mt-4 flex justify-start">
          {playerGhost && (
            <GhostDisplay ghostState={playerGhost} isEnemy={false} ghostType={playerGhostType} />
          )}
        </div>
      </div>

      {/* コマンドパネルエリア（下部固定） */}
      <div className="relative h-[180px] border-t-4 border-ghost-primary bg-ghost-surface">
        {/* フェーズに応じたパネル表示 */}
        {phase === "command_select" && commandPanel}
        {phase === "move_select" && commandPanel}
        {phase === "item_select" && commandPanel}
        {phase === "executing" && (
          <div
            className="flex h-full items-center justify-center"
            data-testid="executing-indicator"
          >
            <span className="animate-pulse text-xl text-ghost-text-bright">実行中...</span>
          </div>
        )}
        {phase === "result" && (
          <div className="flex h-full items-center justify-center" data-testid="result-panel">
            <span className="text-xl text-ghost-text-bright">バトル終了</span>
          </div>
        )}

        {/* メッセージボックス（オーバーレイ） */}
        {messageBox}
      </div>
    </div>
  );
}
