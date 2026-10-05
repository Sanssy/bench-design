import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "tests/site",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:6008/bench-design/",
  },
  webServer: {
    command:
      "pnpm exec vite preview --outDir site-dist --base /bench-design/ --host 127.0.0.1 --port 6008 --strictPort",
    url: "http://127.0.0.1:6008/bench-design/",
    reuseExistingServer: false,
  },
});
