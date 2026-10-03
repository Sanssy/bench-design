import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { visualViolations } from "../../scripts/check-visual-values.ts";

test("Button CSS uses token visual values", () => {
  const css = readFileSync("public/button.css", "utf8");
  assert.deepEqual(visualViolations(css, "dist/button.css"), []);
});
