import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getTransitionType, ScreenTransition } from "./ScreenTransition";

describe("ScreenTransition", () => {
  describe("レンダリング", () => {
    it("非アクティブ時は何もレンダリングしない", () => {
      render(<ScreenTransition type="fade" isActive={false} />);
      expect(screen.queryByTestId("screen-transition")).not.toBeInTheDocument();
    });

    it("アクティブ時にトランジション要素をレンダリングする", () => {
      render(<ScreenTransition type="fade" isActive={true} />);
      expect(screen.getByTestId("screen-transition")).toBeInTheDocument();
    });

    it("正しいトランジションタイプを表示する", () => {
      render(<ScreenTransition type="battle-enter" isActive={true} />);
      const element = screen.getByTestId("screen-transition");
      expect(element).toHaveAttribute("data-type", "battle-enter");
    });
  });

  describe("トランジション状態", () => {
    it("entering状態から開始する", () => {
      render(<ScreenTransition type="fade" isActive={true} />);
      const element = screen.getByTestId("screen-transition");
      expect(element).toHaveAttribute("data-state", "entering");
    });

    it("時間経過でactive状態に遷移する", async () => {
      vi.useFakeTimers();
      render(<ScreenTransition type="fade" isActive={true} />);

      await act(async () => {
        vi.advanceTimersByTime(250);
      });

      const element = screen.getByTestId("screen-transition");
      expect(element).toHaveAttribute("data-state", "active");

      vi.useRealTimers();
    });

    it("時間経過でexiting状態に遷移する", async () => {
      vi.useFakeTimers();
      render(<ScreenTransition type="fade" isActive={true} />);

      await act(async () => {
        vi.advanceTimersByTime(350);
      });

      const element = screen.getByTestId("screen-transition");
      expect(element).toHaveAttribute("data-state", "exiting");

      vi.useRealTimers();
    });

    it("トランジション完了後にonCompleteが呼ばれる", async () => {
      vi.useFakeTimers();
      const onComplete = vi.fn();
      render(<ScreenTransition type="fade" isActive={true} onComplete={onComplete} />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(onComplete).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it("トランジション完了後に要素が非表示になる", async () => {
      vi.useFakeTimers();
      render(<ScreenTransition type="fade" isActive={true} />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.queryByTestId("screen-transition")).not.toBeInTheDocument();

      vi.useRealTimers();
    });
  });

  describe("アクセシビリティ", () => {
    it("aria-hiddenがtrueに設定される", () => {
      render(<ScreenTransition type="fade" isActive={true} />);
      const element = screen.getByTestId("screen-transition");
      expect(element).toHaveAttribute("aria-hidden", "true");
    });

    it("pointer-events-noneクラスが適用される", () => {
      render(<ScreenTransition type="fade" isActive={true} />);
      const element = screen.getByTestId("screen-transition");
      expect(element).toHaveClass("pointer-events-none");
    });
  });
});

describe("getTransitionType", () => {
  it("マップからバトルへの遷移でbattle-enterを返す", () => {
    expect(getTransitionType("map", "battle")).toBe("battle-enter");
  });

  it("バトルからマップへの遷移でbattle-exitを返す", () => {
    expect(getTransitionType("battle", "map")).toBe("battle-exit");
  });

  it("メニュー画面への遷移でslide-upを返す", () => {
    expect(getTransitionType("map", "menu")).toBe("slide-up");
  });

  it("パーティ画面への遷移でslide-upを返す", () => {
    expect(getTransitionType("map", "party")).toBe("slide-up");
  });

  it("その他の遷移でfadeを返す", () => {
    expect(getTransitionType("menu", "map")).toBe("fade");
    expect(getTransitionType(null, "map")).toBe("fade");
  });
});
