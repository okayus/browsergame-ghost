import { useState } from "react";
import { useKeyboardHandler } from "../../hooks/useKeyboardHandler";

/**
 * 敗北パネルのProps
 */
export interface DefeatPanelProps {
  /** 敗北したゴーストの名前（最後に戦闘不能になったゴースト） */
  lastGhostName?: string;
  /** 所持金の損失額（オプション） */
  moneyLost?: number;
  /** 続行時のコールバック（HP回復、初期位置戻り等の処理を行う） */
  onContinue: () => void;
  /** キー入力（親からの入力） */
  onKeyInput?: string;
}

type PanelPhase = "defeat" | "message" | "recovery";

/**
 * 敗北時のパネルコンポーネント
 *
 * - 敗北メッセージの表示
 * - 所持金損失の表示（オプション）
 * - HP回復・初期位置戻りの案内
 */
export function DefeatPanel({
  lastGhostName,
  moneyLost,
  onContinue,
  onKeyInput,
}: DefeatPanelProps) {
  const [phase, setPhase] = useState<PanelPhase>("defeat");

  // フェーズを進める
  const advancePhase = () => {
    switch (phase) {
      case "defeat":
        setPhase("message");
        break;
      case "message":
        setPhase("recovery");
        break;
      case "recovery":
        onContinue();
        break;
    }
  };

  // キー入力処理
  useKeyboardHandler(onKeyInput, (key: string) => {
    if (key === "Enter" || key === " ") {
      advancePhase();
    }
  });

  // 敗北メッセージ
  if (phase === "defeat") {
    return (
      <div
        className="flex h-full flex-col items-center justify-center p-4"
        data-testid="defeat-panel"
        data-phase="defeat"
      >
        <div className="mb-6 text-center">
          <p className="mb-4 text-3xl font-bold text-ghost-danger" data-testid="defeat-message">
            敗北...
          </p>
          {lastGhostName && (
            <p className="text-lg text-ghost-text" data-testid="last-ghost-message">
              <span className="font-bold text-ghost-text-bright">{lastGhostName}</span>
              <span>は戦闘不能になった...</span>
            </p>
          )}
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

  // 損失メッセージ
  if (phase === "message") {
    return (
      <div
        className="flex h-full flex-col items-center justify-center p-4"
        data-testid="defeat-panel"
        data-phase="message"
      >
        <div className="mb-6 text-center">
          <p className="mb-4 text-xl text-ghost-text">目の前が真っ暗になった...</p>
          {moneyLost !== undefined && moneyLost > 0 && (
            <p className="text-ghost-warning" data-testid="money-lost-message">
              <span className="font-bold">{moneyLost}</span>
              <span>ゴールドを落としてしまった...</span>
            </p>
          )}
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

  // 回復案内
  return (
    <div
      className="flex h-full flex-col items-center justify-center p-4"
      data-testid="defeat-panel"
      data-phase="recovery"
    >
      <div className="mb-6 text-center">
        <p className="mb-2 text-xl text-ghost-text" data-testid="recovery-message">
          ゴーストセンターで回復した
        </p>
        <p className="text-ghost-success">パーティのHPが全回復！</p>
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="rounded-lg border-2 border-ghost-primary bg-ghost-primary/20 px-8 py-3 font-bold text-ghost-text-bright transition-all hover:bg-ghost-primary/30"
        data-testid="continue-button"
      >
        続ける
      </button>
    </div>
  );
}
