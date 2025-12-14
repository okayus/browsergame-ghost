import type { GhostSpecies, Move, OwnedGhost } from "@ghost-game/shared";
import { useCallback, useEffect, useState } from "react";
import { GhostDetailPanel } from "./GhostDetailPanel";
import { GhostSummaryCard } from "./GhostSummaryCard";

/**
 * パーティ画面の表示モード
 */
type PartyScreenMode = "list" | "detail";

/**
 * パーティ画面のProps
 */
export interface PartyScreenProps {
  /** パーティ内のゴースト一覧 */
  party: OwnedGhost[];
  /** ゴースト種族データのマップ */
  speciesMap: Record<string, GhostSpecies>;
  /** 技データ配列 */
  moves: Move[];
  /** 戻るボタン押下時のコールバック */
  onClose: () => void;
  /** 初期選択インデックス */
  initialSelectedIndex?: number;
  /** キー入力（親からの入力） */
  onKeyInput?: string;
}

/**
 * パーティ画面コンポーネント
 *
 * - パーティ内ゴースト一覧の表示（GhostSummaryCard使用）
 * - 選択したゴーストの詳細表示（GhostDetailPanel使用）
 * - キーボード操作（上下移動、決定、キャンセル）に対応
 */
export function PartyScreen({
  party,
  speciesMap,
  moves,
  onClose,
  initialSelectedIndex = 0,
  onKeyInput,
}: PartyScreenProps) {
  // 「もどる」を含めた選択肢の数
  const totalItems = party.length + 1;
  const backIndex = party.length;

  const [mode, setMode] = useState<PartyScreenMode>("list");
  const [selectedIndex, setSelectedIndex] = useState(
    Math.min(initialSelectedIndex, totalItems - 1),
  );

  // 詳細表示するゴーストのID
  const selectedGhost = selectedIndex < party.length ? party[selectedIndex] : null;

  // 詳細パネルを閉じる
  const closeDetail = useCallback(() => {
    setMode("list");
  }, []);

  // キー入力処理
  const handleKeyInput = useCallback(
    (key: string) => {
      // 詳細モードの場合
      if (mode === "detail") {
        if (key === "Escape") {
          closeDetail();
        }
        return;
      }

      // 一覧モードの場合
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
          onClose();
          break;
        case "Enter":
        case " ": {
          if (selectedIndex === backIndex) {
            onClose();
          } else {
            // ゴースト詳細を表示
            setMode("detail");
          }
          break;
        }
      }
    },
    [mode, selectedIndex, totalItems, backIndex, onClose, closeDetail],
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
    setSelectedIndex(index);
    setMode("detail");
  };

  // もどるボタンクリック
  const handleBackClick = () => {
    onClose();
  };

  return (
    <div className="flex h-full flex-col bg-ghost-bg p-4" data-testid="party-screen">
      {/* ヘッダー */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-ghost-text-bright">パーティ</h2>
      </div>

      {/* 詳細モード */}
      {mode === "detail" && selectedGhost && (
        <div className="flex flex-1 items-center justify-center">
          <GhostDetailPanel
            ghost={selectedGhost}
            species={speciesMap[selectedGhost.speciesId]}
            moves={moves}
            onClose={closeDetail}
          />
        </div>
      )}

      {/* 一覧モード */}
      {mode === "list" && (
        <>
          {/* ゴースト一覧 */}
          <div className="flex flex-1 flex-col gap-2">
            {party.map((ghost, index) => {
              const species = speciesMap[ghost.speciesId];
              const isSelected = selectedIndex === index;

              return (
                <GhostSummaryCard
                  key={ghost.id}
                  ghost={ghost}
                  species={species}
                  isSelected={isSelected}
                  onClick={() => handleGhostClick(index)}
                />
              );
            })}

            {/* もどるボタン */}
            <button
              type="button"
              onClick={handleBackClick}
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
            選択してステータスを確認 / Esc: もどる
          </div>
        </>
      )}
    </div>
  );
}
