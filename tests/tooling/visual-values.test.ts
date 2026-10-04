import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { type TestContext, test } from "node:test";
import { fileURLToPath } from "node:url";
import { visualViolations } from "../../scripts/check-visual-values.ts";

for (const value of ["#fff", "red", "rgb(1 2 3)", "oklch(50% 0.2 30)"]) {
  test(`rejects raw color ${value}`, () => {
    assert.equal(
      visualViolations(`.x { color: ${value}; }`, "dist/styles.css").length,
      1,
    );
  });
}

for (const value of [
  "8px",
  "1rem",
  "calc(var(--bd-space-8) + 2px)",
  "var(--bd-space-8, 4px)",
  "0px",
]) {
  test(`rejects raw length ${value}`, () => {
    assert.equal(
      visualViolations(`.x { padding: ${value}; }`, "dist/styles.css").length,
      1,
    );
  });
}

for (const css of [
  ".x { color: var(--bd-text); padding: var(--bd-space-8); }",
  ".x { width: 100%; height: auto; color: currentColor; background: transparent; }",
  '.x::after { content: "red 8px"; background-image: url("red-8px.svg"); }',
]) {
  test(`accepts valid CSS ${css}`, () => {
    assert.deepEqual(visualViolations(css, "dist/styles.css"), []);
  });
}
test("only exact definition paths are exempt", () => {
  for (const file of ["dist/tokens.css", "dist/fonts.css"]) {
    assert.deepEqual(visualViolations(".x { color: red; }", file), []);
  }
  assert.equal(
    visualViolations(".x { color: red; }", "dist/components/tokens.css").length,
    1,
  );
});
test("exceptions require exact scope and reason", () => {
  const entry = {
    file: "dist/styles.css",
    selector: ".x",
    property: "padding",
    value: "3px",
    reason: "specific geometry",
  };
  assert.deepEqual(
    visualViolations(".x { padding: 3px; }", entry.file, [entry]),
    [],
  );
  for (const changed of ["file", "selector", "property", "value", "reason"]) {
    assert.equal(
      visualViolations(".x { padding: 3px; }", entry.file, [
        { ...entry, [changed]: "" },
      ]).length,
      1,
    );
  }
});

test("raw custom properties cannot bypass tokens", () => {
  assert.equal(
    visualViolations(".x { --local: 8px; }", "dist/styles.css").length,
    1,
  );
});

test("accepts unitless zero for absent spacing and borders", () => {
  assert.deepEqual(
    visualViolations(
      ".x { padding: 0; margin: 0; border-width: 0; }",
      "dist/styles.css",
    ),
    [],
  );
});

const cli = fileURLToPath(
  new URL("../../scripts/check-visual-values.ts", import.meta.url),
);

function runCli(t: TestContext, css?: string) {
  const cwd = mkdtempSync(join(tmpdir(), "bench-visual-values-"));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  if (css !== undefined) {
    mkdirSync(join(cwd, "dist", "components"), { recursive: true });
    writeFileSync(join(cwd, "dist", "components", "faulty.css"), css);
  }
  const result = spawnSync(process.execPath, [cli], {
    cwd,
    encoding: "utf8",
    timeout: 10000,
  });
  assert.ifError(result.error);
  assert.equal(result.signal, null);
  return result;
}

test("CLI rejects faulty distributed CSS with exit 1", (t) => {
  const result = runCli(t, ".x { color: red; padding: 8px; }");
  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /dist\/components\/faulty\.css:1: .*color: red requires a token/,
  );
  assert.match(result.stderr, /padding: 8px requires a token/);
  assert.doesNotMatch(result.stdout, /PASS/);
});

test("CLI rejects empty selection explicitly without PASS", (t) => {
  const result = runCli(t);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /No distributed CSS to check; run build first/);
  assert.doesNotMatch(result.stdout, /PASS/);
});

test("layout breakpoint exception is exact and required", () => {
  const css = "@media (width < 640px) { .bd-grid { display: grid; } }";
  assert.deepEqual(visualViolations(css, "dist/layout.css"), []);
  assert.equal(visualViolations(css, "dist/layout.css", []).length, 1);
  assert.equal(
    visualViolations(css.replace("640", "641"), "dist/layout.css").length,
    1,
  );
  assert.equal(visualViolations(css, "dist/other.css").length, 1);
});
