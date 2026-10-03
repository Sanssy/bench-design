import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const browsers = [
  { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  { name: "webkit", use: { ...devices["Desktop Safari"] } },
];
// BD_BROWSERS narrows the run (PR CI: chromium); unset runs all three.
const selected = process.env.BD_BROWSERS?.split(",").map((name) => name.trim());
const projects = selected
  ? browsers.filter((browser) => selected.includes(browser.name))
  : browsers;
if (!projects.length) throw new Error("No browser matches BD_BROWSERS");

export default defineConfig({
  testDir: ".",
  testMatch: ["tests/browser/**/*.spec.ts", "src/**/*.browser.spec.ts"],
  // Local agent worktrees live under .claude/ and carry their own specs.
  testIgnore: [`${fileURLToPath(new URL(".claude/", import.meta.url))}**`],
  // CI runners have 4 vCPUs; local runs keep one worker (memory policy, B3).
  workers: process.env.CI ? 4 : 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:6007",
    locale: "en-US",
    timezoneId: "UTC",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  projects,
  webServer: {
    command:
      "pnpm exec vite preview --outDir storybook-static --host 127.0.0.1 --port 6007 --strictPort",
    url: "http://127.0.0.1:6007",
    reuseExistingServer: false,
  },
});
