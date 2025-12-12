import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorScreen } from "./ErrorScreen";

describe("ErrorScreen", () => {
  describe("レンダリング", () => {
    it("エラーコンテナが表示される", () => {
      render(<ErrorScreen error="テストエラー" />);
      expect(screen.getByTestId("error-screen")).toBeInTheDocument();
    });

    it("エラータイトルが表示される", () => {
      render(<ErrorScreen error="テストエラー" />);
      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    });

    it("エラーメッセージが表示される", () => {
      render(<ErrorScreen error="テストエラー" />);
      expect(screen.getByText("テストエラー")).toBeInTheDocument();
    });

    it("リトライボタンが表示される", () => {
      render(<ErrorScreen error="テストエラー" />);
      expect(screen.getByTestId("retry-button")).toBeInTheDocument();
    });

    it("デフォルトエラーメッセージが表示される", () => {
      render(<ErrorScreen />);
      expect(screen.getByText("予期しないエラーが発生しました")).toBeInTheDocument();
    });
  });

  describe("コールバック", () => {
    it("リトライボタンクリックでonRetryが呼ばれる", () => {
      const onRetry = vi.fn();
      render(<ErrorScreen error="テストエラー" onRetry={onRetry} />);

      fireEvent.click(screen.getByTestId("retry-button"));
      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe("スタイリング", () => {
    it("フルスクリーンで中央揃えのスタイルが適用されている", () => {
      render(<ErrorScreen error="テストエラー" />);
      const container = screen.getByTestId("error-screen");
      expect(container).toHaveClass("flex");
      expect(container).toHaveClass("items-center");
      expect(container).toHaveClass("justify-center");
    });
  });

  describe("アクセシビリティ", () => {
    it("alertロールが設定されている", () => {
      render(<ErrorScreen error="テストエラー" />);
      const container = screen.getByTestId("error-screen");
      expect(container).toHaveAttribute("role", "alert");
    });
  });
});
