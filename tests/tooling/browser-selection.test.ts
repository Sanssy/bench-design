import assert from "node:assert/strict";
import test from "node:test";
import {
  componentImporters,
  selectBrowserTests,
  selectionFromBase,
  shardPlan,
} from "../../scripts/select-browser-tests.ts";

test("component edits include its browser and axe scenarios only", () => {
  const plan = selectBrowserTests(["src/link/Link.tsx"]);
  assert.equal(plan.mode, "scoped");
  assert.equal(plan.visual, false);
  const grep = new RegExp(plan.args[1] ?? "");
  assert(grep.test("Link focus @component:link @theme:dark"));
  assert(grep.test("WCAG story @component:link"));
  assert(!grep.test("Text @component:text"));
  assert(!grep.test("Other @component:link-extra"));
});
test("a component edit also selects the components that import it", () => {
  const plan = selectBrowserTests(["src/text/Text.tsx"], {
    text: ["link"],
    link: ["card"],
  });
  const grep = new RegExp(plan.args[1] ?? "");
  assert(grep.test("Text @component:text"));
  assert(grep.test("Link @component:link"));
  assert(grep.test("Card @component:card"));
  assert(!grep.test("Button @component:button"));
  assert.deepEqual([...new Set(componentImporters().text)].sort(), [
    "app-shell",
    "badge",
    "card",
    "dialog",
    "divider",
    "empty-state",
    "grid",
    "inline",
    "link",
    "popover",
    "recipes",
    "side-panel",
    "stack",
    "surface",
    "value",
  ]);
});
test("IconButton edits compare visual captures too", () => {
  assert.equal(
    selectBrowserTests(["src/icon-button/IconButton.tsx"]).visual,
    true,
  );
  assert.equal(selectBrowserTests(["src/link/Link.tsx"]).visual, false);
});
test("browser file edits select that file and union with component edits", () => {
  const plan = selectBrowserTests([
    "tests/browser/fonts.spec.ts",
    "src/button/Button.css",
  ]);
  assert.equal(plan.visual, true);
  const grep = new RegExp(plan.args[1] ?? "");
  assert(grep.test("tests/browser/fonts.spec.ts font loads"));
  assert(grep.test("Button @component:button"));
  assert(!grep.test("tests/browser/themes.spec.ts theme"));
});
test("tooling, ADR and root Markdown edits need no browser", () => {
  for (const path of [
    "tests/tooling/example.test.ts",
    "docs/decisions/0001.md",
    "README.md",
  ])
    assert.deepEqual(selectBrowserTests([path]), {
      mode: "empty",
      args: [],
      visual: false,
    });
  assert.equal(selectBrowserTests([]).mode, "empty");
});
test("shared and unknown paths force full browser and visual suites", () => {
  for (const path of [
    "tokens.json",
    "src/styles.css",
    ".storybook/main.ts",
    "playwright.config.ts",
    "pnpm-lock.yaml",
    "other/file",
    "docs/other.md",
  ])
    assert.deepEqual(selectBrowserTests(["src/link/Link.tsx", path]), {
      mode: "full",
      args: [],
      visual: true,
    });
});
test("missing or unresolvable Git base conservatively runs everything", () => {
  assert.equal(selectBrowserTests(null).mode, "full");
  assert.equal(selectionFromBase(undefined).mode, "full");
  assert.equal(selectionFromBase("nonexistent-4c1-base").mode, "full");
});

test("shards split the full suite and run a scoped selection once", () => {
  const full = selectBrowserTests(null);
  assert.deepEqual(shardPlan(full, "1/2"), {
    mode: "full",
    args: ["--shard=1/2"],
    visual: true,
  });
  assert.deepEqual(shardPlan(full, "2/2"), {
    mode: "full",
    args: ["--shard=2/2"],
    visual: false,
  });
  const scoped = selectBrowserTests(["src/link/Link.tsx"]);
  assert.deepEqual(shardPlan(scoped, "1/2"), scoped);
  assert.equal(shardPlan(scoped, "2/2").mode, "empty");
  assert.deepEqual(shardPlan(scoped, undefined), scoped);
});
