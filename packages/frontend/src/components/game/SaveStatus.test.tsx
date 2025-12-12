import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SaveStatus } from "./SaveStatus";

describe("SaveStatus", () => {
  describe("レンダリング", () => {
    it("コンテナが表示される", () => {
      render(<SaveStatus />);
      expect(screen.getByTestId("save-status")).toBeInTheDocument();
    });

    it("セーブ中の時はセーブ中表示", () => {
      render(<SaveStatus saving={true} />);
      expect(screen.getByText("セーブ中...")).toBeInTheDocument();
    });

    it("保留中キャッシュがある時は警告表示", () => {
      render(<SaveStatus hasPendingCache={true} />);
      expect(screen.getByText("オフライン")).toBeInTheDocument();
    });

    it("lastSavedAtがnullの時は未セーブ表示", () => {
      render(<SaveStatus lastSavedAt={null} />);
      expect(screen.getByText("未セーブ")).toBeInTheDocument();
    });

    it("lastSavedAtがある時は時刻表示", () => {
      const now = new Date();
      render(<SaveStatus lastSavedAt={now} />);
      expect(screen.getByTestId("save-status")).toHaveTextContent(/最終セーブ/);
    });
  });

  describe("時刻フォーマット", () => {
    it("今の時刻の場合は「たった今」と表示", () => {
      const now = new Date();
      render(<SaveStatus lastSavedAt={now} />);
      expect(screen.getByText(/たった今/)).toBeInTheDocument();
    });

    it("1分前の場合は「1分前」と表示", () => {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      render(<SaveStatus lastSavedAt={oneMinuteAgo} />);
      expect(screen.getByText(/1分前/)).toBeInTheDocument();
    });

    it("5分前の場合は「5分前」と表示", () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      render(<SaveStatus lastSavedAt={fiveMinutesAgo} />);
      expect(screen.getByText(/5分前/)).toBeInTheDocument();
    });
  });

  describe("スタイリング", () => {
    it("セーブ中はアニメーションが表示される", () => {
      render(<SaveStatus saving={true} />);
      expect(screen.getByTestId("save-spinner")).toBeInTheDocument();
    });

    it("オフライン時は警告アイコンが表示される", () => {
      render(<SaveStatus hasPendingCache={true} />);
      expect(screen.getByTestId("offline-warning")).toBeInTheDocument();
    });

    it("正常時はチェックアイコンが表示される", () => {
      const now = new Date();
      render(<SaveStatus lastSavedAt={now} />);
      expect(screen.getByTestId("save-check")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("output要素が使用されている", () => {
      render(<SaveStatus />);
      const container = screen.getByTestId("save-status");
      expect(container.tagName.toLowerCase()).toBe("output");
    });
  });
});
