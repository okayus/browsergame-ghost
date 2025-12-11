import type { GhostType, OwnedGhost } from "@ghost-game/shared";
import { useCallback, useEffect, useState } from "react";

/**
 * パーティ画面のProps
 */
export interface PartyScreenProps {
  /** パーティ内のゴースト一覧 */
  party: OwnedGhost[];
  /** ゴースト種族名を取得する関数 */
  getSpeciesName: (speciesId: string) => string;
  /** ゴーストタイプを取得する関数 */
  getSpeciesType: (speciesId: string) => GhostType;
  /** 順番変更時のコールバック */
  onReorder?: (fromIndex: number, toIndex: number) => void;
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
 * パーティ画面コンポーネント
 *
 * - パーティ内ゴースト一覧の表示
 * - 各ゴーストのステータス（HP、レベル、タイプ）表示
 * - ゴーストの順番変更機能
 */
export function PartyScreen({
  party,
  getSpeciesName,
  getSpeciesType,
  onReorder,
  onBack,
  initialSelectedIndex = 0,
  onKeyInput,
}: PartyScreenProps) {
  // 「もどる」を含めた選択肢の数
  const totalItems = party.length + 1;
  const backIndex = party.length;

  const [selectedIndex, setSelectedIndex] = useState(
    Math.min(initialSelectedIndex, totalItems - 1),
  );
  const [swapSourceIndex, setSwapSourceIndex] = useState<number | null>(null);

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
          if (swapSourceIndex !== null) {
            // 入れ替えモード中はキャンセル
            setSwapSourceIndex(null);
          } else {
            onBack();
          }
          break;
        case "Enter":
        case " ": {
          if (selectedIndex === backIndex) {
            if (swapSourceIndex !== null) {
              setSwapSourceIndex(null);
            }
            onBack();
          } else if (swapSourceIndex === null) {
            // 入れ替え元を選択
            setSwapSourceIndex(selectedIndex);
          } else if (swapSourceIndex === selectedIndex) {
            // 同じゴーストを選択した場合はキャンセル
            setSwapSourceIndex(null);
          } else {
            // 入れ替え実行
            onReorder?.(swapSourceIndex, selectedIndex);
            setSwapSourceIndex(null);
          }
          break;
        }
      }
    },
    [selectedIndex, totalItems, backIndex, swapSourceIndex, onReorder, onBack],
  );

  // 親からのキー入力を処理
  // biome-ignore lint/correctness/useExhaustiveDependencies: handleKeyInputは意図的に除外（onKeyInputの変更時のみ実行、無限ループ防止）
  useEffect(() => {
    if (onKeyInput) {
      handleKeyInput(onKeyInput);
    }
  }, [onKeyInput]);

  // ゴーストクリック
  const handleGhostClick = (index: number) => {
    if (index === backIndex) {
      if (swapSourceIndex !== null) {
        setSwapSourceIndex(null);
      }
      onBack();
      return;
    }

    setSelectedIndex(index);

    if (swapSourceIndex === null) {
      // 入れ替え元を選択
      setSwapSourceIndex(index);
    } else if (swapSourceIndex === index) {
      // 同じゴーストを選択した場合はキャンセル
      setSwapSourceIndex(null);
    } else {
      // 入れ替え実行
      onReorder?.(swapSourceIndex, index);
      setSwapSourceIndex(null);
    }
  };

  return (
    <div className="flex h-full flex-col bg-ghost-bg p-4" data-testid="party-screen">
      {/* ヘッダー */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-ghost-text-bright">パーティ</h2>
        {swapSourceIndex !== null && (
          <span className="text-sm text-ghost-warning" data-testid="swap-mode-indicator">
            入れ替え先を選択...
          </span>
        )}
      </div>

      {/* ゴースト一覧 */}
      <div className="flex flex-1 flex-col gap-2">
        {party.map((ghost, index) => {
          const isSelected = selectedIndex === index;
          const isSwapSource = swapSourceIndex === index;
          const isFainted = ghost.currentHp <= 0;
          const speciesName = getSpeciesName(ghost.speciesId);
          const speciesType = getSpeciesType(ghost.speciesId);
          const displayName = ghost.nickname || speciesName;
          const hpPercentage = Math.round((ghost.currentHp / ghost.maxHp) * 100);

          return (
            <button
              type="button"
              key={ghost.id}
              onClick={() => handleGhostClick(index)}
              className={`flex items-center justify-between rounded-lg border-2 p-3 transition-all ${
                isSwapSource
                  ? "border-ghost-warning bg-ghost-warning/20 text-ghost-text-bright"
                  : isSelected
                    ? "border-ghost-primary bg-ghost-primary/20 text-ghost-text-bright"
                    : "border-ghost-border bg-ghost-surface text-ghost-text"
              } ${isFainted ? "opacity-50" : ""} cursor-pointer hover:border-ghost-primary-light`}
              data-testid={`party-ghost-${index}`}
              data-selected={isSelected}
              data-swap-source={isSwapSource}
              data-fainted={isFainted}
            >
              <div className="flex items-center gap-3">
                {/* 順番表示 */}
                <span className="w-6 text-center text-sm text-ghost-text-muted">{index + 1}</span>
                {/* タイプバッジ */}
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold text-white ${TYPE_COLORS[speciesType]}`}
                  data-testid={`party-ghost-type-${index}`}
                >
                  {TYPE_NAMES[speciesType]}
                </span>
                {/* 名前 */}
                <span className="font-bold">{displayName}</span>
                {/* レベル */}
                <span
                  className="text-sm text-ghost-text-muted"
                  data-testid={`party-ghost-level-${index}`}
                >
                  Lv.{ghost.level}
                </span>
              </div>
              {/* HP表示 */}
              <div className="flex items-center gap-2">
                <div className="w-24 overflow-hidden rounded-full bg-ghost-bg">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      hpPercentage > 50
                        ? "bg-ghost-success"
                        : hpPercentage > 20
                          ? "bg-ghost-warning"
                          : "bg-ghost-danger"
                    }`}
                    style={{ width: `${hpPercentage}%` }}
                    data-testid={`party-ghost-hp-bar-${index}`}
                  />
                </div>
                <span
                  className="w-20 text-right text-sm text-ghost-text-muted"
                  data-testid={`party-ghost-hp-${index}`}
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
          data-testid="party-back"
          data-selected={selectedIndex === backIndex}
        >
          <span className="font-bold">もどる</span>
        </button>
      </div>

      {/* 操作説明 */}
      <div className="mt-4 text-center text-sm text-ghost-text-muted">
        {swapSourceIndex !== null
          ? "別のゴーストを選択して入れ替え / Escapeでキャンセル"
          : "選択して順番を入れ替え"}
      </div>
    </div>
  );
}
