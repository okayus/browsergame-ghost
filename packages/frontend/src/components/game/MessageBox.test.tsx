import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MessageBox } from "./MessageBox";

describe("MessageBox", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("rendering", () => {
    it("should render nothing when messages array is empty", () => {
      render(<MessageBox messages={[]} />);
      expect(screen.queryByTestId("message-box")).not.toBeInTheDocument();
    });

    it("should render message box with messages", () => {
      render(<MessageBox messages={["テストメッセージ"]} typewriter={false} />);
      expect(screen.getByTestId("message-box")).toBeInTheDocument();
      expect(screen.getByTestId("message-text")).toHaveTextContent("テストメッセージ");
    });

    it("should show message counter when multiple messages", () => {
      render(<MessageBox messages={["メッセージ1", "メッセージ2"]} typewriter={false} />);
      expect(screen.getByTestId("message-counter")).toHaveTextContent("1 / 2");
    });

    it("should not show message counter for single message", () => {
      render(<MessageBox messages={["メッセージ"]} typewriter={false} />);
      expect(screen.queryByTestId("message-counter")).not.toBeInTheDocument();
    });

    it("should show advance indicator when more messages available", () => {
      render(<MessageBox messages={["メッセージ1", "メッセージ2"]} typewriter={false} />);
      expect(screen.getByTestId("advance-indicator")).toBeInTheDocument();
    });

    it("should show complete indicator when all messages shown", () => {
      render(
        <MessageBox
          messages={["メッセージ1", "メッセージ2"]}
          currentIndex={1}
          typewriter={false}
        />,
      );
      expect(screen.getByTestId("complete-indicator")).toBeInTheDocument();
    });
  });

  describe("typewriter effect", () => {
    it("should display text character by character", async () => {
      render(<MessageBox messages={["ABC"]} typewriter typewriterSpeed={50} />);

      expect(screen.getByTestId("message-text")).toHaveTextContent("");

      act(() => {
        vi.advanceTimersByTime(50);
      });
      expect(screen.getByTestId("message-text")).toHaveTextContent("A");

      act(() => {
        vi.advanceTimersByTime(50);
      });
      expect(screen.getByTestId("message-text")).toHaveTextContent("AB");

      act(() => {
        vi.advanceTimersByTime(50);
      });
      expect(screen.getByTestId("message-text")).toHaveTextContent("ABC");
    });

    it("should skip typewriter on click during typing", () => {
      render(<MessageBox messages={["ABCDEF"]} typewriter typewriterSpeed={50} />);

      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(screen.getByTestId("message-text")).toHaveTextContent("AB");

      fireEvent.click(screen.getByTestId("message-box"));
      expect(screen.getByTestId("message-text")).toHaveTextContent("ABCDEF");
    });

    it("should not use typewriter when disabled", () => {
      render(<MessageBox messages={["テスト"]} typewriter={false} />);
      expect(screen.getByTestId("message-text")).toHaveTextContent("テスト");
    });
  });

  describe("message advancement", () => {
    it("should call onAdvance when clicking after typing complete", () => {
      const onAdvance = vi.fn();
      render(
        <MessageBox
          messages={["メッセージ1", "メッセージ2"]}
          onAdvance={onAdvance}
          typewriter={false}
        />,
      );

      fireEvent.click(screen.getByTestId("message-box"));
      expect(onAdvance).toHaveBeenCalled();
    });

    it("should call onAdvance when pressing Enter", () => {
      const onAdvance = vi.fn();
      render(
        <MessageBox
          messages={["メッセージ1", "メッセージ2"]}
          onAdvance={onAdvance}
          typewriter={false}
        />,
      );

      fireEvent.keyDown(screen.getByTestId("message-box"), { key: "Enter" });
      expect(onAdvance).toHaveBeenCalled();
    });

    it("should call onAdvance when pressing Space", () => {
      const onAdvance = vi.fn();
      render(
        <MessageBox
          messages={["メッセージ1", "メッセージ2"]}
          onAdvance={onAdvance}
          typewriter={false}
        />,
      );

      fireEvent.keyDown(screen.getByTestId("message-box"), { key: " " });
      expect(onAdvance).toHaveBeenCalled();
    });

    it("should not call onAdvance when no more messages", () => {
      const onAdvance = vi.fn();
      render(
        <MessageBox
          messages={["メッセージ1"]}
          currentIndex={0}
          onAdvance={onAdvance}
          typewriter={false}
        />,
      );

      fireEvent.click(screen.getByTestId("message-box"));
      expect(onAdvance).not.toHaveBeenCalled();
    });

    it("should update displayed message when currentIndex changes", () => {
      const { rerender } = render(
        <MessageBox
          messages={["メッセージ1", "メッセージ2"]}
          currentIndex={0}
          typewriter={false}
        />,
      );

      expect(screen.getByTestId("message-text")).toHaveTextContent("メッセージ1");

      rerender(
        <MessageBox
          messages={["メッセージ1", "メッセージ2"]}
          currentIndex={1}
          typewriter={false}
        />,
      );

      expect(screen.getByTestId("message-text")).toHaveTextContent("メッセージ2");
    });
  });

  describe("auto advance", () => {
    it("should auto advance after delay", () => {
      const onAdvance = vi.fn();
      render(
        <MessageBox
          messages={["メッセージ1", "メッセージ2"]}
          onAdvance={onAdvance}
          autoAdvance
          autoAdvanceDelay={1000}
          typewriter={false}
        />,
      );

      expect(onAdvance).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(onAdvance).toHaveBeenCalled();
    });

    it("should not auto advance when on last message", () => {
      const onAdvance = vi.fn();
      render(
        <MessageBox
          messages={["メッセージ1"]}
          currentIndex={0}
          onAdvance={onAdvance}
          autoAdvance
          autoAdvanceDelay={1000}
          typewriter={false}
        />,
      );

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(onAdvance).not.toHaveBeenCalled();
    });

    it("should not auto advance while typing", () => {
      const onAdvance = vi.fn();
      render(
        <MessageBox
          messages={["ABCDEFGHIJ", "メッセージ2"]}
          onAdvance={onAdvance}
          autoAdvance
          autoAdvanceDelay={100}
          typewriter
          typewriterSpeed={50}
        />,
      );

      // Typing should take 500ms (10 chars * 50ms)
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(onAdvance).not.toHaveBeenCalled();
    });
  });

  describe("completion callback", () => {
    it("should call onComplete when all messages are shown", () => {
      const onComplete = vi.fn();
      render(
        <MessageBox
          messages={["メッセージ"]}
          currentIndex={0}
          onComplete={onComplete}
          typewriter={false}
        />,
      );

      expect(onComplete).toHaveBeenCalled();
    });

    it("should not call onComplete when more messages remain", () => {
      const onComplete = vi.fn();
      render(
        <MessageBox
          messages={["メッセージ1", "メッセージ2"]}
          currentIndex={0}
          onComplete={onComplete}
          typewriter={false}
        />,
      );

      expect(onComplete).not.toHaveBeenCalled();
    });

    it("should call onComplete after typewriter finishes on last message", () => {
      const onComplete = vi.fn();
      render(
        <MessageBox
          messages={["AB"]}
          currentIndex={0}
          onComplete={onComplete}
          typewriter
          typewriterSpeed={50}
        />,
      );

      expect(onComplete).not.toHaveBeenCalled();

      // Typing "A" and "B" takes 2 intervals, plus one more to detect completion
      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(onComplete).toHaveBeenCalled();
    });
  });
});
