import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ManualSaveStatus } from "./SaveFeedback";
import { SaveFeedback } from "./SaveFeedback";

describe("SaveFeedback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("idle state", () => {
    it("should not render anything when idle", () => {
      const status: ManualSaveStatus = { type: "idle" };
      const { container } = render(<SaveFeedback status={status} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe("saving state", () => {
    it("should render loading indicator when saving", () => {
      const status: ManualSaveStatus = { type: "saving" };
      render(<SaveFeedback status={status} />);

      expect(screen.getByTestId("save-feedback")).toBeInTheDocument();
      expect(screen.getByTestId("save-feedback-saving")).toBeInTheDocument();
    });

    it("should display saving message", () => {
      const status: ManualSaveStatus = { type: "saving" };
      render(<SaveFeedback status={status} />);

      expect(screen.getByText("セーブ中...")).toBeInTheDocument();
    });

    it("should show loading spinner", () => {
      const status: ManualSaveStatus = { type: "saving" };
      render(<SaveFeedback status={status} />);

      expect(screen.getByTestId("save-spinner")).toBeInTheDocument();
    });
  });

  describe("success state", () => {
    it("should render success message when successful", () => {
      const status: ManualSaveStatus = { type: "success" };
      render(<SaveFeedback status={status} />);

      expect(screen.getByTestId("save-feedback")).toBeInTheDocument();
      expect(screen.getByTestId("save-feedback-success")).toBeInTheDocument();
    });

    it("should display success message", () => {
      const status: ManualSaveStatus = { type: "success" };
      render(<SaveFeedback status={status} />);

      expect(screen.getByText("セーブしました")).toBeInTheDocument();
    });

    it("should show success icon", () => {
      const status: ManualSaveStatus = { type: "success" };
      render(<SaveFeedback status={status} />);

      expect(screen.getByTestId("save-success-icon")).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("should render error message when failed", () => {
      const status: ManualSaveStatus = { type: "error", message: "ネットワークエラー" };
      render(<SaveFeedback status={status} />);

      expect(screen.getByTestId("save-feedback")).toBeInTheDocument();
      expect(screen.getByTestId("save-feedback-error")).toBeInTheDocument();
    });

    it("should display error message", () => {
      const status: ManualSaveStatus = { type: "error", message: "ネットワークエラー" };
      render(<SaveFeedback status={status} />);

      expect(screen.getByText("セーブに失敗しました")).toBeInTheDocument();
      expect(screen.getByText("ネットワークエラー")).toBeInTheDocument();
    });

    it("should show retry button when onRetry is provided", () => {
      const onRetry = vi.fn();
      const status: ManualSaveStatus = { type: "error", message: "エラー" };
      render(<SaveFeedback status={status} onRetry={onRetry} />);

      expect(screen.getByTestId("save-retry-button")).toBeInTheDocument();
      expect(screen.getByText("リトライ")).toBeInTheDocument();
    });

    it("should call onRetry when retry button is clicked", () => {
      const onRetry = vi.fn();
      const status: ManualSaveStatus = { type: "error", message: "エラー" };
      render(<SaveFeedback status={status} onRetry={onRetry} />);

      fireEvent.click(screen.getByTestId("save-retry-button"));

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("should not show retry button if onRetry is not provided", () => {
      const status: ManualSaveStatus = { type: "error", message: "エラー" };
      render(<SaveFeedback status={status} />);

      expect(screen.queryByTestId("save-retry-button")).not.toBeInTheDocument();
    });
  });

  describe("auto-dismiss", () => {
    it("should call onDismiss after 2 seconds when success", () => {
      const onDismiss = vi.fn();
      const status: ManualSaveStatus = { type: "success" };
      render(<SaveFeedback status={status} onDismiss={onDismiss} />);

      expect(onDismiss).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("should not call onDismiss before 2 seconds", () => {
      const onDismiss = vi.fn();
      const status: ManualSaveStatus = { type: "success" };
      render(<SaveFeedback status={status} onDismiss={onDismiss} />);

      act(() => {
        vi.advanceTimersByTime(1999);
      });

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it("should not auto-dismiss when error", () => {
      const onDismiss = vi.fn();
      const status: ManualSaveStatus = { type: "error", message: "エラー" };
      render(<SaveFeedback status={status} onDismiss={onDismiss} />);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it("should not auto-dismiss when saving", () => {
      const onDismiss = vi.fn();
      const status: ManualSaveStatus = { type: "saving" };
      render(<SaveFeedback status={status} onDismiss={onDismiss} />);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(onDismiss).not.toHaveBeenCalled();
    });
  });

  describe("styling", () => {
    it("should have proper styling for saving state", () => {
      const status: ManualSaveStatus = { type: "saving" };
      render(<SaveFeedback status={status} />);

      const feedback = screen.getByTestId("save-feedback");
      expect(feedback.className).toContain("bg-ghost-surface");
    });

    it("should have success styling for success state", () => {
      const status: ManualSaveStatus = { type: "success" };
      render(<SaveFeedback status={status} />);

      const feedback = screen.getByTestId("save-feedback-success");
      expect(feedback.className).toContain("text-green");
    });

    it("should have error styling for error state", () => {
      const status: ManualSaveStatus = { type: "error", message: "エラー" };
      render(<SaveFeedback status={status} />);

      const feedback = screen.getByTestId("save-feedback-error");
      expect(feedback.className).toContain("text-ghost-danger");
    });
  });
});
