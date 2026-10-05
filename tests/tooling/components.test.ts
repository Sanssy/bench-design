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

test("manifest carries prop TSDoc as its description", () => {
  const root = mkdtempSync(join(tmpdir(), "bd-propdoc-"));
  const entry = join(root, "index.ts");
  try {
    writeFileSync(entry, 'export { Action } from "./Action.js";');
    writeFileSync(
      join(root, "Action.tsx"),
      "/** Fixture. */\nexport interface Props {\n  /** Visible label. */\n  label: string;\n  other?: boolean;\n}\n/** Fixture. */\nexport function Action({ label }: Props) { return null; }",
    );
    writeFileSync(
      join(root, "Action.stories.tsx"),
      'export default { title: "Form/Action" }; export const Primary = {};',
    );
    const [label, other] = JSON.parse(generateComponents(entry)).components[0]
      .props;
    assert.equal(label.description, "Visible label.");
    assert.equal("description" in other, false);
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

test("manifest describes a component without a props parameter", () => {
  const root = mkdtempSync(join(tmpdir(), "bd-no-props-"));
  try {
    writeFileSync(join(root, "index.ts"), 'export { Rule } from "./Rule.js";');
    writeFileSync(
      join(root, "Rule.tsx"),
      "/** Decorative rule. */ export function Rule() { return null; }",
    );
    writeFileSync(
      join(root, "Rule.stories.tsx"),
      'export default { title: "Layout/Rule" }; export const Default = {};',
    );
    assert.deepEqual(
      JSON.parse(generateComponents(join(root, "index.ts"))).components[0]
        .props,
      [],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("manifest expands relative numeric spacing aliases", () => {
  const root = mkdtempSync(join(tmpdir(), "bd-space-alias-"));
  try {
    writeFileSync(
      join(root, "index.ts"),
      'export { Action } from "./Action.js";',
    );
    writeFileSync(
      join(root, "spaces.ts"),
      "export type SpaceToken = 4 | 8 | 96;",
    );
    writeFileSync(
      join(root, "Action.tsx"),
      'import type { SpaceToken } from "./spaces.js"; export interface Props { gap?: SpaceToken } export function Action({ gap }: Props) { return null; }',
    );
    writeFileSync(
      join(root, "Action.stories.tsx"),
      'export default { title: "Layout/Action" }; export const Default = {};',
    );
    assert.equal(
      JSON.parse(generateComponents(join(root, "index.ts"))).components[0]
        .props[0].type,
      "4 | 8 | 96",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

for (const base of ["Shared", 'Pick<Shared, "label">']) {
  test(`manifest follows inherited metadata: ${base}`, () => {
    const root = mkdtempSync(join(tmpdir(), "bd-inheritance-"));
    try {
      writeFileSync(
        join(root, "index.ts"),
        'export { Action } from "./Action.js";',
      );
      writeFileSync(
        join(root, "shared.ts"),
        "/** Shared. */ export interface Shared { /** Visible name. */ label: string; /** Validation state. */ isInvalid?: boolean; }",
      );
      writeFileSync(
        join(root, "Action.tsx"),
        `import type { Shared } from "./shared.js"; export interface Props extends ${base} { /** Submitted name. */ name?: string; } export function Action({ label }: Props) { return null; }`,
      );
      writeFileSync(
        join(root, "Action.stories.tsx"),
        'export default { title: "Form/Action" }; export const Default = {};',
      );
      const props = JSON.parse(generateComponents(join(root, "index.ts")))
        .components[0].props;
      assert.deepEqual(
        props.map((prop: { name: string }) => prop.name),
        base === "Shared" ? ["label", "isInvalid", "name"] : ["label", "name"],
      );
      assert.equal(props[0].description, "Visible name.");
      assert.equal(props[0].type, "string");
      assert.equal(props[0].required, true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
}

test("manifest resolves a generic props interface without losing its members", () => {
  const root = mkdtempSync(join(tmpdir(), "bd-generic-"));
  try {
    writeFileSync(
      join(root, "index.ts"),
      'export { Items } from "./Items.js";',
    );
    writeFileSync(
      join(root, "Items.tsx"),
      "/** Collection. */ export interface Props<T> { /** Ordered items. */ items: readonly T[]; } export function Items<T>({ items }: Props<T>) { return null; }",
    );
    writeFileSync(
      join(root, "Items.stories.tsx"),
      'export default { title: "Collections/Items" }; export const Example = {};',
    );
    assert.deepEqual(
      JSON.parse(generateComponents(join(root, "index.ts"))).components[0]
        .props,
      [
        {
          name: "items",
          type: "readonly T[]",
          required: true,
          description: "Ordered items.",
        },
      ],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
