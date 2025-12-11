import type { GhostType, LevelUpResult } from "@ghost-game/shared";
import { useCallback, useEffect, useState } from "react";

/**
 * 勝利パネルのProps
 */
export interface VictoryPanelProps {
  /** 勝利したゴーストの名前 */
  ghostName: string;
  /** ゴーストのタイプ */
  ghostType: GhostType;
  /** 獲得経験値 */
  expGained: number;
  /** レベルアップしたかどうか */
  leveledUp: boolean;
  /** レベルアップ結果（レベルアップした場合のみ） */
  levelUpResult?: LevelUpResult;
  /** 元のレベル */
  previousLevel: number;
  /** 習得可能な技がある場合のコールバック */
  onLearnMove?: (moveId: string) => void;
  /** 続行時のコールバック */
  onContinue: () => void;
  /** キー入力（親からの入力） */
  onKeyInput?: string;
}

/**
 * タイプに応じた背景色クラス
 */
const TYPE_COLORS: Record<GhostType, string> = {
  fire: "bg-red-500",
  water: "bg-blue-500",
  grass: "bg-green-500",
  electric: "bg-yellow-500",
  ghost: "bg-purple-500",
  normal: "bg-gray-400",
};

/**
 * タイプの日本語名
 */
const TYPE_NAMES: Record<GhostType, string> = {
  fire: "炎",
  water: "水",
  grass: "草",
  electric: "電気",
  ghost: "霊",
  normal: "ノーマル",
};

type PanelPhase = "victory" | "exp" | "levelUp" | "stats" | "done";

/**
 * 勝利時のパネルコンポーネント
 *
 * - 勝利メッセージの表示
 * - 獲得経験値の表示
 * - レベルアップ時のアニメーション
 * - 能力値変化の表示
 */
