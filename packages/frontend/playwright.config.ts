import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright設定
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  /* 最大並列数 */
  fullyParallel: true,
  /* CI環境でのリトライ回数 */
  retries: process.env.CI ? 2 : 0,
  /* CI環境での並列ワーカー数 */
  workers: process.env.CI ? 1 : undefined,
  /* レポーター設定 */
  reporter: "html",
  /* 全テスト共通設定 */
  use: {
    /* ベースURL */
    baseURL: "http://localhost:5173",
    /* スクリーンショットを失敗時のみ取得 */
    screenshot: "only-on-failure",
    /* トレースをリトライ時のみ取得 */
    trace: "on-first-retry",
  },

  /* プロジェクト設定 */
  projects: [
    /* グローバルセットアップ */
    {
      name: "setup",
      testMatch: /global\.setup\.ts/,
    },
    /* Chromiumでのテスト */
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
      dependencies: ["setup"],
    },
  ],

  /* ローカル開発サーバー設定 */
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
