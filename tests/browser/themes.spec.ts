import { readFileSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";

const tokens = readFileSync(
  new URL("../../dist/tokens.css", import.meta.url),
  "utf8",
);
const initialize = readFileSync(
  new URL("../../dist/theme-init.js", import.meta.url),
  "utf8",
);
const light = "rgb(245, 244, 239)";
const dark = "rgb(22, 28, 25)";

type ThemeScenario = {
  name: string;
  scheme: "light" | "dark";
  stored?: "light" | "dark" | "blocked";
  attribute?: "light" | "dark";
  expected: string;
};

async function renderTheme(page: Page, scenario: ThemeScenario) {
  await page.emulateMedia({ colorScheme: scenario.scheme });
  const storage =
    scenario.stored === "blocked"
      ? 'Object.defineProperty(window, "localStorage", { get() { throw new Error("storage blocked"); } });'
      : `localStorage.clear();${scenario.stored ? `localStorage.setItem("bench-design-theme", ${JSON.stringify(scenario.stored)});` : ""}`;
  const attribute = scenario.attribute
    ? ` data-theme="${scenario.attribute}"`
    : "";
  // A fresh same-origin document runs storage setup and initialization before body rendering.
  await page.route("**/theme-test.html", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html${attribute}><head><script>${storage}</script><script>${initialize}</script><style>${tokens}\nbody { background: var(--bd-surface); }</style></head><body>Theme fixture</body></html>`,
    }),
  );
  await page.goto("/theme-test.html");
}

async function expectSurface(page: Page, expected: string) {
  await expect(page.locator("body")).toHaveCSS("background-color", expected);
}

const scenarios: ThemeScenario[] = [
  { name: "system light", scheme: "light", expected: light },
  { name: "system dark", scheme: "dark", expected: dark },
  {
    name: "explicit light beats OS dark",
    scheme: "dark",
    stored: "light",
    expected: light,
  },
  {
    name: "explicit dark beats OS light",
    scheme: "light",
    stored: "dark",
    expected: dark,
  },
  {
    name: "server attribute wins over storage",
    scheme: "dark",
    stored: "dark",
    attribute: "light",
    expected: light,
  },
  {
    name: "blocked storage falls back to system",
    scheme: "dark",
    stored: "blocked",
    expected: dark,
  },
];

for (const scenario of scenarios) {
  test(scenario.name, {
    tag: `@theme:${scenario.attribute ?? (scenario.stored === "blocked" ? "system" : scenario.stored) ?? "system"}`,
  }, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await renderTheme(page, scenario);
    await expectSurface(page, scenario.expected);
    expect(errors).toEqual([]);
  });
}

test("OS change is followed live in system mode", {
  tag: "@theme:system",
}, async ({ page }) => {
  await renderTheme(page, {
    name: "system light",
    scheme: "light",
    expected: light,
  });
  await expectSurface(page, light);
  await page.emulateMedia({ colorScheme: "dark" });
  await expectSurface(page, dark);
});
