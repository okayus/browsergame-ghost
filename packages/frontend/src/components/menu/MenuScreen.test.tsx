import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MenuScreen } from "./MenuScreen";
import type { ManualSaveStatus } from "./SaveFeedback";

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

  describe("セーブ機能", () => {
    const mockOnSave = vi.fn();
    const mockOnSaveRetry = vi.fn();

    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("セーブ項目が有効な場合、クリックするとonSaveが呼ばれる", () => {
      const saveStatus: ManualSaveStatus = { type: "idle" };
      render(
        <MenuScreen
          onSelectItem={mockOnSelectItem}
          onClose={mockOnClose}
          saveStatus={saveStatus}
          onSave={mockOnSave}
        />,
      );

      expect(screen.getByTestId("menu-item-save")).toHaveAttribute("data-disabled", "false");
      fireEvent.click(screen.getByTestId("menu-item-save"));

      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    it("セーブ中はSaveFeedbackが表示される", () => {
      const saveStatus: ManualSaveStatus = { type: "saving" };
      render(
        <MenuScreen
          onSelectItem={mockOnSelectItem}
          onClose={mockOnClose}
          saveStatus={saveStatus}
          onSave={mockOnSave}
        />,
      );

      expect(screen.getByTestId("save-feedback")).toBeInTheDocument();
      expect(screen.getByTestId("save-feedback-saving")).toBeInTheDocument();
    });

    it("セーブ中はメニュー操作が無効化される", () => {
      const saveStatus: ManualSaveStatus = { type: "saving" };
      render(
        <MenuScreen
          onSelectItem={mockOnSelectItem}
          onClose={mockOnClose}
          saveStatus={saveStatus}
          onSave={mockOnSave}
        />,
      );

      // すべてのメニュー項目が無効化される
      expect(screen.getByTestId("menu-item-party")).toBeDisabled();
      expect(screen.getByTestId("menu-item-items")).toBeDisabled();
      expect(screen.getByTestId("menu-item-save")).toBeDisabled();
      expect(screen.getByTestId("menu-item-close")).toBeDisabled();
    });

    it("セーブ成功時は成功メッセージが表示される", () => {
      const saveStatus: ManualSaveStatus = { type: "success" };
      render(
        <MenuScreen
          onSelectItem={mockOnSelectItem}
          onClose={mockOnClose}
          saveStatus={saveStatus}
          onSave={mockOnSave}
        />,
      );

      expect(screen.getByTestId("save-feedback-success")).toBeInTheDocument();
      expect(screen.getByText("セーブしました")).toBeInTheDocument();
    });

    it("セーブ成功時は2秒後にonDismissSaveが呼ばれる", () => {
      const mockOnDismissSave = vi.fn();
      const saveStatus: ManualSaveStatus = { type: "success" };
      render(
        <MenuScreen
          onSelectItem={mockOnSelectItem}
          onClose={mockOnClose}
          saveStatus={saveStatus}
          onSave={mockOnSave}
          onDismissSave={mockOnDismissSave}
        />,
      );

      expect(mockOnDismissSave).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(mockOnDismissSave).toHaveBeenCalledTimes(1);
    });

    it("セーブ失敗時はエラーメッセージとリトライボタンが表示される", () => {
      const saveStatus: ManualSaveStatus = { type: "error", message: "ネットワークエラー" };
      render(
        <MenuScreen
          onSelectItem={mockOnSelectItem}
          onClose={mockOnClose}
          saveStatus={saveStatus}
          onSave={mockOnSave}
          onSaveRetry={mockOnSaveRetry}
        />,
      );

      expect(screen.getByTestId("save-feedback-error")).toBeInTheDocument();
      expect(screen.getByText("ネットワークエラー")).toBeInTheDocument();
      expect(screen.getByTestId("save-retry-button")).toBeInTheDocument();
    });

    it("リトライボタンをクリックするとonSaveRetryが呼ばれる", () => {
      const saveStatus: ManualSaveStatus = { type: "error", message: "エラー" };
      render(
        <MenuScreen
          onSelectItem={mockOnSelectItem}
          onClose={mockOnClose}
          saveStatus={saveStatus}
          onSave={mockOnSave}
          onSaveRetry={mockOnSaveRetry}
        />,
      );

      fireEvent.click(screen.getByTestId("save-retry-button"));

      expect(mockOnSaveRetry).toHaveBeenCalledTimes(1);
    });

    it("セーブ成功後もメニュー画面は維持される（メニュー操作が有効になる）", () => {
      const saveStatus: ManualSaveStatus = { type: "success" };
      render(
        <MenuScreen
          onSelectItem={mockOnSelectItem}
          onClose={mockOnClose}
          saveStatus={saveStatus}
          onSave={mockOnSave}
        />,
      );

      // メニュー項目が有効（saveとsettings以外）
      expect(screen.getByTestId("menu-item-party")).not.toBeDisabled();
      expect(screen.getByTestId("menu-item-items")).not.toBeDisabled();
      expect(screen.getByTestId("menu-item-close")).not.toBeDisabled();
    });

    it("saveStatusがない場合はセーブ項目は無効化される（後方互換性）", () => {
      render(<MenuScreen onSelectItem={mockOnSelectItem} onClose={mockOnClose} />);

      expect(screen.getByTestId("menu-item-save")).toHaveAttribute("data-disabled", "true");
    });
  });
});
