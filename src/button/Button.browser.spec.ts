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
      test(`disabled ${name} ${action} has no effect in ${theme}`, {
        tag: `@theme:${theme}`,
      }, async ({ page }) => {
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

for (const theme of ["light", "dark"]) {
  test(`keyboard focus uses the focus token, mouse hides it in ${theme}`, {
    tag: `@theme:${theme}`,
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=components-button--short-content&viewMode=story&globals=theme:${theme}`,
    );
    const button = page.getByRole("button", {
      name: "Enregistrer",
      exact: true,
    });
    await expect(button).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute("data-focus-visible", "true");
    const outline = await button.evaluate((element) => {
      const probe = document.createElement("span");
      probe.style.color = "var(--bd-focus)";
      probe.style.outline = "var(--bd-strong) solid var(--bd-focus)";
      probe.style.outlineOffset = "var(--bd-space-4)";
      element.append(probe);
      const probeStyle = getComputedStyle(probe);
      const expected = probeStyle.color;
      const expectedWidth = Number.parseFloat(probeStyle.outlineWidth);
      const expectedOffset = Number.parseFloat(probeStyle.outlineOffset);
      probe.remove();
      const style = getComputedStyle(element);
      return {
        color: style.outlineColor,
        expected,
        style: style.outlineStyle,
        width: Number.parseFloat(style.outlineWidth),
        expectedWidth,
        offset: Number.parseFloat(style.outlineOffset),
        expectedOffset,
      };
    });
    expect(outline.color).toBe(outline.expected);
    expect(outline.style).toBe("solid");
    expect(outline.width).toBeGreaterThan(0);
    expect(outline.width).toBe(outline.expectedWidth);
    expect(outline.offset).toBe(outline.expectedOffset);
    await button.click();
    await expect(button).not.toHaveAttribute("data-focus-visible");
    await expect(button).toHaveCSS("outline-style", "none");
  });

  for (const scale of [1, 2]) {
    test(`long content remains reachable in short viewport, ${theme}, scale ${scale}`, {
      tag: [`@theme:${theme}`, "@viewport:short"],
    }, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 240 });
      await page.goto(
        `/iframe.html?id=components-button--long-content&viewMode=story&globals=theme:${theme}`,
      );
      // CSS magnification exercises reflow; browser zoom still needs manual proof.
      await page.locator("body").evaluate((element, value) => {
        element.style.zoom = String(value);
      }, scale);
      const button = page.getByRole("button");
      await expect(button).toBeVisible();
      const bounds = await button.evaluate((element) => ({
        content: element.scrollWidth,
        available: element.clientWidth,
        page: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
        overflow: getComputedStyle(element).overflowY,
      }));
      expect(bounds.content).toBeLessThanOrEqual(bounds.available);
      expect(bounds.page).toBeLessThanOrEqual(bounds.viewport);
      expect(bounds.overflow).not.toBe("hidden");
      await page.keyboard.press("Tab");
      await expect(button).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("status")).toHaveText("Activations: 1");
      await button.click();
      await expect(page.getByRole("status")).toHaveText("Activations: 2");
    });
  }
}
