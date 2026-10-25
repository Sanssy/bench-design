import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";
import { checkIcon } from "../../scripts/check-icons.ts";

const valid =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="butt"><path d="M4 12H20"/></svg>';
const roundedClose =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
test("the valid sample passes, so each rejection below isolates one rule", () => {
  checkIcon(valid, "valid.svg");
});
test("the reserved rounded close artwork passes only under its exact filename", () => {
  checkIcon(roundedClose, "close-rounded.svg");
  assert.throws(
    () => checkIcon(roundedClose, "close-other.svg"),
    /close-other\.svg:/,
  );
});
for (const [rule, source] of [
  ["path", roundedClose.replace("M6 6l12 12M18 6L6 18", "M4 4L20 20")],
  [
    "stroke width",
    roundedClose.replace('stroke-width="3"', 'stroke-width="2"'),
  ],
  [
    "cap",
    roundedClose.replace('stroke-linecap="round"', 'stroke-linecap="butt"'),
  ],
  [
    "root paint override",
    roundedClose.replace(
      'stroke-linejoin="round"',
      'stroke-linejoin="round" stroke-opacity="0.5"',
    ),
  ],
  [
    "path paint override",
    roundedClose.replace("<path d=", '<path stroke="none" d='),
  ],
  [
    "extra child",
    roundedClose.replace("</svg>", '<circle cx="12" cy="12" r="2"/></svg>'),
  ],
] as const) {
  test(`reserved close artwork rejects a changed ${rule}`, () => {
    assert.throws(
      () => checkIcon(source, "close-rounded.svg"),
      /close-rounded\.svg:/,
    );
  });
}
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
  assert.equal(files.length, 36);
  for (const file of files)
    checkIcon(readFileSync(`src/icon/svg/${file}`, "utf8"), file);
  const licence = readFileSync("src/icon/svg/LICENSE", "utf8");
  assert.match(licence, /MIT/);
  assert.match(licence, /ISC/);
});
