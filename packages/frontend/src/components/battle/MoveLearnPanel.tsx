import type { GhostType, Move, OwnedMove } from "@ghost-game/shared";
import { useState } from "react";
import { useKeyboardHandler } from "../../hooks/useKeyboardHandler";

/**
 * 技習得パネルのProps
 */
export interface MoveLearnPanelProps {
  /** ゴーストの名前 */
  ghostName: string;
  /** 新しく習得する技 */
  newMove: Move;
  /** 現在の技リスト */
  currentMoves: OwnedMove[];
  /** 技のマスタデータを取得する関数 */
  getMoveData: (moveId: string) => Move | undefined;
  /** 技を習得した時のコールバック（入れ替える技のインデックス、-1なら習得しない） */
  onLearnMove: (replaceIndex: number) => void;
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

type PanelMode = "confirm" | "select";

/**
 * 技習得パネルコンポーネント
 *
 * - 新技習得の確認
 * - 技がいっぱいの場合は入れ替え選択
 * - 習得をあきらめる選択肢
 */
export function MoveLearnPanel({
  ghostName,
  newMove,
  currentMoves,
  getMoveData,
  onLearnMove,
  onKeyInput,
}: MoveLearnPanelProps) {
  const hasMaxMoves = currentMoves.length >= 4;
  const [mode, setMode] = useState<PanelMode>(hasMaxMoves ? "confirm" : "confirm");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [confirmChoice, setConfirmChoice] = useState(0); // 0: 習得する, 1: あきらめる

  // キー入力処理
  useKeyboardHandler(onKeyInput, (key: string) => {
    // 選択肢の数を計算
    const choiceCount = mode === "confirm" ? 2 : currentMoves.length + 1;

    switch (key) {
      case "w":
      case "W":
      case "ArrowUp":
        if (mode === "confirm") {
          setConfirmChoice((prev) => (prev > 0 ? prev - 1 : 1));
        } else {
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : choiceCount - 1));
        }
        break;
      case "s":
      case "S":
      case "ArrowDown":
        if (mode === "confirm") {
          setConfirmChoice((prev) => (prev < 1 ? prev + 1 : 0));
        } else {
          setSelectedIndex((prev) => (prev < choiceCount - 1 ? prev + 1 : 0));
        }
        break;
      case "Escape":
        if (mode === "select") {
          setMode("confirm");
          setConfirmChoice(0);
        }
        break;
      case "Enter":
      case " ": {
        if (mode === "confirm") {
          if (confirmChoice === 0) {
            // 習得する
            if (hasMaxMoves) {
              setMode("select");
              setSelectedIndex(0);
            } else {
              // 技に空きがある場合はそのまま習得
              onLearnMove(currentMoves.length);
            }
          } else {
            // あきらめる
            onLearnMove(-1);
          }
        } else {
          // 技選択モード
          if (selectedIndex === currentMoves.length) {
            // あきらめる
            onLearnMove(-1);
          } else {
            // 入れ替え
            onLearnMove(selectedIndex);
          }
        }
        break;
      }
    }
  });

  // 確認画面
  if (mode === "confirm") {
    return (
      <div className="flex h-full flex-col p-4" data-testid="move-learn-panel" data-mode="confirm">
        <div className="mb-4 text-center">
          <p className="mb-2 text-lg font-bold text-ghost-text-bright" data-testid="learn-message">
            {ghostName}は
          </p>
          <div className="mb-2 flex items-center justify-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-xs font-bold text-white ${TYPE_COLORS[newMove.type]}`}
            >
              {TYPE_NAMES[newMove.type]}
            </span>
            <span className="text-xl font-bold text-ghost-info" data-testid="new-move-name">
              {newMove.name}
            </span>
          </div>
          <p className="text-lg text-ghost-text-bright">を覚えようとしている！</p>
          {hasMaxMoves && (
            <p className="mt-2 text-sm text-ghost-warning" data-testid="max-moves-warning">
              しかし技は4つまでしか覚えられない...
            </p>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              if (hasMaxMoves) {
                setMode("select");
                setSelectedIndex(0);
              } else {
                onLearnMove(currentMoves.length);
              }
            }}
            className={`rounded-lg border-2 p-3 transition-all ${
              confirmChoice === 0
                ? "border-ghost-primary bg-ghost-primary/20 text-ghost-text-bright"
                : "border-ghost-border bg-ghost-surface text-ghost-text"
            } cursor-pointer hover:border-ghost-primary-light`}
            data-testid="learn-button"
            data-selected={confirmChoice === 0}
          >
            <span className="font-bold">{hasMaxMoves ? "技を入れ替えて覚える" : "覚える"}</span>
          </button>

          <button
            type="button"
            onClick={() => onLearnMove(-1)}
            className={`rounded-lg border-2 p-3 transition-all ${
              confirmChoice === 1
                ? "border-ghost-primary bg-ghost-primary/20 text-ghost-text-bright"
                : "border-ghost-border bg-ghost-surface text-ghost-text"
            } cursor-pointer hover:border-ghost-primary-light`}
            data-testid="give-up-button"
            data-selected={confirmChoice === 1}
          >
            <span className="font-bold">覚えるのをあきらめる</span>
          </button>
        </div>
      </div>
    );
  }

  // 技選択画面
  return (
    <div className="flex h-full flex-col p-4" data-testid="move-learn-panel" data-mode="select">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-ghost-text-bright">忘れる技を選択</h2>
        <p className="text-sm text-ghost-text-muted">選んだ技を忘れて新しい技を覚えます</p>
      </div>

      {/* 新しい技の情報 */}
      <div className="mb-4 rounded-lg border-2 border-ghost-info bg-ghost-info/10 p-3">
        <p className="mb-1 text-xs text-ghost-text-muted">覚える技</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-xs font-bold text-white ${TYPE_COLORS[newMove.type]}`}
            >
              {TYPE_NAMES[newMove.type]}
            </span>
            <span className="font-bold text-ghost-text-bright">{newMove.name}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-ghost-text-muted">
              威力: <span className="text-ghost-text">{newMove.power}</span>
            </span>
            <span className="text-ghost-text-muted">
              PP: <span className="text-ghost-text">{newMove.pp}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 現在の技リスト */}
      <div className="flex flex-1 flex-col gap-2">
        {currentMoves.map((ownedMove, index) => {
          const move = getMoveData(ownedMove.moveId);
          if (!move) return null;

          const isSelected = selectedIndex === index;

          return (
            <button
              type="button"
              key={ownedMove.moveId}
              onClick={() => onLearnMove(index)}
              className={`flex items-center justify-between rounded-lg border-2 p-3 transition-all ${
                isSelected
                  ? "border-ghost-primary bg-ghost-primary/20 text-ghost-text-bright"
                  : "border-ghost-border bg-ghost-surface text-ghost-text"
              } cursor-pointer hover:border-ghost-primary-light`}
              data-testid={`current-move-${index}`}
              data-selected={isSelected}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold text-white ${TYPE_COLORS[move.type]}`}
                >
                  {TYPE_NAMES[move.type]}
                </span>
                <span className="font-bold">{move.name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-ghost-text-muted">
                  威力: <span className="text-ghost-text">{move.power}</span>
                </span>
                <span className="text-ghost-text-muted">
                  PP:{" "}
                  <span className="text-ghost-text">
                    {ownedMove.currentPP}/{ownedMove.maxPP}
                  </span>
                </span>
              </div>
            </button>
          );
        })}

        {/* あきらめるボタン */}
        <button
          type="button"
          onClick={() => onLearnMove(-1)}
          className={`flex items-center justify-center rounded-lg border-2 p-3 transition-all ${
            selectedIndex === currentMoves.length
              ? "border-ghost-primary bg-ghost-primary/20 text-ghost-text-bright"
              : "border-ghost-border bg-ghost-surface text-ghost-text"
          } cursor-pointer hover:border-ghost-primary-light`}
          data-testid="select-give-up"
          data-selected={selectedIndex === currentMoves.length}
        >
          <span className="font-bold">覚えるのをあきらめる</span>
        </button>
      </div>
    </div>
  );
}
