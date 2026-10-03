import { defineConfig } from "@playwright/test";
import browserConfig from "./playwright.config";

export default defineConfig(browserConfig, {
  testMatch: ["tests/visual/**/*.spec.ts"],
  outputDir: "test-results/visual",
  snapshotPathTemplate:
    "{testDir}/tests/visual/baselines/{projectName}/{arg}{ext}",
  // Missing references must fail without creating or replacing expected images.
  updateSnapshots: "none",
  projects: (browserConfig.projects ?? []).map((project) => ({
    ...project,
    use: {
      ...project.use,
      viewport: { width: 400, height: 160 },
      deviceScaleFactor: 1,
    },
  })),
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      // Fixed Linux image/fonts/DPR: tolerate no pixel or colour difference.
      threshold: 0,
      maxDiffPixels: 0,
    },
  },
});
