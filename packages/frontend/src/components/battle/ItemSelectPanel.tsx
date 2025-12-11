import type { InventoryEntry, Item, ItemCategory } from "@ghost-game/shared";
import { useCallback, useEffect, useState } from "react";

/**
 * 表示用のアイテム情報
 */
export interface DisplayItem {
  item: Item;
  entry: InventoryEntry;
}

/**
 * アイテム選択パネルのProps
 */
export interface ItemSelectPanelProps {
  /** 表示するアイテム一覧 */
  items: DisplayItem[];
  /** アイテム選択時のコールバック */
  onSelectItem: (itemId: string) => void;
  /** 戻るボタン押下時のコールバック */
  onBack: () => void;
  /** 初期選択インデックス */
  initialSelectedIndex?: number;
  /** キー入力（親からの入力） */
  onKeyInput?: string;
}

/**
 * カテゴリに応じた背景色クラス
 */
const CATEGORY_COLORS: Record<ItemCategory, string> = {
  healing: "bg-green-500",
  capture: "bg-blue-500",
  other: "bg-gray-400",
};

/**
 * カテゴリの日本語名
 */
const CATEGORY_NAMES: Record<ItemCategory, string> = {
  healing: "回復",
  capture: "捕獲",
  other: "その他",
};

/**
 * アイテム選択パネルコンポーネント
 *
 * - 使用可能なアイテム一覧の表示
 * - 所持数の表示
 * - 所持数0のアイテムは使用不可表示
 */
export function ItemSelectPanel({
  items,
  onSelectItem,
  onBack,
  initialSelectedIndex = 0,
  onKeyInput,
}: ItemSelectPanelProps) {
  // 「もどる」を含めた選択肢の数
  const totalItems = items.length + 1;
  const backIndex = items.length;

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
            const displayItem = items[selectedIndex];
            // 所持数が0の場合は選択不可
            if (displayItem.entry.quantity > 0) {
              onSelectItem(displayItem.entry.itemId);
            }
          }
          break;
        }
      }
    },
    [selectedIndex, items, totalItems, backIndex, onSelectItem, onBack],
  );

  // 親からのキー入力を処理
  // biome-ignore lint/correctness/useExhaustiveDependencies: handleKeyInputは意図的に除外（onKeyInputの変更時のみ実行、無限ループ防止）
  useEffect(() => {
    if (onKeyInput) {
      handleKeyInput(onKeyInput);
    }
  }, [onKeyInput]);

  // アイテムクリック
  const handleItemClick = (index: number) => {
    if (index === backIndex) {
      onBack();
      return;
    }

    const displayItem = items[index];
    // 所持数が0の場合は選択不可
    if (displayItem.entry.quantity <= 0) {
      return;
    }

    setSelectedIndex(index);
    onSelectItem(displayItem.entry.itemId);
  };

  return (
    <div className="flex h-full flex-col p-4" data-testid="item-select-panel">
      {/* アイテム一覧 */}
      <div className="flex flex-1 flex-col gap-2">
        {items.map((displayItem, index) => {
          const isSelected = selectedIndex === index;
          const isDisabled = displayItem.entry.quantity <= 0;

          return (
            <button
              type="button"
              key={displayItem.item.id}
              onClick={() => handleItemClick(index)}
              disabled={isDisabled}
              className={`flex items-center justify-between rounded-lg border-2 p-3 transition-all ${
                isSelected
                  ? "border-ghost-primary bg-ghost-primary/20 text-ghost-text-bright"
                  : "border-ghost-border bg-ghost-surface text-ghost-text"
              } ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-ghost-primary-light"}`}
              data-testid={`item-${displayItem.item.id}`}
              data-selected={isSelected}
              data-disabled={isDisabled}
            >
              <div className="flex items-center gap-3">
                {/* カテゴリバッジ */}
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold text-white ${CATEGORY_COLORS[displayItem.item.category]}`}
                  data-testid={`item-category-${displayItem.item.id}`}
                >
                  {CATEGORY_NAMES[displayItem.item.category]}
                </span>
                {/* アイテム名 */}
                <span className="font-bold">{displayItem.item.name}</span>
              </div>
              {/* 所持数表示 */}
              <span
                className={`text-sm ${isDisabled ? "text-ghost-danger" : "text-ghost-text-muted"}`}
                data-testid={`item-quantity-${displayItem.item.id}`}
              >
                ×{displayItem.entry.quantity}
              </span>
            </button>
          );
        })}

        {/* もどるボタン */}
        <button
          type="button"
          onClick={() => handleItemClick(backIndex)}
          className={`flex items-center justify-center rounded-lg border-2 p-3 transition-all ${
            selectedIndex === backIndex
              ? "border-ghost-primary bg-ghost-primary/20 text-ghost-text-bright"
              : "border-ghost-border bg-ghost-surface text-ghost-text"
          } cursor-pointer hover:border-ghost-primary-light`}
          data-testid="item-back"
          data-selected={selectedIndex === backIndex}
        >
          <span className="font-bold">もどる</span>
        </button>
      </div>
    </div>
  );
}
