import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WelcomeScreen } from "./WelcomeScreen";

describe("WelcomeScreen", () => {
  describe("レンダリング", () => {
    it("ウェルカムコンテナが表示される", () => {
      render(<WelcomeScreen />);
      expect(screen.getByTestId("welcome-screen")).toBeInTheDocument();
    });

    it("ゲームタイトルが表示される", () => {
      render(<WelcomeScreen />);
      expect(screen.getByText("Ghost Game")).toBeInTheDocument();
    });

    it("ウェルカムメッセージが表示される", () => {
      render(<WelcomeScreen />);
      expect(screen.getByText("ゴーストを捕まえて、育てて、バトルしよう！")).toBeInTheDocument();
    });

    it("サインインボタンが表示される", () => {
      render(<WelcomeScreen />);
      expect(screen.getByTestId("signin-button")).toBeInTheDocument();
    });

    it("サインアップボタンが表示される", () => {
      render(<WelcomeScreen />);
      expect(screen.getByTestId("signup-button")).toBeInTheDocument();
    });
  });

  describe("コールバック", () => {
    it("サインインボタンクリックでonSignInが呼ばれる", () => {
      const onSignIn = vi.fn();
      render(<WelcomeScreen onSignIn={onSignIn} />);

      fireEvent.click(screen.getByTestId("signin-button"));
      expect(onSignIn).toHaveBeenCalled();
    });

    it("サインアップボタンクリックでonSignUpが呼ばれる", () => {
      const onSignUp = vi.fn();
      render(<WelcomeScreen onSignUp={onSignUp} />);

      fireEvent.click(screen.getByTestId("signup-button"));
      expect(onSignUp).toHaveBeenCalled();
    });
  });

  describe("スタイリング", () => {
    it("フルスクリーンで中央揃えのスタイルが適用されている", () => {
      render(<WelcomeScreen />);
      const container = screen.getByTestId("welcome-screen");
      expect(container).toHaveClass("flex");
      expect(container).toHaveClass("items-center");
      expect(container).toHaveClass("justify-center");
    });
  });
});
