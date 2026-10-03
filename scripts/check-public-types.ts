import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function checkPublicTypes(root: string) {
  const declarations = readdirSync(root, {
    recursive: true,
    encoding: "utf8",
  }).filter((file) => file.endsWith(".d.ts"));
  assert(declarations.length > 0, "published declarations are missing");
  for (const file of declarations) {
    assert.doesNotMatch(
      readFileSync(join(root, file), "utf8"),
      /["']react-aria-components(?:\/[^"']*)?["']/,
      `published declaration ${file} exposes React Aria`,
    );
  }
}
