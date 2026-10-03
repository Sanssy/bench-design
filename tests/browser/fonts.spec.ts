import { readFileSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";

const families = ["Bench Fraunces", "Bench Manrope", "Bench Plex"];
const roles = ["editorial", "ui", "metadata", "mono"];
const fallbacks = [
  '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
  '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
];

async function renderFonts(page: Page, missing = false) {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.route("**/font-assets/**", async (route) => {
    const name = new URL(route.request().url()).pathname.slice(
      "/font-assets/".length,
    );
    if (missing && name.endsWith(".ttf")) {
      await route.fulfill({ status: 404, body: "" });
      return;
    }
    await route.fulfill({
      body: readFileSync(new URL(`../../dist/${name}`, import.meta.url)),
      contentType: name.endsWith(".ttf") ? "font/ttf" : "text/css",
    });
  });
  await page.route("**/fonts-test.html", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><head><link rel="stylesheet" href="/font-assets/styles.css"></head><body>${roles.map((role, index) => `<div><span id="${role}" style='display:inline-block;font-size:16px;font-family:var(--bd-font-${role})'>Readable fallback 012345</span><span id="reference-${role}" style='display:inline-block;font-size:16px;font-family:${fallbacks[index]}'>Readable fallback 012345</span></div>`).join("")}</body></html>`,
    }),
  );
  await page.goto("/fonts-test.html");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  return requests;
}

test("distributed fonts load through document.fonts", async ({ page }) => {
  await renderFonts(page);
  const loaded = await page.evaluate(async (names) => {
    const result = [];
    for (const family of names) {
      const faces = await document.fonts.load(
        `400 16px "${family}"`,
        "Readable 012345",
      );
      result.push({
        count: faces.length,
        loaded: faces.every((face) => face.status === "loaded"),
        available: document.fonts.check(`400 16px "${family}"`),
      });
    }
    return result;
  }, families);
  expect(loaded).toEqual(
    families.map(() => ({ count: 1, loaded: true, available: true })),
  );
});

test("font rendering makes no request outside the consumer origin", async ({
  page,
}) => {
  const requests = await renderFonts(page);
  const origin = new URL(page.url()).origin;
  expect(requests.filter((url) => new URL(url).origin !== origin)).toEqual([]);
  expect(requests.filter((url) => url.endsWith(".ttf"))).toHaveLength(3);
});

test("missing fonts leave readable text matching the system fallback", async ({
  page,
}) => {
  const requests = await renderFonts(page, true);
  expect(requests.filter((url) => url.endsWith(".ttf"))).toHaveLength(3);
  for (const role of roles) {
    const text = page.locator(`#${role}`);
    await expect(text).toBeVisible();
    await expect(text).toHaveText("Readable fallback 012345");
    const reference = await page.locator(`#reference-${role}`).boundingBox();
    const rendered = await text.boundingBox();
    expect(reference).not.toBeNull();
    expect(rendered).not.toBeNull();
    expect(rendered?.width).toBe(reference?.width);
    expect(rendered?.height).toBe(reference?.height);
  }
  expect(
    await page.evaluate(() => [...document.fonts].map((face) => face.status)),
  ).toEqual(["error", "error", "error"]);
});
