import type { InventoryEntry, Item } from "@ghost-game/shared";
import { useCallback, useEffect, useState } from "react";

/**
 * 表示用の捕獲アイテム情報
 */
export interface DisplayCaptureItem {
  item: Item;
  entry: InventoryEntry;
}

/**
 * 捕獲アイテム選択パネルのProps
 */
export interface CaptureItemPanelProps {
  /** 表示する捕獲アイテム一覧（captureカテゴリのみ） */
  items: DisplayCaptureItem[];
  /** アイテム選択時のコールバック（捕獲判定を呼び出す） */
  onSelectItem: (itemId: string) => void;
  /** 戻るボタン押下時のコールバック */
  onBack: () => void;
  /** 初期選択インデックス */
  initialSelectedIndex?: number;
  /** キー入力（親からの入力） */
  onKeyInput?: string;
}

/**
 * 捕獲アイテム選択パネルコンポーネント
 *
 * - 捕獲系アイテムのみ表示
 * - 捕獲率ボーナスの表示
 * - 使用時の捕獲判定呼び出し
 */
export function CaptureItemPanel({
  items,
  onSelectItem,
  onBack,
  initialSelectedIndex = 0,
  onKeyInput,
}: CaptureItemPanelProps) {
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
    <div className="flex h-full flex-col p-4" data-testid="capture-item-panel">
      {/* ヘッダー */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-ghost-text-bright">捕獲アイテムを選択</h2>
      </div>

      {/* アイテム一覧 */}
      <div className="flex flex-1 flex-col gap-2">
        {items.length === 0 ? (
          <div className="py-4 text-center text-ghost-text-muted" data-testid="capture-no-items">
            捕獲アイテムがありません
          </div>
        ) : (
          items.map((displayItem, index) => {
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
                data-testid={`capture-item-${displayItem.item.id}`}
                data-selected={isSelected}
                data-disabled={isDisabled}
              >
                <div className="flex flex-col items-start gap-1">
                  {/* アイテム名 */}
                  <span className="font-bold">{displayItem.item.name}</span>
                  {/* 説明 */}
                  {displayItem.item.description && (
                    <span
                      className="text-xs text-ghost-text-muted"
                      data-testid={`capture-item-desc-${displayItem.item.id}`}
                    >
                      {displayItem.item.description}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {/* 捕獲率ボーナス */}
                  <span
                    className="text-sm text-ghost-info"
                    data-testid={`capture-item-bonus-${displayItem.item.id}`}
                  >
                    +{displayItem.item.effectValue}%
                  </span>
                  {/* 所持数表示 */}
                  <span
                    className={`text-sm ${isDisabled ? "text-ghost-danger" : "text-ghost-text-muted"}`}
                    data-testid={`capture-item-quantity-${displayItem.item.id}`}
                  >
                    ×{displayItem.entry.quantity}
                  </span>
                </div>
              </button>
            );
          })
        )}

        {/* もどるボタン */}
        <button
          type="button"
          onClick={() => handleItemClick(backIndex)}
          className={`flex items-center justify-center rounded-lg border-2 p-3 transition-all ${
            selectedIndex === backIndex
              ? "border-ghost-primary bg-ghost-primary/20 text-ghost-text-bright"
              : "border-ghost-border bg-ghost-surface text-ghost-text"
          } cursor-pointer hover:border-ghost-primary-light`}
          data-testid="capture-back"
          data-selected={selectedIndex === backIndex}
        >
          <span className="font-bold">もどる</span>
        </button>
      </div>
    </div>
  );
}
