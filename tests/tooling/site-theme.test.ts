import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { JSDOM } from "jsdom";

function page(blockStorage = false) {
  const dom = new JSDOM(readFileSync("site/index.html", "utf8"));
  const saved = new Map<string, string>();
  const storage = {
    getItem: (key: string) => saved.get(key),
    setItem: (key: string, value: string) => {
      saved.set(key, value);
    },
  };
  const context = { document: dom.window.document, localStorage: storage };
  if (blockStorage)
    Object.defineProperty(context, "localStorage", {
      get() {
        throw new Error("blocked");
      },
    });
  context.document.documentElement.setAttribute("data-theme", "dark");
  runInNewContext(
    stripTypeScriptTypes(readFileSync("site/theme.ts", "utf8")),
    context,
  );
  return context;
}

test("theme buttons expose the saved choice and persist a new choice", () => {
  const window = page();
  const light = window.document.querySelector<HTMLButtonElement>(
    '[data-theme-choice="light"]',
  );
  assert.ok(light, "Light button missing");
  assert.equal(
    window.document
      .querySelector('[data-theme-choice="dark"]')
      ?.getAttribute("aria-pressed"),
    "true",
  );
  light.click();
  assert.equal(
    window.document.documentElement.getAttribute("data-theme"),
    "light",
  );
  assert.equal(light.getAttribute("aria-pressed"), "true");
  assert.equal(window.localStorage.getItem("bench-design-theme"), "light");
  window.document
    .querySelector<HTMLButtonElement>('[data-theme-choice="system"]')
    ?.click();
  assert.equal(
    window.document.documentElement.hasAttribute("data-theme"),
    false,
  );
  assert.equal(light.getAttribute("aria-pressed"), "false");
});

test("theme buttons still change theme when storage is blocked", () => {
  const window = page(true);
  const light = window.document.querySelector<HTMLButtonElement>(
    '[data-theme-choice="light"]',
  );
  assert.ok(light, "Light button missing");
  light.click();
  assert.equal(
    window.document.documentElement.getAttribute("data-theme"),
    "light",
  );
});
