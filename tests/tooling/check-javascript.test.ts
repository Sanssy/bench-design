import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(
  new URL("../../scripts/check-javascript.ts", import.meta.url),
);

function check(files: string[]) {
  const root = mkdtempSync(join(tmpdir(), "bench-javascript-policy-"));
  try {
    for (const file of files) {
      const path = join(root, file);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, "");
    }
    const result = spawnSync(process.execPath, [script], {
      cwd: root,
      encoding: "utf8",
    });
    assert.ifError(result.error);
    assert.equal(result.signal, null);
    return result;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

for (const extension of ["js", "mjs", "cjs"]) {
  test(`JavaScript policy rejects .${extension} files`, () => {
    const file = `src/nested/forbidden.${extension}`;
    const result = check(["src/index.ts", file]);
    assert.equal(result.status, 1);
    assert.ok(
      result.stderr.includes(`Forbidden JavaScript: ${JSON.stringify(file)}`),
    );
    assert.doesNotMatch(result.stdout, /PASS/);
  });
}

test("JavaScript policy accepts the exact public exception", () => {
  const result = check(["public/theme-init.js"]);
  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  assert.match(result.stdout, /PASS \(1 source files\)/);
});

test("JavaScript policy rejects the exception at another path", () => {
  const result = check(["src/theme-init.js"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Forbidden JavaScript/);
});

for (const directory of [
  "node_modules",
  "dist",
  "storybook-static",
  ".git",
  "coverage",
  "test-results",
  "playwright-report",
  ".verification",
]) {
  test(`JavaScript policy excludes ${directory}`, () => {
    const result = check([
      "src/index.ts",
      ...["js", "mjs", "cjs"].map(
        (extension) => `${directory}/nested/generated.${extension}`,
      ),
    ]);
    assert.equal(result.status, 0);
    assert.equal(result.stderr, "");
    assert.match(result.stdout, /PASS \(1 source files\)/);
  });
}

for (const files of [[], ["dist/generated.js", "README.md"]]) {
  test(`JavaScript policy rejects an empty source selection (${files.length} files)`, () => {
    const result = check(files);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /No source files to check/);
    assert.doesNotMatch(result.stdout, /PASS/);
  });
}
