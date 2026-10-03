import { expect, test } from "@playwright/test";

for (const action of ["pointer", "Enter", "Space"] as const) {
  test(`${action} activates Button once`, async ({ page }) => {
    await page.goto(
      "/iframe.html?id=components-button--activation&viewMode=story",
    );
    const button = page.getByRole("button", { name: "Activer", exact: true });
    if (action === "pointer") await button.click();
    else {
      await expect(button).toBeVisible();
      await page.keyboard.press("Tab");
      await expect(button).toBeFocused();
      await page.keyboard.press(action);
    }
    await expect(page.getByRole("status")).toHaveText("Activations: 1");
  });
}

test("default button leaves form unsubmitted", async ({ page }) => {
  await page.goto("/iframe.html?id=components-button--form&viewMode=story");
  await page.getByRole("button", { name: "Action", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Soumissions: 0");
});
test("submit button submits form once", async ({ page }) => {
  await page.goto("/iframe.html?id=components-button--form&viewMode=story");
  await page.getByRole("button", { name: "Envoyer", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Soumissions: 1");
});
test("reset restores the native field", async ({ page }) => {
  await page.goto("/iframe.html?id=components-button--form&viewMode=story");
  await page.getByRole("textbox", { name: "Nom" }).fill("Modifié");
  await page
    .getByRole("button", { name: "Réinitialiser", exact: true })
    .click();
  await expect(page.getByRole("textbox", { name: "Nom" })).toHaveValue(
    "Initial",
  );
});
