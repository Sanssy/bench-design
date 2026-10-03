import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { checkPublicTypes } from "../../scripts/check-public-types.ts";

test("published types encapsulate React Aria, including nested declarations", () => {
  const root = mkdtempSync(join(tmpdir(), "bench-design-public-types-"));
  try {
    mkdirSync(join(root, "button"));
    writeFileSync(
      join(root, "index.d.ts"),
      'export * from "./button/Button.js";',
    );
    const button = join(root, "button/Button.d.ts");
    writeFileSync(
      button,
      "export interface ButtonProps { onPress?: () => void }",
    );
    assert.doesNotThrow(() => checkPublicTypes(root));
    for (const declaration of [
      'import type { ButtonProps } from "react-aria-components";',
      "export type Props = import('react-aria-components').ButtonProps;",
      'export * from "react-aria-components/Button";',
    ]) {
      writeFileSync(button, declaration);
      assert.throws(
        () => checkPublicTypes(root),
        /Button.d.ts exposes React Aria/,
      );
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
