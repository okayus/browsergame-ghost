import type { GhostType, OwnedGhost } from "@ghost-game/shared";
import { useState } from "react";
import { useKeyboardHandler } from "../../hooks/useKeyboardHandler";

/**
 * 捕獲成功パネルのProps
 */
export interface CaptureSuccessPanelProps {
  /** 捕獲したゴースト */
  capturedGhost: OwnedGhost;
  /** 現在のパーティ */
  party: OwnedGhost[];
  /** パーティ上限 */
  partyLimit?: number;
  /** ゴースト種族名を取得する関数 */
  getSpeciesName: (speciesId: string) => string;
  /** ゴーストタイプを取得する関数 */
  getSpeciesType: (speciesId: string) => GhostType;
  /** パーティに追加時のコールバック */
  onAddToParty: () => void;
  /** ボックスに送る時のコールバック */
  onSendToBox: () => void;
  /** パーティのゴーストと入れ替え時のコールバック */
  onSwapWithParty: (partyIndex: number) => void;
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

type PanelMode = "success" | "choice" | "swap";

/**
 * 捕獲成功時の処理コンポーネント
 *
 * - パーティ上限チェック
 * - 上限時はボックス送りか入れ替えかの選択肢表示
 * - パーティへの追加処理
 */
export function CaptureSuccessPanel({
  capturedGhost,
  party,
  partyLimit = 6,
  getSpeciesName,
  getSpeciesType,
  onAddToParty,
  onSendToBox,
  onSwapWithParty,
  onKeyInput,
}: CaptureSuccessPanelProps) {
  const isPartyFull = party.length >= partyLimit;
  const [mode, setMode] = useState<PanelMode>(isPartyFull ? "choice" : "success");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const capturedName = capturedGhost.nickname || getSpeciesName(capturedGhost.speciesId);
  const capturedType = getSpeciesType(capturedGhost.speciesId);

  // キー入力処理
  useKeyboardHandler(onKeyInput, (key: string) => {
    // 選択肢の数を計算
    const choiceCount = mode === "choice" ? 2 : mode === "swap" ? party.length + 1 : 1;

    switch (key) {
      case "w":
      case "W":
      case "ArrowUp":
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : choiceCount - 1));
        break;
      case "s":
      case "S":
      case "ArrowDown":
        setSelectedIndex((prev) => (prev < choiceCount - 1 ? prev + 1 : 0));
        break;
      case "Escape":
        if (mode === "swap") {
          setMode("choice");
          setSelectedIndex(0);
        }
        break;
      case "Enter":
      case " ": {
        if (mode === "success") {
          onAddToParty();
        } else if (mode === "choice") {
          if (selectedIndex === 0) {
            onSendToBox();
          } else {
            setMode("swap");
            setSelectedIndex(0);
          }
        } else if (mode === "swap") {
          if (selectedIndex === party.length) {
            // もどる
            setMode("choice");
            setSelectedIndex(0);
          } else {
            onSwapWithParty(selectedIndex);
          }
        }
        break;
      }
    }
  });

  // 成功メッセージ画面（パーティに空きがある場合）
  if (mode === "success") {
    return (
      <div
        className="flex h-full flex-col items-center justify-center p-4"
        data-testid="capture-success-panel"
        data-mode="success"
      >
        <div className="mb-6 text-center">
          <p className="mb-2 text-2xl font-bold text-ghost-success" data-testid="capture-message">
            捕獲成功！
          </p>
          <div className="flex items-center justify-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-xs font-bold text-white ${TYPE_COLORS[capturedType]}`}
            >
              {TYPE_NAMES[capturedType]}
            </span>
            <span className="text-xl text-ghost-text-bright" data-testid="captured-ghost-name">
              {capturedName}
            </span>
            <span className="text-ghost-text-muted">Lv.{capturedGhost.level}</span>
          </div>
          <p className="mt-2 text-ghost-text-muted">をパーティに加えた！</p>
        </div>

        <button
          type="button"
          onClick={onAddToParty}
          className="rounded-lg border-2 border-ghost-primary bg-ghost-primary/20 px-8 py-3 font-bold text-ghost-text-bright transition-all hover:bg-ghost-primary/30"
          data-testid="confirm-button"
          data-selected="true"
        >
          OK
        </button>
      </div>
    );
  }

  // 選択画面（パーティが満杯の場合）
  if (mode === "choice") {
    return (
      <div
        className="flex h-full flex-col p-4"
        data-testid="capture-success-panel"
        data-mode="choice"
      >
        <div className="mb-4 text-center">
          <p className="mb-2 text-2xl font-bold text-ghost-success" data-testid="capture-message">
            捕獲成功！
          </p>
          <div className="flex items-center justify-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-xs font-bold text-white ${TYPE_COLORS[capturedType]}`}
            >
              {TYPE_NAMES[capturedType]}
            </span>
            <span className="text-xl text-ghost-text-bright" data-testid="captured-ghost-name">
              {capturedName}
            </span>
            <span className="text-ghost-text-muted">Lv.{capturedGhost.level}</span>
          </div>
          <p className="mt-2 text-ghost-warning" data-testid="party-full-message">
            パーティがいっぱいです
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <button
            type="button"
            onClick={onSendToBox}
            className={`rounded-lg border-2 p-3 transition-all ${
              selectedIndex === 0
                ? "border-ghost-primary bg-ghost-primary/20 text-ghost-text-bright"
                : "border-ghost-border bg-ghost-surface text-ghost-text"
            } cursor-pointer hover:border-ghost-primary-light`}
            data-testid="send-to-box-button"
            data-selected={selectedIndex === 0}
          >
            <span className="font-bold">ボックスに送る</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("swap");
              setSelectedIndex(0);
            }}
            className={`rounded-lg border-2 p-3 transition-all ${
              selectedIndex === 1
                ? "border-ghost-primary bg-ghost-primary/20 text-ghost-text-bright"
                : "border-ghost-border bg-ghost-surface text-ghost-text"
            } cursor-pointer hover:border-ghost-primary-light`}
            data-testid="swap-button"
            data-selected={selectedIndex === 1}
          >
            <span className="font-bold">パーティと入れ替える</span>
          </button>
        </div>
      </div>
    );
  }

  // 入れ替え選択画面
  return (
    <div className="flex h-full flex-col p-4" data-testid="capture-success-panel" data-mode="swap">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-ghost-text-bright">入れ替えるゴーストを選択</h2>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {party.map((ghost, index) => {
          const isSelected = selectedIndex === index;
          const speciesName = getSpeciesName(ghost.speciesId);
          const speciesType = getSpeciesType(ghost.speciesId);
          const displayName = ghost.nickname || speciesName;

          return (
            <button
              type="button"
              key={ghost.id}
              onClick={() => onSwapWithParty(index)}
              className={`flex items-center justify-between rounded-lg border-2 p-3 transition-all ${
                isSelected
                  ? "border-ghost-primary bg-ghost-primary/20 text-ghost-text-bright"
                  : "border-ghost-border bg-ghost-surface text-ghost-text"
              } cursor-pointer hover:border-ghost-primary-light`}
              data-testid={`swap-target-${index}`}
              data-selected={isSelected}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold text-white ${TYPE_COLORS[speciesType]}`}
                >
                  {TYPE_NAMES[speciesType]}
                </span>
                <span className="font-bold">{displayName}</span>
                <span className="text-sm text-ghost-text-muted">Lv.{ghost.level}</span>
              </div>
              <span className="text-sm text-ghost-text-muted">
                {ghost.currentHp}/{ghost.maxHp}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => {
            setMode("choice");
            setSelectedIndex(0);
          }}
          className={`flex items-center justify-center rounded-lg border-2 p-3 transition-all ${
            selectedIndex === party.length
              ? "border-ghost-primary bg-ghost-primary/20 text-ghost-text-bright"
              : "border-ghost-border bg-ghost-surface text-ghost-text"
          } cursor-pointer hover:border-ghost-primary-light`}
          data-testid="swap-back"
          data-selected={selectedIndex === party.length}
        >
          <span className="font-bold">もどる</span>
        </button>
      </div>
    </div>
  );
}
