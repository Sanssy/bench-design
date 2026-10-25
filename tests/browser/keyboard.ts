import type { Page } from "@playwright/test";

// Native link-inclusive traversal for the default macOS WebKit preferences.
// https://support.apple.com/en-ie/guide/safari/cpsh003/27.0/mac/27
export async function pressTab(
  page: Page,
  browserName: "chromium" | "firefox" | "webkit",
) {
  const key =
    browserName === "webkit" && process.platform === "darwin"
      ? "Alt+Tab"
      : "Tab";
  await page.keyboard.press(key);
}
