import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import tokens from "../../src/tokens.json" with { type: "json" };

test("generated agent guide carries catalog usage without private paths", () => {
  execFileSync(process.execPath, ["scripts/build-agent-docs.ts"]);
  const guide = readFileSync("dist/AGENTS.md", "utf8");
  assert.match(guide, /bench-design\/styles.css/);
  assert.match(guide, /theme-init.js/);
  for (const group of [tokens.base, tokens.light, tokens.dark]) {
    for (const token of Object.values(group)) {
      assert.ok(guide.includes(token.$extensions["org.bench-design"].usage));
    }
  }
  assert.doesNotMatch(guide, /private-claude|\.agents\/skills|\/Users\//);
});

test("static documentation index links to pages and serves the catalog", () => {
  const directory = mkdtempSync(join(tmpdir(), "bench-docs-"));
  try {
    execFileSync(process.execPath, [
      "scripts/build-agent-docs.ts",
      `--site=${directory}`,
    ]);
    const index = readFileSync(join(directory, "llms.txt"), "utf8");
    assert.match(index, /^# bench-design\n/);
    for (const id of [
      "documentation-démarrer--page",
      "documentation-principes--page",
      "documentation-thèmes--page",
    ]) {
      assert.ok(index.includes(`./?path=/story/${encodeURIComponent(id)}`));
    }
    assert.match(index, /\[DTCG tokens\]\(.\/tokens.json\)/);
    assert.equal(
      readFileSync(join(directory, "tokens.json"), "utf8"),
      readFileSync("src/tokens.json", "utf8"),
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("tarball includes integration guide and token catalog without repository instructions", () => {
  const directory = mkdtempSync(join(tmpdir(), "bench-docs-pack-"));
  try {
    execFileSync(process.execPath, ["scripts/build-agent-docs.ts"]);
    execFileSync("pnpm", ["pack", "--out", join(directory, "package.tgz")], {
      stdio: "pipe",
    });
    const entries = execFileSync(
      "tar",
      ["-tzf", join(directory, "package.tgz")],
      { encoding: "utf8" },
    ).split("\n");
    assert.ok(entries.includes("package/dist/AGENTS.md"));
    assert.ok(entries.includes("package/dist/tokens.json"));
    assert.ok(!entries.includes("package/AGENTS.md"));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
