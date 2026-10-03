import assert from "node:assert/strict";
import test from "node:test";
import {
  browserTagErrors,
  checkBrowserTags,
} from "../../scripts/check-browser-tags.ts";

test("themed story URLs require matching test tags", () => {
  const story =
    'async ({ page }) => { await page.goto("/iframe.html?id=button&globals=theme:dark"); }';
  assert.equal(browserTagErrors(`test("missing", ${story});`).length, 1);
  assert.equal(
    browserTagErrors(`test("wrong", { tag: "@theme:light" }, ${story});`)
      .length,
    1,
  );
  assert.deepEqual(
    browserTagErrors(`test("valid", { tag: "@theme:dark" }, ${story});`),
    [],
  );
  assert.equal(
    browserTagErrors(
      'test("dynamic", { tag: `@theme:${other}` }, async ({page}) => { await page.goto(`/iframe.html?globals=theme:${theme}`); });',
    ).length,
    1,
  );
  assert.deepEqual(
    browserTagErrors(
      'test("dynamic", { tag: `@theme:${theme}` }, async ({page}) => { await page.goto(`/iframe.html?globals=theme:${theme}`); });',
    ),
    [],
  );
});
test("all existing browser stories declare consistent theme tags", () => {
  assert.doesNotThrow(() => checkBrowserTags());
});
