import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  checkComponents,
  generateComponents,
} from "../../scripts/generate-components.ts";

test("manifest follows exported API, defaults, TSDoc and story metadata", () => {
  const root = mkdtempSync(join(tmpdir(), "bd-components-"));
  const entry = join(root, "index.ts");
  try {
    writeFileSync(entry, 'export { Action } from "./Action.js";');
    writeFileSync(
      join(root, "Action.tsx"),
      "/** Fixture action. */\nexport interface Props { enabled?: boolean; label: string }\n/** Fixture action. */\nexport function Action({ enabled = true }: Props) { return null; }",
    );
    writeFileSync(
      join(root, "Action.stories.tsx"),
      'export default { title: "Form/Action" }; export const Primary = {};',
    );
    const manifest = JSON.parse(generateComponents(entry)).components[0];
    assert.equal(manifest.name, "Action");
    assert.equal(manifest.import, 'import { Action } from "bench-design";');
    assert.equal(manifest.description, "Fixture action.");
    assert.deepEqual(manifest.props, [
      { name: "enabled", type: "boolean", required: false, default: "true" },
      { name: "label", type: "string", required: true },
    ]);
    assert.deepEqual(manifest.stories, [
      { name: "Primary", href: "./?path=/story/form-action--primary" },
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("manifest expands a sibling string-literal alias into its values", () => {
  const root = mkdtempSync(join(tmpdir(), "bd-alias-"));
  const entry = join(root, "index.ts");
  try {
    writeFileSync(entry, 'export { Action } from "./Action.js";');
    writeFileSync(join(root, "names.ts"), 'export type Name = "a" | "b";');
    writeFileSync(
      join(root, "Action.tsx"),
      'import type { Name } from "./names";\n/** Fixture. */\nexport interface Props { name: Name; other: Other }\n/** Fixture. */\nexport function Action({ name }: Props) { return null; }',
    );
    writeFileSync(
      join(root, "Action.stories.tsx"),
      'export default { title: "Form/Action" }; export const Primary = {};',
    );
    const [name, other] = JSON.parse(generateComponents(entry)).components[0]
      .props;
    assert.equal(name.type, '"a" | "b"');
    assert.equal(other.type, "Other");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("an export the generator cannot describe fails instead of vanishing", () => {
  const root = mkdtempSync(join(tmpdir(), "bd-unsupported-"));
  const entry = join(root, "index.ts");
  try {
    writeFileSync(entry, 'export { Action } from "./Action.js";');
    writeFileSync(
      join(root, "Action.tsx"),
      "export const Action = () => null;",
    );
    assert.throws(
      () => generateComponents(entry),
      /Unsupported component export: Action/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("drift check rejects modified generated output", () => {
  const root = mkdtempSync(join(tmpdir(), "bd-drift-"));
  const path = join(root, "components.json");
  try {
    writeFileSync(path, "{}\n");
    assert.equal(checkComponents(path, "{}\n"), true);
    assert.equal(checkComponents(path, '{"stale":true}\n'), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
