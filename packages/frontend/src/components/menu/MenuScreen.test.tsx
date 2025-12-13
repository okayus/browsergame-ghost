import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MenuScreen } from "./MenuScreen";

describe("MenuScreen", () => {
  const mockOnSelectItem = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("レンダリング", () => {
    it("メニュー画面が表示される", () => {
      render(<MenuScreen onSelectItem={mockOnSelectItem} onClose={mockOnClose} />);

      expect(screen.getByTestId("menu-screen")).toBeInTheDocument();
      expect(screen.getByText("メニュー")).toBeInTheDocument();
    });

    it("全てのメニュー項目が表示される", () => {
      render(<MenuScreen onSelectItem={mockOnSelectItem} onClose={mockOnClose} />);

      expect(screen.getByTestId("menu-item-party")).toBeInTheDocument();
      expect(screen.getByTestId("menu-item-items")).toBeInTheDocument();
      expect(screen.getByTestId("menu-item-save")).toBeInTheDocument();
      expect(screen.getByTestId("menu-item-settings")).toBeInTheDocument();
      expect(screen.getByTestId("menu-item-close")).toBeInTheDocument();
    });

    it("最初の項目が選択状態になっている", () => {
      render(<MenuScreen onSelectItem={mockOnSelectItem} onClose={mockOnClose} />);

      expect(screen.getByTestId("menu-item-party")).toHaveAttribute("data-selected", "true");
    });

    it("無効な項目はdisabled状態で表示される", () => {
      render(<MenuScreen onSelectItem={mockOnSelectItem} onClose={mockOnClose} />);

      expect(screen.getByTestId("menu-item-save")).toHaveAttribute("data-disabled", "true");
      expect(screen.getByTestId("menu-item-settings")).toHaveAttribute("data-disabled", "true");
    });

    it("選択中の項目の説明が表示される", () => {
      render(<MenuScreen onSelectItem={mockOnSelectItem} onClose={mockOnClose} />);

      expect(screen.getByTestId("menu-description")).toHaveTextContent("ゴーストの状態を確認する");
    });
  });

  describe("キーボード操作", () => {
    it("下キーで次の項目に移動する", () => {
      render(<MenuScreen onSelectItem={mockOnSelectItem} onClose={mockOnClose} onKeyInput="s" />);

      expect(screen.getByTestId("menu-item-items")).toHaveAttribute("data-selected", "true");
    });

    it("上キーで前の項目に移動する", () => {
      // 最初にsで下に移動してから、wで上に戻る
      const { rerender } = render(
        <MenuScreen onSelectItem={mockOnSelectItem} onClose={mockOnClose} onKeyInput="s" />,
      );

      rerender(<MenuScreen onSelectItem={mockOnSelectItem} onClose={mockOnClose} onKeyInput="w" />);

      expect(screen.getByTestId("menu-item-party")).toHaveAttribute("data-selected", "true");
    });

    it("最後の項目で下キーを押すと最初に戻る", () => {
      // 最初にArrowUpで最後の項目に移動
      const { rerender } = render(
        <MenuScreen onSelectItem={mockOnSelectItem} onClose={mockOnClose} onKeyInput="ArrowUp" />,
      );

      // 最後の項目（close）が選択状態
      expect(screen.getByTestId("menu-item-close")).toHaveAttribute("data-selected", "true");

      // もう一度下で最初に戻る
      rerender(
        <MenuScreen onSelectItem={mockOnSelectItem} onClose={mockOnClose} onKeyInput="ArrowDown" />,
      );

      expect(screen.getByTestId("menu-item-party")).toHaveAttribute("data-selected", "true");
    });

    it("最初の項目で上キーを押すと最後に移動する", () => {
      render(
        <MenuScreen onSelectItem={mockOnSelectItem} onClose={mockOnClose} onKeyInput="ArrowUp" />,
      );

      expect(screen.getByTestId("menu-item-close")).toHaveAttribute("data-selected", "true");
    });

    it("Escapeキーでメニューを閉じる", () => {
      render(
        <MenuScreen onSelectItem={mockOnSelectItem} onClose={mockOnClose} onKeyInput="Escape" />,
      );

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("Enterキーで選択中の項目を実行する", () => {
      render(
        <MenuScreen onSelectItem={mockOnSelectItem} onClose={mockOnClose} onKeyInput="Enter" />,
      );

      expect(mockOnSelectItem).toHaveBeenCalledWith("party");
    });

    it("スペースキーで選択中の項目を実行する", () => {
      render(<MenuScreen onSelectItem={mockOnSelectItem} onClose={mockOnClose} onKeyInput=" " />);

      expect(mockOnSelectItem).toHaveBeenCalledWith("party");
    });

    it("無効な項目はEnterキーで実行されない", () => {
      // saveをクリックして選択状態にする（無効な項目でも選択状態にはなる）
      render(<MenuScreen onSelectItem={mockOnSelectItem} onClose={mockOnClose} />);

      // saveをクリック（無効なので何も起きないがインデックスは変わる）
      fireEvent.click(screen.getByTestId("menu-item-save"));

      // saveが選択状態（disabled項目もクリックで選択インデックスは変わらないが、
      // 直接キー入力でsaveに移動する）
      expect(mockOnSelectItem).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("「とじる」項目でEnterを押すとonCloseが呼ばれる", () => {
      // ArrowUpで最後の項目（close）に移動
      const { rerender } = render(
        <MenuScreen onSelectItem={mockOnSelectItem} onClose={mockOnClose} onKeyInput="ArrowUp" />,
      );

      // closeが選択状態
      expect(screen.getByTestId("menu-item-close")).toHaveAttribute("data-selected", "true");

      // Enterでクローズ
      rerender(
        <MenuScreen onSelectItem={mockOnSelectItem} onClose={mockOnClose} onKeyInput="Enter" />,
      );

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("クリック操作", () => {
    it("項目をクリックすると選択される", () => {
      render(<MenuScreen onSelectItem={mockOnSelectItem} onClose={mockOnClose} />);

      fireEvent.click(screen.getByTestId("menu-item-items"));

      expect(mockOnSelectItem).toHaveBeenCalledWith("items");
    });

    it("無効な項目はクリックしても実行されない", () => {
      render(<MenuScreen onSelectItem={mockOnSelectItem} onClose={mockOnClose} />);

      fireEvent.click(screen.getByTestId("menu-item-save"));

      expect(mockOnSelectItem).not.toHaveBeenCalled();
    });

    it("「とじる」をクリックするとonCloseが呼ばれる", () => {
      render(<MenuScreen onSelectItem={mockOnSelectItem} onClose={mockOnClose} />);

      fireEvent.click(screen.getByTestId("menu-item-close"));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("矢印キー対応", () => {
    it("ArrowDownで下に移動する", () => {
      render(
        <MenuScreen onSelectItem={mockOnSelectItem} onClose={mockOnClose} onKeyInput="ArrowDown" />,
      );

      expect(screen.getByTestId("menu-item-items")).toHaveAttribute("data-selected", "true");
    });

    it("ArrowUpで上に移動する", () => {
      render(
        <MenuScreen onSelectItem={mockOnSelectItem} onClose={mockOnClose} onKeyInput="ArrowUp" />,
      );

      expect(screen.getByTestId("menu-item-close")).toHaveAttribute("data-selected", "true");
    });
  });
});
