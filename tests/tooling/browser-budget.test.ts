import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("Chromium components stay within the browser budget", () => {
  const directory = mkdtempSync(join(tmpdir(), "bd-story-index-"));
  try {
    const index = join(directory, "index.json");
    execFileSync("pnpm", [
      "exec",
      "storybook",
      "index",
      "--disable-telemetry",
      "--output-file",
      index,
    ]);
    const report = JSON.parse(
      execFileSync(
        "pnpm",
        [
          "exec",
          "playwright",
          "test",
          "--project=chromium",
          "--list",
          "--reporter=json",
        ],
        {
          encoding: "utf8",
          env: { ...process.env, BD_STORY_INDEX: index },
        },
      ),
    );
    const counts: Record<string, number> = {};
    function visit(suite: typeof report) {
      for (const spec of suite.specs ?? []) {
        // axe runs once per usage story; stories are curated examples, so
        // they do not consume a component's budget.
        if (spec.file.endsWith("a11y.spec.ts")) continue;
        if (
          spec.tests.every(
            (entry: { expectedStatus: string }) =>
              entry.expectedStatus === "skipped",
          )
        )
          continue;
        for (const tag of spec.tags ?? []) {
          if (tag.startsWith("component:"))
            counts[tag.slice(10)] = (counts[tag.slice(10)] ?? 0) + 1;
        }
      }
      for (const child of suite.suites ?? []) visit(child);
    }
    for (const suite of report.suites) visit(suite);
    assert(Object.keys(counts).length > 0, "No component tests discovered");
    assert.deepEqual(
      Object.entries(counts).filter(([, count]) => count > 8),
      [],
      `Browser budget exceeded: ${JSON.stringify(counts)}. See CONTRIBUTING.md, Browser test budget.`,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
