import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";
import { checkIcon } from "../../scripts/check-icons.ts";

const valid =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="butt"><path d="M4 12H20"/></svg>';
test("the valid sample passes, so each rejection below isolates one rule", () => {
  checkIcon(valid, "valid.svg");
});
for (const [rule, source] of [
  ["viewBox", valid.replace("0 0 24 24", "0 0 16 16")],
  ["element", valid.replace("path", "script")],
  ["color", valid.replace("currentColor", "red")],
  ["stroke-width", valid.replace('width="2"', 'width="1"')],
  ["round caps", valid.replace('linecap="butt"', 'linecap="round"')],
  ...["transform", "id", "style", "class", "xmlns:inkscape", "onclick"].map(
    (name) => [name, valid.replace("<path", `<path ${name}="bad"`)],
  ),
  ["XML", valid.replace("</svg>", "</path>")],
] as const) {
  test(`rejects ${rule} with a filename`, () => {
    assert.throws(() => checkIcon(source, "invalid.svg"), /invalid.svg:/);
  });
}
test("every catalogue SVG passes and its licences are present", () => {
  const files = readdirSync("src/icon/svg").filter((name) =>
    name.endsWith(".svg"),
  );
  assert.equal(files.length, 35);
  for (const file of files)
    checkIcon(readFileSync(`src/icon/svg/${file}`, "utf8"), file);
  const licence = readFileSync("src/icon/svg/LICENSE", "utf8");
  assert.match(licence, /MIT/);
  assert.match(licence, /ISC/);
});
