import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { checkIcons, generateIcons } from "../../scripts/generate-icons.ts";

test("generates sorted names and React SVG attributes from validated files", () => {
  const source = generateIcons();
  assert.match(source, /Generated/);
  assert.match(source, /"arrow-left"/);
  assert.match(source, /strokeWidth/);
  assert(!source.includes('"stroke-width"'));
  assert.equal(source, generateIcons());
  assert(checkIcons("src/icon/icons.ts", source));
});
test("rejects stale output and reflects new SVG names and geometry", () => {
  const directory = mkdtempSync(join(tmpdir(), "bd-icons-"));
  try {
    const output = join(directory, "icons.ts");
    writeFileSync(output, "stale");
    assert.equal(checkIcons(output, generateIcons()), false);
    const svg = readFileSync("src/icon/svg/plus.svg", "utf8");
    writeFileSync(join(directory, "zebra.svg"), svg);
    writeFileSync(join(directory, "alpha.svg"), svg);
    const source = generateIcons(directory);
    assert(source.indexOf('"alpha"') < source.indexOf('"zebra"'));
    assert(source.includes('"d"'));
    writeFileSync(output, source);
    assert(checkIcons(output, source));
    writeFileSync(
      join(directory, "alpha.svg"),
      svg.replace('stroke-width="2"', 'stroke-width="3"'),
    );
    assert.throws(() => generateIcons(directory), /alpha.svg:.*stroke-width/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
