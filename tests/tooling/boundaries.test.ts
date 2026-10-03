import assert from "node:assert/strict";
import { test } from "node:test";
import { violations } from "../../scripts/check-boundaries.ts";

const file = `${process.cwd()}/src/index.ts`;
test("package rejects product dependencies", () => {
  assert.equal(violations('import { rule } from "trame";', file).length, 1);
});
test("package rejects relative test imports", () => {
  assert.equal(
    violations('import { fixture } from "../tests/fixture";', file).length,
    1,
  );
});
test("package does not re-export the React Aria API", () => {
  assert.equal(
    violations('export * from "react-aria-components";', file).length,
    1,
  );
});
test("package permits local modules and encapsulated React imports", () => {
  assert.deepEqual(
    violations(
      'import { Button } from "react-aria-components"; import "./local";',
      file,
    ),
    [],
  );
});

for (const suffix of ["stories", "test", "spec"]) {
  for (const extension of ["", ".tsx"]) {
    test(`package rejects .${suffix}${extension} imports inside src`, () => {
      assert.equal(
        violations(`import "./X.${suffix}${extension}";`, file).length,
        1,
      );
    });
  }
}
