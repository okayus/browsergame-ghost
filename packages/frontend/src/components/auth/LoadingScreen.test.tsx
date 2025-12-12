import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingScreen } from "./LoadingScreen";

describe("LoadingScreen", () => {
  describe("レンダリング", () => {
    it("ローディングコンテナが表示される", () => {
      render(<LoadingScreen />);
      expect(screen.getByTestId("loading-screen")).toBeInTheDocument();
    });

    it("デフォルトのローディングテキストが表示される", () => {
      render(<LoadingScreen />);
      expect(screen.getByText("読み込み中...")).toBeInTheDocument();
    });

    it("カスタムメッセージが表示される", () => {
      render(<LoadingScreen message="データを取得中..." />);
      expect(screen.getByText("データを取得中...")).toBeInTheDocument();
    });

    it("ローディングスピナーが表示される", () => {
      render(<LoadingScreen />);
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
  });

  describe("アニメーション", () => {
    it("スピナーにアニメーションクラスが適用されている", () => {
      render(<LoadingScreen />);
      const spinner = screen.getByTestId("loading-spinner");
      expect(spinner).toHaveClass("animate-spin");
    });
  });

  describe("アクセシビリティ", () => {
    it("output要素が使用されている（暗黙的にrole=status）", () => {
      render(<LoadingScreen />);
      const container = screen.getByTestId("loading-screen");
      expect(container.tagName.toLowerCase()).toBe("output");
    });

    it("aria-liveがpoliteに設定されている", () => {
      render(<LoadingScreen />);
      const container = screen.getByTestId("loading-screen");
      expect(container).toHaveAttribute("aria-live", "polite");
    });

    it("aria-busyがtrueに設定されている", () => {
      render(<LoadingScreen />);
      const container = screen.getByTestId("loading-screen");
      expect(container).toHaveAttribute("aria-busy", "true");
    });
  });

  describe("スタイリング", () => {
    it("フルスクリーンで中央揃えのスタイルが適用されている", () => {
      render(<LoadingScreen />);
      const container = screen.getByTestId("loading-screen");
      expect(container).toHaveClass("flex");
      expect(container).toHaveClass("items-center");
      expect(container).toHaveClass("justify-center");
    });
  });
});
