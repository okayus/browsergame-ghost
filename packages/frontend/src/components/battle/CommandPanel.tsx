import { useCallback, useEffect, useState } from "react";

/**
 * バトルコマンドの種類
 */
export type BattleCommand = "fight" | "item" | "capture" | "run";

/**
 * コマンドパネルのProps
 */
export interface CommandPanelProps {
  /** コマンド選択時のコールバック */
  onSelectCommand: (command: BattleCommand) => void;
  /** 捕獲コマンドを有効にするかどうか */
  canCapture?: boolean;
  /** 初期選択インデックス */
  initialSelectedIndex?: number;
  /** キー入力（親からの入力） */
  onKeyInput?: string;
}

/**
 * コマンド情報
 */
interface CommandInfo {
  command: BattleCommand;
  label: string;
  description: string;
}

/**
 * コマンド一覧
 */
const COMMANDS: CommandInfo[] = [
  { command: "fight", label: "たたかう", description: "技を選んで攻撃する" },
  { command: "item", label: "アイテム", description: "アイテムを使う" },
  { command: "capture", label: "捕まえる", description: "ゴーストを捕まえる" },
  { command: "run", label: "逃げる", description: "バトルから逃げる" },
];

/**
 * コマンドパネルコンポーネント
 *
 * - たたかう、アイテム、逃げる、捕まえるの4コマンド表示
 * - キーボードでの選択操作（WASD、矢印キー、Enter）
 * - 選択時のアクション発火
 */
export function CommandPanel({
  onSelectCommand,
  canCapture = true,
  initialSelectedIndex = 0,
  onKeyInput,
}: CommandPanelProps) {
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);

  // キー入力処理
  const handleKeyInput = useCallback(
    (key: string) => {
      switch (key) {
        case "w":
        case "W":
        case "ArrowUp":
          setSelectedIndex((prev) => (prev <= 1 ? prev + 2 : prev - 2));
          break;
        case "s":
        case "S":
        case "ArrowDown":
          setSelectedIndex((prev) => (prev >= 2 ? prev - 2 : prev + 2));
          break;
        case "a":
        case "A":
        case "ArrowLeft":
          setSelectedIndex((prev) => (prev % 2 === 0 ? prev + 1 : prev - 1));
          break;
        case "d":
        case "D":
        case "ArrowRight":
          setSelectedIndex((prev) => (prev % 2 === 0 ? prev + 1 : prev - 1));
          break;
        case "Enter":
        case " ": {
          const command = COMMANDS[selectedIndex];
          if (command.command === "capture" && !canCapture) {
            return;
          }
          onSelectCommand(command.command);
          break;
        }
      }
    },
    [selectedIndex, canCapture, onSelectCommand],
  );

  // 親からのキー入力を処理
  useEffect(() => {
    if (onKeyInput) {
      handleKeyInput(onKeyInput);
    }
    // handleKeyInputは意図的に依存配列から除外（onKeyInputの変更時のみ実行）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onKeyInput]);

  // コマンドクリック
  const handleCommandClick = (index: number) => {
    const command = COMMANDS[index];
    if (command.command === "capture" && !canCapture) {
      return;
    }
    setSelectedIndex(index);
    onSelectCommand(command.command);
  };

  return (
    <div className="flex h-full flex-col p-4" data-testid="command-panel">
      {/* コマンドグリッド */}
      <div className="grid flex-1 grid-cols-2 gap-2">
        {COMMANDS.map((cmd, index) => {
          const isSelected = selectedIndex === index;
          const isDisabled = cmd.command === "capture" && !canCapture;

          return (
            <button
              type="button"
              key={cmd.command}
              onClick={() => handleCommandClick(index)}
              disabled={isDisabled}
              className={`flex items-center justify-center rounded-lg border-2 p-3 transition-all ${
                isSelected
                  ? "border-ghost-primary bg-ghost-primary/20 text-ghost-text-bright"
                  : "border-ghost-border bg-ghost-surface text-ghost-text"
              } ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-ghost-primary-light"}`}
              data-testid={`command-${cmd.command}`}
              data-selected={isSelected}
              data-disabled={isDisabled}
            >
              <span className="text-lg font-bold">{cmd.label}</span>
            </button>
          );
        })}
      </div>

      {/* 選択中のコマンド説明 */}
      <div
        className="mt-2 rounded bg-ghost-bg p-2 text-center text-sm text-ghost-text-muted"
        data-testid="command-description"
      >
        {COMMANDS[selectedIndex].description}
      </div>
    </div>
  );
}
