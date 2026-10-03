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

for (const theme of ["light", "dark"]) {
  for (const name of ["Activer", "Envoyer", "Réinitialiser"]) {
    for (const action of ["pointer", "Enter", "Space"] as const) {
      test(`disabled ${name} ${action} has no effect in ${theme}`, async ({
        page,
      }) => {
        await page.goto(
          `/iframe.html?id=components-button--disabled&viewMode=story&globals=theme:${theme}`,
        );
        const button = page.getByRole("button", { name, exact: true });
        await expect(button).toBeVisible();
        const input = page.getByRole("textbox", { name: "Nom" });
        await input.fill("Modifié");
        if (action === "pointer") {
          // Real pointer input: locator.click waits for enabled controls.
          const box = await button.boundingBox();
          if (!box) throw new Error("Rendered Button has no pointer target");
          await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        } else {
          await input.evaluate((element) => element.blur());
          // A disabled native button rejects focus; the mutant accepts it.
          await button.evaluate((element) => element.focus());
          await page.keyboard.press(action);
        }
        await expect(page.getByRole("status")).toHaveText(
          "Activations: 0; Soumissions: 0; Réinitialisations: 0",
        );
        await expect(input).toHaveValue("Modifié");
        await expect(button).toBeDisabled();
      });
    }
  }
}
