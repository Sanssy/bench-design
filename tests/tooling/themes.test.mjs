import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

const css = () => {
  const dom = new JSDOM("<style></style>");
  dom.window.document.querySelector("style").textContent = readFileSync(
    "src/tokens.css",
    "utf8",
  );
  return [...dom.window.document.styleSheets[0].cssRules];
};
test("ratified scales are available", () => {
  const style = css()[0]?.style;
  const expected = Object.fromEntries(
    `
space-4=4px space-8=8px space-12=12px space-16=16px space-24=24px space-32=32px space-48=48px space-64=64px space-96=96px
size-meta=0.8rem size-ui=1rem size-body=1.25rem size-lead=1.5625rem size-heading=1.953125rem size-display=3.0517578125rem size-hero=5.9604644775390625rem
line-solid=1 line-tight=1.1 line-normal=1.25 line-reading=1.5 tracking-tight=-0.02em tracking-normal=0 tracking-label=0.08em
weight-regular=400 weight-semibold=600 weight-bold=700 weight-editorial=500 hair=1px stroke=2px strong=4px radius=0 offset=3px
breakpoint=640px wide-breakpoint=960px measure=640px font-base=16px editorial-soft=35 editorial-wonk=0 editorial-opsz=60
`
      .trim()
      .split(/\s+/)
      .map((pair) => pair.split("=")),
  );
  for (const [name, value] of Object.entries(expected))
    assert.equal(style?.getPropertyValue(`--bd-${name}`), value, name);
});

const light = Object.fromEntries(
  "surface=#f5f4ef surface-raised=#fffef9 surface-subtle=#eaece2 text=#18201c text-muted=#545d57 border=#7c857e border-strong=#18201c divider=#d6d8ce accent=#d8ed69 on-accent=#18201c focus=#2355ba shadow=#18201c selection=#d8ed69 on-selection=#18201c"
    .split(" ")
    .map((pair) => pair.split("=")),
);
const palette = (style, expected) => {
  const primitives = css()[0].style;
  for (const [name, value] of Object.entries(expected)) {
    const alias = style.getPropertyValue(`--bd-${name}`);
    assert.equal(primitives.getPropertyValue(alias.slice(4, -1)), value, name);
  }
};
test("light roles use the ratified palette", () => {
  palette(css()[0].style, light);
});

const dark = Object.fromEntries(
  "surface=#161c19 surface-raised=#202923 surface-subtle=#252e28 text=#e9e8e0 text-muted=#abb5ad border=#69786e border-strong=#86968a accent=#d8ed69 on-accent=#18201c focus=#a9c0fb shadow=#080d0a selection=#303b27 on-selection=#e9e8e0"
    .split(" ")
    .map((pair) => pair.split("=")),
);
test("system dark applies only without an explicit theme", () => {
  const rules = css();
  const media = rules.find(
    (rule) => rule.conditionText === "(prefers-color-scheme: dark)",
  );
  assert.ok(media, "system dark media absent");
  assert.equal(media.cssRules[0].selectorText, ":root:not([data-theme])");
  palette(media.cssRules[0].style, dark);
  const explicit = rules.find(
    (rule) => rule.selectorText === ':root[data-theme="dark"]',
  );
  assert.ok(explicit, "explicit dark absent");
  palette(explicit.style, dark);
  for (const rule of [media.cssRules[0], explicit]) {
    assert.equal(rule.style.getPropertyValue("color-scheme"), "dark");
    assert.equal(rule.style.getPropertyValue("--bd-divider"), "initial");
  }
  assert.equal(rules[0].style.getPropertyValue("color-scheme"), "light");
});
test("package exports foundations with CSS side effects", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  for (const name of ["tokens.css", "styles.css", "theme-init.js"])
    assert.equal(pkg.exports[`./${name}`], `./dist/${name}`);
  assert.deepEqual(pkg.sideEffects, ["**/*.css"]);
});
