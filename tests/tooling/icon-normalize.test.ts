import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { checkIcon } from "../../scripts/check-icons.ts";
import { normalizeIcon } from "../../scripts/normalize-icon.ts";

const valid =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="butt"><path d="M4 12H20"/></svg>';
test("normalizes an Inkscape export, preserving filled details", () => {
  const source = readFileSync("tests/fixtures/icons/inkscape.svg", "utf8");
  const result = normalizeIcon(source, "drawing.svg");
  checkIcon(result, "drawing.svg");
  assert.match(result, /<circle[^>]*fill="currentColor"[^>]*stroke="none"/);
  assert.equal(normalizeIcon(result), result);
});
test("refuses transforms with actionable guidance", () => {
  assert.throws(
    () =>
      normalizeIcon(valid.replace("<path", '<path transform="translate(1)"')),
    /Apply.*Inkscape/,
  );
});
test("normalizer CLI writes valid output and leaves refused input intact", () => {
  const directory = mkdtempSync(join(tmpdir(), "bd-icons-"));
  const file = join(directory, "drawing.svg");
  try {
    writeFileSync(file, readFileSync("tests/fixtures/icons/inkscape.svg"));
    const run = () =>
      spawnSync(process.execPath, ["scripts/normalize-icon.ts", file], {
        encoding: "utf8",
      });
    assert.equal(run().status, 0);
    checkIcon(readFileSync(file, "utf8"), file);
    const refused = valid.replace("<path", '<path transform="translate(1)"');
    writeFileSync(file, refused);
    const result = run();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Apply.*Inkscape/);
    assert.equal(readFileSync(file, "utf8"), refused);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
