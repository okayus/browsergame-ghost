import type { GhostType, Move, OwnedMove } from "@ghost-game/shared";
import { useCallback, useEffect, useState } from "react";

/**
 * 表示用の技情報
 */
export interface DisplayMove {
  move: Move;
  ownedMove: OwnedMove;
}

/**
 * 技選択パネルのProps
 */
export interface SkillSelectPanelProps {
  /** 表示する技一覧 */
  moves: DisplayMove[];
  /** 技選択時のコールバック */
  onSelectMove: (moveId: string) => void;
  /** 戻るボタン押下時のコールバック */
  onBack: () => void;
  /** 初期選択インデックス */
  initialSelectedIndex?: number;
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

/**
 * 技選択パネルコンポーネント
 *
 * - 使用可能な技一覧の表示
 * - 技タイプと残りPPの表示
 * - 技選択時のアクション発火
 */
export function SkillSelectPanel({
  moves,
  onSelectMove,
  onBack,
  initialSelectedIndex = 0,
  onKeyInput,
}: SkillSelectPanelProps) {
  // 「もどる」を含めた選択肢の数
  const totalItems = moves.length + 1;
  const backIndex = moves.length;

  const [selectedIndex, setSelectedIndex] = useState(
    Math.min(initialSelectedIndex, totalItems - 1),
  );

  // キー入力処理
  const handleKeyInput = useCallback(
    (key: string) => {
      switch (key) {
        case "w":
        case "W":
        case "ArrowUp":
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
          break;
        case "s":
        case "S":
        case "ArrowDown":
          setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
          break;
        case "Escape":
          onBack();
          break;
        case "Enter":
        case " ": {
          if (selectedIndex === backIndex) {
            onBack();
          } else {
            const displayMove = moves[selectedIndex];
            // PP が 0 の場合は選択不可
            if (displayMove.ownedMove.currentPP > 0) {
              onSelectMove(displayMove.ownedMove.moveId);
            }
          }
          break;
        }
      }
    },
    [selectedIndex, moves, totalItems, backIndex, onSelectMove, onBack],
  );

  // 親からのキー入力を処理
  // biome-ignore lint/correctness/useExhaustiveDependencies: handleKeyInputは意図的に除外（onKeyInputの変更時のみ実行、無限ループ防止）
  useEffect(() => {
    if (onKeyInput) {
      handleKeyInput(onKeyInput);
    }
  }, [onKeyInput]);

  // 技クリック
  const handleMoveClick = (index: number) => {
    if (index === backIndex) {
      onBack();
      return;
    }

    const displayMove = moves[index];
    // PP が 0 の場合は選択不可
    if (displayMove.ownedMove.currentPP <= 0) {
      return;
    }

    setSelectedIndex(index);
    onSelectMove(displayMove.ownedMove.moveId);
  };

  return (
    <div className="flex h-full flex-col p-4" data-testid="skill-select-panel">
      {/* 技一覧 */}
      <div className="flex flex-1 flex-col gap-2">
        {moves.map((displayMove, index) => {
          const isSelected = selectedIndex === index;
          const isDisabled = displayMove.ownedMove.currentPP <= 0;

          return (
            <button
              type="button"
              key={displayMove.move.id}
              onClick={() => handleMoveClick(index)}
              disabled={isDisabled}
              className={`flex items-center justify-between rounded-lg border-2 p-3 transition-all ${
                isSelected
                  ? "border-ghost-primary bg-ghost-primary/20 text-ghost-text-bright"
                  : "border-ghost-border bg-ghost-surface text-ghost-text"
              } ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-ghost-primary-light"}`}
              data-testid={`skill-${displayMove.move.id}`}
              data-selected={isSelected}
              data-disabled={isDisabled}
            >
              <div className="flex items-center gap-3">
                {/* タイプバッジ */}
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold text-white ${TYPE_COLORS[displayMove.move.type]}`}
                  data-testid={`skill-type-${displayMove.move.id}`}
                >
                  {TYPE_NAMES[displayMove.move.type]}
                </span>
                {/* 技名 */}
                <span className="font-bold">{displayMove.move.name}</span>
              </div>
              {/* PP表示 */}
              <span
                className={`text-sm ${isDisabled ? "text-ghost-danger" : "text-ghost-text-muted"}`}
                data-testid={`skill-pp-${displayMove.move.id}`}
              >
                PP {displayMove.ownedMove.currentPP}/{displayMove.ownedMove.maxPP}
              </span>
            </button>
          );
        })}

        {/* もどるボタン */}
        <button
          type="button"
          onClick={() => handleMoveClick(backIndex)}
          className={`flex items-center justify-center rounded-lg border-2 p-3 transition-all ${
            selectedIndex === backIndex
              ? "border-ghost-primary bg-ghost-primary/20 text-ghost-text-bright"
              : "border-ghost-border bg-ghost-surface text-ghost-text"
          } cursor-pointer hover:border-ghost-primary-light`}
          data-testid="skill-back"
          data-selected={selectedIndex === backIndex}
        >
          <span className="font-bold">もどる</span>
        </button>
      </div>
    </div>
  );
}
