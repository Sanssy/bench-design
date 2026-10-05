import assert from "node:assert/strict";
import { globSync, readFileSync } from "node:fs";
import test from "node:test";
import { stateAttributeViolations } from "../../scripts/check-state-attributes.ts";

const contract = readFileSync("docs/state-attributes.md", "utf8");

test("undeclared state selectors fail, including nested and escaped selectors", () => {
  assert.deepEqual(
    stateAttributeViolations(
      '/* [data-comment] */ .x:has([data-unknown="yes"]) { content: "[data-text]"; } .y[data-\\75 nknown-two] {}',
      "fixture.css",
      contract,
    ),
    [
      "fixture.css:1: undeclared state attribute data-unknown",
      "fixture.css:1: undeclared state attribute data-unknown-two",
    ],
  );
});

test("every public CSS state selector belongs to the contract", () => {
  const files = globSync("public/*.css");
  assert(files.length > 0);
  assert.deepEqual(
    files.flatMap((file) =>
      stateAttributeViolations(readFileSync(file, "utf8"), file, contract),
    ),
    [],
  );
});
