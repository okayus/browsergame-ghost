import { useKeyboardHandler } from "../../hooks/useKeyboardHandler";

/**
 * 捕獲失敗パネルのProps
 */
export interface CaptureFailurePanelProps {
  /** 捕獲対象のゴースト名 */
  ghostName: string;
  /** 使用したアイテム名 */
  itemName: string;
  /** 続行時のコールバック（敵のターンへ） */
  onContinue: () => void;
  /** キー入力（親からの入力） */
  onKeyInput?: string;
}

/**
 * 捕獲失敗パネルコンポーネント
 *
 * - 捕獲失敗メッセージの表示
 * - 消費したアイテムの表示
 * - バトル継続（敵のターン）への遷移
 */
export function CaptureFailurePanel({
  ghostName,
  itemName,
  onContinue,
  onKeyInput,
}: CaptureFailurePanelProps) {
  // キー入力処理
  useKeyboardHandler(onKeyInput, (key: string) => {
    if (key === "Enter" || key === " ") {
      onContinue();
    }
  });

  return (
    <div
      className="flex h-full flex-col items-center justify-center p-4"
      data-testid="capture-failure-panel"
    >
      <div className="mb-6 text-center">
        <p className="mb-4 text-2xl font-bold text-ghost-danger" data-testid="failure-message">
          捕獲失敗！
        </p>
        <p className="mb-2 text-ghost-text" data-testid="ghost-message">
          <span className="font-bold text-ghost-text-bright">{ghostName}</span>
          <span>は逃げ出した！</span>
        </p>
        <p className="text-sm text-ghost-text-muted" data-testid="item-consumed-message">
          {itemName}を使用した...
        </p>
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
