import { useCallback, useEffect, useState } from "react";

/**
 * メニュー項目の種類
 */
export type MenuItem = "party" | "items" | "save" | "settings" | "close";

/**
 * メニュー項目情報
 */
interface MenuItemInfo {
  id: MenuItem;
  label: string;
  description: string;
  disabled?: boolean;
}

/**
 * メニュー項目一覧
 */
const MENU_ITEMS: MenuItemInfo[] = [
  { id: "party", label: "パーティ", description: "ゴーストの状態を確認する" },
  { id: "items", label: "アイテム", description: "持っているアイテムを確認する" },
  { id: "save", label: "セーブ", description: "ゲームを保存する", disabled: true },
  { id: "settings", label: "設定", description: "ゲーム設定を変更する", disabled: true },
  { id: "close", label: "とじる", description: "メニューを閉じてマップに戻る" },
];

/**
 * メニュー画面のProps
 */
export interface MenuScreenProps {
  /** メニュー項目選択時のコールバック */
  onSelectItem: (item: MenuItem) => void;
  /** メニューを閉じる時のコールバック */
  onClose: () => void;
  /** キー入力（親からの入力） */
  onKeyInput?: string;
}

/**
 * メニュー画面コンポーネント
 *
 * - パーティ、アイテム、セーブ、設定、とじるの項目表示
 * - キーボードでの選択操作（W/S、矢印キー、Enter、Escape）
 * - 選択時のアクション発火
 */
export function MenuScreen({ onSelectItem, onClose, onKeyInput }: MenuScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // キー入力処理
  const handleKeyInput = useCallback(
    (key: string) => {
      switch (key) {
        case "w":
        case "W":
        case "ArrowUp":
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : MENU_ITEMS.length - 1));
          break;
        case "s":
        case "S":
        case "ArrowDown":
          setSelectedIndex((prev) => (prev < MENU_ITEMS.length - 1 ? prev + 1 : 0));
          break;
        case "Escape":
          onClose();
          break;
        case "Enter":
        case " ": {
          const item = MENU_ITEMS[selectedIndex];
          if (!item.disabled) {
            if (item.id === "close") {
              onClose();
            } else {
              onSelectItem(item.id);
            }
          }
          break;
        }
      }
    },
    [selectedIndex, onSelectItem, onClose],
  );

  // 親からのキー入力を処理
  // biome-ignore lint/correctness/useExhaustiveDependencies: handleKeyInputは意図的に除外（onKeyInputの変更時のみ実行、無限ループ防止）
  useEffect(() => {
    if (onKeyInput) {
      handleKeyInput(onKeyInput);
    }
  }, [onKeyInput]);

  // 項目クリック
  const handleItemClick = (index: number) => {
    const item = MENU_ITEMS[index];
    if (item.disabled) {
      return;
    }

    setSelectedIndex(index);
    if (item.id === "close") {
      onClose();
    } else {
      onSelectItem(item.id);
    }
  };

  return (
    <div
      className="flex h-full w-full items-center justify-center bg-ghost-bg/90"
      data-testid="menu-screen"
    >
      {/* メニューパネル */}
      <div className="w-80 rounded-lg border-4 border-ghost-primary bg-ghost-surface p-4 shadow-lg">
        {/* タイトル */}
        <h2 className="mb-4 text-center text-2xl font-bold text-ghost-text-bright">メニュー</h2>

        {/* メニュー項目 */}
        <div className="flex flex-col gap-2">
          {MENU_ITEMS.map((item, index) => {
            const isSelected = selectedIndex === index;
            const isDisabled = item.disabled;

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => handleItemClick(index)}
                disabled={isDisabled}
                className={`flex items-center justify-between rounded-lg border-2 p-3 transition-all ${
                  isSelected
                    ? "border-ghost-primary bg-ghost-primary/20 text-ghost-text-bright"
                    : "border-ghost-border bg-ghost-surface text-ghost-text"
                } ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-ghost-primary-light"}`}
                data-testid={`menu-item-${item.id}`}
                data-selected={isSelected}
                data-disabled={isDisabled}
              >
                <span className="text-lg font-bold">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* 選択中の項目説明 */}
        <div
          className="mt-4 rounded bg-ghost-bg p-2 text-center text-sm text-ghost-text-muted"
          data-testid="menu-description"
        >
          {MENU_ITEMS[selectedIndex].description}
        </div>

        {/* 操作説明 */}
        <div className="mt-2 text-center text-xs text-ghost-text-muted">
          ↑↓: 選択 / Enter: 決定 / Esc: 閉じる
        </div>
      </div>
    </div>
  );
}
