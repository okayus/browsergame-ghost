import { clerkSetup } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";

/**
 * グローバルセットアップ
 * Playwrightが完全並列で実行される場合に必要
 */
setup.describe.configure({ mode: "serial" });

/**
 * Clerk Testing Tokenを取得するグローバルセットアップ
 * これにより、全テストでClerkのbot検出をバイパスできる
 */
setup("global setup", async () => {
  await clerkSetup();
});
