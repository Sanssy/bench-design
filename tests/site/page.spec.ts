import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: accessible page, real assets and internal destinations`, async ({
    page,
    request,
  }) => {
    await page.goto("./");
    await page.getByRole("button", { name: theme, exact: false }).click();
    await page.evaluate(async () => {
      await document.fonts.ready;
      for (const family of ["Bench Manrope", "Bench Fraunces", "Bench Plex"]) {
        if (!(await document.fonts.load(`16px "${family}"`)).length)
          throw new Error(`Missing font: ${family}`);
      }
    });
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    const links = await page
      .locator("a[href]")
      .evaluateAll((anchors) =>
        anchors.map((anchor) => (anchor as HTMLAnchorElement).href),
      );
    for (const href of new Set(links)) {
      const url = new URL(href);
      if (url.origin !== new URL(page.url()).origin) continue;
      if (url.hash) await expect(page.locator(url.hash)).toHaveCount(1);
      else expect((await request.get(href)).ok()).toBeTruthy();
    }
    const ids = await page
      .locator('a[href*="?path=/story/"]')
      .evaluateAll((anchors) =>
        anchors.map((anchor) =>
          new URL((anchor as HTMLAnchorElement).href).searchParams
            .get("path")
            ?.replace("/story/", ""),
        ),
      );
    const index = await (await request.get("storybook/index.json")).json();
    for (const id of ids) expect(index.entries[id ?? ""]).toBeTruthy();
    await expect(page.locator("[data-specimen]")).toHaveCount(3);
    expect(
      await page.evaluate(() => document.fonts.check('16px "Bench Manrope"')),
    ).toBeTruthy();
    await page.setViewportSize({ width: 320, height: 800 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(320);
  });
}
test("theme selection persists, follows system and supports keyboard", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("./");
  const theme = page.getByRole("button", { name: "Light", exact: true });
  await theme.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(theme).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "System", exact: true }).click();
  await expect(page.locator("html")).not.toHaveAttribute("data-theme");
  const dark = await page
    .locator("body")
    .evaluate((body) => getComputedStyle(body).backgroundColor);
  await page.emulateMedia({ colorScheme: "light" });
  expect(
    await page
      .locator("body")
      .evaluate((body) => getComputedStyle(body).backgroundColor),
  ).not.toBe(dark);
});

test("keyboard reaches a visibly focused Storybook CTA", async ({ page }) => {
  await page.goto("./");
  const cta = page.getByRole("link", { name: "Open Storybook", exact: true });
  for (let step = 0; step < 20; step++) {
    await page.keyboard.press("Tab");
    if (await cta.evaluate((link) => link === document.activeElement)) break;
  }
  await expect(cta).toBeFocused();
  const focus = await cta.evaluate((link) => {
    const style = getComputedStyle(link);
    const probe = document.createElement("span");
    probe.style.color = "var(--bd-focus)";
    document.body.append(probe);
    const token = getComputedStyle(probe).color;
    probe.remove();
    return {
      style: style.outlineStyle,
      width: style.outlineWidth,
      color: style.outlineColor,
      token,
    };
  });
  expect(focus.style).toBe("solid");
  expect(Number.parseFloat(focus.width)).toBeGreaterThan(0);
  expect(focus.color).toBe(focus.token);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/storybook\/$/);
});

test("introductory path precedes an expandable complete catalog", async ({
  page,
}) => {
  await page.goto("./");
  expect(
    await page
      .locator("main > section")
      .evaluateAll((sections) => sections.map((section) => section.id)),
  ).toEqual([
    "top",
    "principles",
    "recipes",
    "start",
    "foundations",
    "catalog",
    "accessibility",
  ]);
  await expect(
    page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Recipes" }),
  ).toHaveAttribute("href", "#recipes");
  await expect(
    page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Accessibility" }),
  ).toHaveAttribute("href", "#accessibility");
  await expect(page.locator(".section-head")).toHaveCount(6);
  await expect(page.locator(".flow-number")).toHaveText(["1", "2", "3"]);
  const family = page.locator(".catalog details").first();
  await expect(family).not.toHaveAttribute("open");
  await family.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(family).toHaveAttribute("open", "");
  await expect(family.getByRole("link").first()).toBeVisible();
  await expect(page.locator(".specimen-stage[inert]")).toHaveCount(3);
  await expect(page.getByText("Static specimen", { exact: true })).toHaveCount(
    3,
  );
  await expect(
    page.getByRole("link", { name: "integration documentation" }),
  ).toHaveAttribute(
    "href",
    "storybook/./?path=/story/docs-getting-started--page",
  );
});
