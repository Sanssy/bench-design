import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const storyUrls = {
  button:
    "/iframe.html?id=form-button--primary&viewMode=story&globals=a11y.manual:!true;theme:",
  card: "/iframe.html?id=surfaces-card--saved-collection&viewMode=story&globals=a11y.manual:!true;theme:",
} as const;

async function visit(
  page: Page,
  story: keyof typeof storyUrls,
  theme: "light" | "dark",
) {
  await page.goto(`${storyUrls[story]}${theme}`);
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  const component = page.locator(
    story === "button" ? ".bd-button" : ".bd-card",
  );
  await expect(component).toBeVisible();
  return component;
}

async function setRadiusOverride(
  page: Page,
  declarations: Record<string, string>,
) {
  await page.evaluate((values) => {
    for (const [name, value] of Object.entries(values)) {
      document.body.style.setProperty(name, value);
    }
  }, declarations);
}

for (const theme of ["light", "dark"] as const) {
  test(`semantic radius compatibility in ${theme}`, {
    tag: [`@theme:${theme}`, "@component:semantic-radius"],
  }, async ({ page }) => {
    const button = await visit(page, "button", theme);
    await expect(button).toHaveCSS("border-radius", "0px");
    await expect(
      new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze(),
    ).resolves.toMatchObject({ violations: [] });

    const card = await visit(page, "card", theme);
    await expect(card).toHaveCSS("border-radius", "0px");
    await expect(
      new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze(),
    ).resolves.toMatchObject({ violations: [] });

    const legacyButton = await visit(page, "button", theme);
    await setRadiusOverride(page, { "--bd-radius": "12px" });
    await expect(legacyButton).toHaveCSS("border-radius", "12px");

    const legacyCard = await visit(page, "card", theme);
    await setRadiusOverride(page, { "--bd-radius": "12px" });
    await expect(legacyCard).toHaveCSS("border-radius", "12px");

    const roleButton = await visit(page, "button", theme);
    await setRadiusOverride(page, {
      "--bd-radius": "12px",
      "--bd-radius-control": "10px",
      "--bd-radius-surface": "14px",
    });
    await expect(roleButton).toHaveCSS("border-radius", "10px");
    await expect(
      roleButton.evaluate(() =>
        getComputedStyle(document.body).getPropertyValue("--bd-radius"),
      ),
    ).resolves.toBe("12px");

    const roleCard = await visit(page, "card", theme);
    await setRadiusOverride(page, {
      "--bd-radius": "12px",
      "--bd-radius-control": "10px",
      "--bd-radius-surface": "14px",
    });
    await expect(roleCard).toHaveCSS("border-radius", "14px");
  });
}