export function VictoryPanel({
  ghostName,
  ghostType,
  expGained,
  leveledUp,
  levelUpResult,
  previousLevel,
  onLearnMove,
  onContinue,
  onKeyInput,
}: VictoryPanelProps) {
  const [phase, setPhase] = useState<PanelPhase>("victory");
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  // フェーズを進める
  const advancePhase = useCallback(() => {
    switch (phase) {
      case "victory":
        setPhase("exp");
        break;
      case "exp":
        if (leveledUp && levelUpResult) {
          setPhase("levelUp");
        } else {
          setPhase("done");
        }
        break;
      case "levelUp":
        setPhase("stats");
        break;
      case "stats":
        // 習得可能な技がある場合
        if (levelUpResult && levelUpResult.learnableMoveIds.length > 0 && onLearnMove) {
          const moveId = levelUpResult.learnableMoveIds[currentMoveIndex];
          onLearnMove(moveId);
          if (currentMoveIndex < levelUpResult.learnableMoveIds.length - 1) {
            setCurrentMoveIndex((prev) => prev + 1);
          } else {
            setPhase("done");
          }
        } else {
          setPhase("done");
        }
        break;
      case "done":
        onContinue();
        break;
    }
  }, [phase, leveledUp, levelUpResult, onLearnMove, currentMoveIndex, onContinue]);

  // キー入力処理
  const handleKeyInput = useCallback(
    (key: string) => {
      if (key === "Enter" || key === " ") {
        advancePhase();
      }
    },
    [advancePhase],
  );

  // 親からのキー入力を処理
  // biome-ignore lint/correctness/useExhaustiveDependencies: handleKeyInputは意図的に除外（onKeyInputの変更時のみ実行、無限ループ防止）
  useEffect(() => {
    if (onKeyInput) {
      handleKeyInput(onKeyInput);
    }
  }, [onKeyInput]);

  // 勝利メッセージ
  if (phase === "victory") {
    return (
      <div
        className="flex h-full flex-col items-center justify-center p-4"
        data-testid="victory-panel"
        data-phase="victory"
      >
        <div className="mb-6 text-center">
          <p className="mb-4 text-3xl font-bold text-ghost-success" data-testid="victory-message">
            勝利！
          </p>
          <p className="text-lg text-ghost-text">野生のゴーストを倒した！</p>
        </div>
        <button
          type="button"
          onClick={advancePhase}
          className="rounded-lg border-2 border-ghost-primary bg-ghost-primary/20 px-8 py-3 font-bold text-ghost-text-bright transition-all hover:bg-ghost-primary/30"
          data-testid="continue-button"
        >
          次へ
        </button>
      </div>
    );
  }

  // 経験値獲得
  if (phase === "exp") {
    return (
      <div
        className="flex h-full flex-col items-center justify-center p-4"
        data-testid="victory-panel"
        data-phase="exp"
      >
        <div className="mb-6 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-xs font-bold text-white ${TYPE_COLORS[ghostType]}`}
            >
              {TYPE_NAMES[ghostType]}
            </span>
            <span className="text-xl font-bold text-ghost-text-bright" data-testid="ghost-name">
              {ghostName}
            </span>
          </div>
          <p className="text-lg text-ghost-text">
            <span className="font-bold text-ghost-info" data-testid="exp-gained">
              {expGained}
            </span>
            <span> の経験値を獲得！</span>
          </p>
        </div>
        <button
          type="button"
          onClick={advancePhase}
          className="rounded-lg border-2 border-ghost-primary bg-ghost-primary/20 px-8 py-3 font-bold text-ghost-text-bright transition-all hover:bg-ghost-primary/30"
          data-testid="continue-button"
        >
          次へ
        </button>
      </div>
    );
  }

  // レベルアップ
  if (phase === "levelUp" && levelUpResult) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center p-4"
        data-testid="victory-panel"
        data-phase="levelUp"
      >
        <div className="mb-6 text-center">
          <p className="mb-2 text-2xl font-bold text-ghost-warning" data-testid="levelup-message">
            レベルアップ！
          </p>
          <div className="mb-4 flex items-center justify-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-xs font-bold text-white ${TYPE_COLORS[ghostType]}`}
            >
              {TYPE_NAMES[ghostType]}
            </span>
            <span className="text-xl font-bold text-ghost-text-bright">{ghostName}</span>
          </div>
          <p className="text-lg text-ghost-text">
            <span>Lv.</span>
            <span data-testid="previous-level">{previousLevel}</span>
            <span className="mx-2">→</span>
            <span className="font-bold text-ghost-success" data-testid="new-level">
              Lv.{levelUpResult.newLevel}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={advancePhase}
          className="rounded-lg border-2 border-ghost-primary bg-ghost-primary/20 px-8 py-3 font-bold text-ghost-text-bright transition-all hover:bg-ghost-primary/30"
          data-testid="continue-button"
        >
          次へ
        </button>
      </div>
    );
  }

  // 能力値変化
  if (phase === "stats" && levelUpResult) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center p-4"
        data-testid="victory-panel"
        data-phase="stats"
      >
        <div className="mb-6 text-center">
          <p className="mb-4 text-lg font-bold text-ghost-text-bright">能力値が上がった！</p>
          <div className="grid grid-cols-2 gap-4 text-ghost-text" data-testid="stats-display">
            <div className="text-right">
              <span>HP:</span>
            </div>
            <div className="text-left font-bold text-ghost-success" data-testid="new-hp">
              {levelUpResult.newMaxHp}
            </div>
            <div className="text-right">
              <span>こうげき:</span>
            </div>
            <div className="text-left font-bold text-ghost-success" data-testid="new-attack">
              {levelUpResult.newStats.attack}
            </div>
            <div className="text-right">
              <span>ぼうぎょ:</span>
            </div>
            <div className="text-left font-bold text-ghost-success" data-testid="new-defense">
              {levelUpResult.newStats.defense}
            </div>
            <div className="text-right">
              <span>すばやさ:</span>
            </div>
            <div className="text-left font-bold text-ghost-success" data-testid="new-speed">
              {levelUpResult.newStats.speed}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={advancePhase}
          className="rounded-lg border-2 border-ghost-primary bg-ghost-primary/20 px-8 py-3 font-bold text-ghost-text-bright transition-all hover:bg-ghost-primary/30"
          data-testid="continue-button"
        >
          次へ
        </button>
      </div>
    );
  }

  // 完了
  return (
    <div
      className="flex h-full flex-col items-center justify-center p-4"
      data-testid="victory-panel"
      data-phase="done"
    >
      <div className="mb-6 text-center">
        <p className="text-lg text-ghost-text">バトル終了</p>
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="rounded-lg border-2 border-ghost-primary bg-ghost-primary/20 px-8 py-3 font-bold text-ghost-text-bright transition-all hover:bg-ghost-primary/30"
        data-testid="continue-button"
      >
        マップに戻る
      </button>
    </div>
  );
}
