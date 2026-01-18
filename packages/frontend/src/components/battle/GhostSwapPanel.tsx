import type { GhostType, OwnedGhost } from "@ghost-game/shared";
import { useState } from "react";
import { useKeyboardHandler } from "../../hooks/useKeyboardHandler";

/**
 * ゴースト交代パネルのProps
 */
export interface GhostSwapPanelProps {
  /** パーティ内のゴースト一覧 */
  party: OwnedGhost[];
  /** 現在バトル中のゴーストのインデックス */
  currentGhostIndex: number;
  /** ゴースト種族名を取得する関数 */
  getSpeciesName: (speciesId: string) => string;
  /** ゴーストタイプを取得する関数 */
  getSpeciesType: (speciesId: string) => GhostType;
  /** 交代選択時のコールバック */
  onSelectGhost: (index: number) => void;
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
 * ゴースト交代パネルコンポーネント
 *
 * - バトル中の交代可能ゴースト一覧
 * - 戦闘不能ゴーストは選択不可
 * - 交代時のアクション発火
 */
export function GhostSwapPanel({
  party,
  currentGhostIndex,
  getSpeciesName,
  getSpeciesType,
  onSelectGhost,
  onBack,
  initialSelectedIndex = 0,
  onKeyInput,
}: GhostSwapPanelProps) {
  // 「もどる」を含めた選択肢の数
  const totalItems = party.length + 1;
  const backIndex = party.length;

  const [selectedIndex, setSelectedIndex] = useState(
    Math.min(initialSelectedIndex, totalItems - 1),
  );

  // ゴーストが選択可能かどうか
  const isGhostSelectable = (index: number): boolean => {
    const ghost = party[index];
    // 戦闘不能または現在バトル中のゴーストは選択不可
    return ghost.currentHp > 0 && index !== currentGhostIndex;
  };

  // キー入力処理
  useKeyboardHandler(onKeyInput, (key: string) => {
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
        } else if (isGhostSelectable(selectedIndex)) {
          onSelectGhost(selectedIndex);
        }
        break;
      }
    }
  });

  // ゴーストクリック
  const handleGhostClick = (index: number) => {
    if (index === backIndex) {
      onBack();
      return;
    }

    if (!isGhostSelectable(index)) {
      return;
    }

    setSelectedIndex(index);
    onSelectGhost(index);
  };

  return (
    <div className="flex h-full flex-col p-4" data-testid="ghost-swap-panel">
      {/* ヘッダー */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-ghost-text-bright">交代するゴーストを選択</h2>
      </div>

      {/* ゴースト一覧 */}
      <div className="flex flex-1 flex-col gap-2">
        {party.map((ghost, index) => {
          const isSelected = selectedIndex === index;
          const isFainted = ghost.currentHp <= 0;
          const isCurrent = index === currentGhostIndex;
          const isDisabled = isFainted || isCurrent;
          const speciesName = getSpeciesName(ghost.speciesId);
          const speciesType = getSpeciesType(ghost.speciesId);
          const displayName = ghost.nickname || speciesName;
          const hpPercentage = Math.round((ghost.currentHp / ghost.maxHp) * 100);

          return (
            <button
              type="button"
              key={ghost.id}
              onClick={() => handleGhostClick(index)}
              disabled={isDisabled}
              className={`flex items-center justify-between rounded-lg border-2 p-3 transition-all ${
                isSelected
                  ? "border-ghost-primary bg-ghost-primary/20 text-ghost-text-bright"
                  : "border-ghost-border bg-ghost-surface text-ghost-text"
              } ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-ghost-primary-light"}`}
              data-testid={`swap-ghost-${index}`}
              data-selected={isSelected}
              data-disabled={isDisabled}
              data-fainted={isFainted}
              data-current={isCurrent}
            >
              <div className="flex items-center gap-3">
                {/* タイプバッジ */}
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold text-white ${TYPE_COLORS[speciesType]}`}
                  data-testid={`swap-ghost-type-${index}`}
                >
                  {TYPE_NAMES[speciesType]}
                </span>
                {/* 名前 */}
                <span className="font-bold">{displayName}</span>
                {/* レベル */}
                <span
                  className="text-sm text-ghost-text-muted"
                  data-testid={`swap-ghost-level-${index}`}
                >
                  Lv.{ghost.level}
                </span>
                {/* 状態表示 */}
                {isCurrent && (
                  <span
                    className="text-xs text-ghost-info"
                    data-testid={`swap-ghost-current-${index}`}
                  >
                    バトル中
                  </span>
                )}
                {isFainted && (
                  <span
                    className="text-xs text-ghost-danger"
                    data-testid={`swap-ghost-fainted-${index}`}
                  >
                    ひんし
                  </span>
                )}
              </div>
              {/* HP表示 */}
              <div className="flex items-center gap-2">
                <div className="w-20 overflow-hidden rounded-full bg-ghost-bg">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      hpPercentage > 50
                        ? "bg-ghost-success"
                        : hpPercentage > 20
                          ? "bg-ghost-warning"
                          : "bg-ghost-danger"
                    }`}
                    style={{ width: `${hpPercentage}%` }}
                    data-testid={`swap-ghost-hp-bar-${index}`}
                  />
                </div>
                <span
                  className="w-16 text-right text-sm text-ghost-text-muted"
                  data-testid={`swap-ghost-hp-${index}`}
                >
                  {ghost.currentHp}/{ghost.maxHp}
                </span>
              </div>
            </button>
          );
        })}

        {/* もどるボタン */}
        <button
          type="button"
          onClick={() => handleGhostClick(backIndex)}
          className={`flex items-center justify-center rounded-lg border-2 p-3 transition-all ${
            selectedIndex === backIndex
              ? "border-ghost-primary bg-ghost-primary/20 text-ghost-text-bright"
              : "border-ghost-border bg-ghost-surface text-ghost-text"
          } cursor-pointer hover:border-ghost-primary-light`}
          data-testid="swap-back"
          data-selected={selectedIndex === backIndex}
        >
          <span className="font-bold">もどる</span>
        </button>
      </div>
    </div>
  );
}
