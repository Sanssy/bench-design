import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

type Suite = {
  specs?: { tags?: string[]; tests: { expectedStatus: string }[] }[];
  suites?: Suite[];
};

test("Chromium components stay within the browser budget", () => {
  // Only component specs (src/) count: axe runs once per usage story, and
  // stories are curated examples. Listing src/ also needs no build output.
  const report = JSON.parse(
    execFileSync(
      "pnpm",
      [
        "exec",
        "playwright",
        "test",
        "src/",
        "--project=chromium",
        "--list",
        "--reporter=json",
      ],
      { encoding: "utf8", env: { ...process.env, BD_BROWSERS: "chromium" } },
    ),
  ) as Suite;
  const counts: Record<string, number> = {};
  function visit(suite: Suite) {
    for (const spec of suite.specs ?? []) {
      if (spec.tests.every((entry) => entry.expectedStatus === "skipped"))
        continue;
      for (const tag of spec.tags ?? []) {
        if (tag.startsWith("component:"))
          counts[tag.slice(10)] = (counts[tag.slice(10)] ?? 0) + 1;
      }
    }
    for (const child of suite.suites ?? []) visit(child);
  }
  visit(report);
  assert(Object.keys(counts).length > 0, "No component tests discovered");
  assert.deepEqual(
    Object.entries(counts).filter(([, count]) => count > 8),
    [],
    `Browser budget exceeded: ${JSON.stringify(counts)}. See CONTRIBUTING.md, Browser test budget.`,
  );
});
