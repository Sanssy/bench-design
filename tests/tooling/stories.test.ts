import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { storyCoverage } from "../../scripts/check-stories.ts";

function fixture(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), "bd-stories-"));
  for (const [name, source] of Object.entries(files)) {
    const file = join(root, name);
    mkdirSync(join(file, ".."), { recursive: true });
    writeFileSync(file, source);
  }
  return root;
}

test("exported components require adjacent stories through barrels and aliases", () => {
  const root = fixture({
    "index.ts": 'export { Button as Action } from "./barrel";',
    "barrel.ts": 'export * from "./Button";',
    "Button.tsx": "export const Button = () => null;",
  });
  try {
    assert.equal(storyCoverage(join(root, "index.ts")).missing.length, 1);
    writeFileSync(join(root, "Button.stories.tsx"), "export {};");
    assert.deepEqual(storyCoverage(join(root, "index.ts")).missing, []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("zero components is explicit and type/value/private exports are ignored", () => {
  const root = fixture({
    "index.ts":
      "export type Props = {}; export const Version = 1; const Private = () => null;",
  });
  try {
    assert.deepEqual(storyCoverage(join(root, "index.ts")), {
      count: 0,
      missing: [],
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("default, imported wrappers and classes require their own adjacent stories", () => {
  const root = fixture({
    "index.ts":
      'import Widget from "./Widget"; export { Widget }; export { Panel } from "./Panel";',
    "Widget.ts":
      'import { memo } from "react"; export default memo(() => null);',
    "Panel.tsx": "export class Panel {}",
  });
  try {
    assert.equal(storyCoverage(join(root, "index.ts")).count, 2);
    assert.equal(storyCoverage(join(root, "index.ts")).missing.length, 2);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("CLI reports zero and fails for a missing story", () => {
  const root = fixture({ "src/index.ts": "export {};" });
  try {
    const run = () =>
      spawnSync(process.execPath, [resolve("scripts/check-stories.ts")], {
        cwd: root,
        encoding: "utf8",
      });
    const empty = run();
    assert.equal(empty.status, 0);
    assert.match(
      empty.stdout,
      /0 exported components \(no components delivered yet\)/,
    );
    writeFileSync(
      join(root, "src/index.ts"),
      "export function Button() { return null; }",
    );
    const missing = run();
    assert.equal(missing.status, 1);
    assert.match(missing.stderr, /Button: missing adjacent story/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
