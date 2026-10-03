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
    await page.mouse.move(0, 0);
    await expect(button).not.toHaveAttribute("data-hovered");
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

for (const theme of ["light", "dark"]) {
  for (const variant of ["primary", "secondary"]) {
    for (const state of ["rest", "hover", "pressed", "focus", "disabled"]) {
      test(`${variant} ${state} visual tokens in ${theme}`, {
        tag: `@theme:${theme}`,
      }, async ({ page }) => {
        await page.goto(
          `/iframe.html?id=components-button--${variant}-${state}&viewMode=story&globals=theme:${theme}`,
        );
        const button = page.getByRole("button", {
          name: "Enregistrer",
          exact: true,
        });
        await expect(button).toBeVisible();
        if (state === "hover") {
          await button.hover();
          await expect(button).toHaveAttribute("data-hovered", "true");
        }
        if (state === "pressed") {
          await button.hover();
          await button.focus();
          await page.keyboard.down("Space");
          await expect(button).toHaveAttribute("data-pressed", "true");
        }
        if (state === "focus") {
          await expect(button).toHaveAttribute("data-focus-visible", "true");
          if (variant === "secondary") await button.hover();
        }
        if (state === "disabled") await expect(button).toBeDisabled();
        const values = await button.evaluate(
          (element, scenario) => {
            const probe = document.createElement("span");
            probe.style.background =
              scenario.state === "disabled"
                ? "transparent"
                : scenario.variant === "secondary"
                  ? "var(--bd-surface)"
                  : scenario.state === "hover" || scenario.state === "pressed"
                    ? "var(--bd-accent-hover)"
                    : "var(--bd-accent)";
            probe.style.color =
              scenario.state === "disabled"
                ? "var(--bd-text-muted)"
                : scenario.variant === "secondary"
                  ? "var(--bd-text)"
                  : "var(--bd-on-accent)";
            probe.style.border = "var(--bd-hair) solid var(--bd-border-strong)";
            probe.style.boxShadow =
              scenario.variant === "primary" &&
              scenario.state !== "pressed" &&
              scenario.state !== "disabled"
                ? scenario.state === "hover"
                  ? "var(--bd-hair) var(--bd-hair) 0 var(--bd-shadow)"
                  : "var(--bd-offset) var(--bd-offset) 0 var(--bd-shadow)"
                : "none";
            probe.style.transform =
              scenario.state === "pressed"
                ? "translate(var(--bd-offset), var(--bd-offset))"
                : scenario.state === "hover" && scenario.variant === "primary"
                  ? "translate(var(--bd-hair), var(--bd-hair))"
                  : "none";
            probe.style.minBlockSize = "var(--bd-space-48)";
            probe.style.padding = "var(--bd-space-12) var(--bd-space-16)";
            probe.style.fontFamily = "var(--bd-font-ui)";
            probe.style.fontSize = "var(--bd-size-meta)";
            probe.style.fontWeight = "var(--bd-weight-semibold)";
            probe.style.lineHeight = "var(--bd-line-normal)";
            probe.style.outline =
              "var(--bd-hair) solid var(--bd-border-strong)";
            probe.style.outlineOffset = "var(--bd-hair)";
            element.append(probe);
            const expected = getComputedStyle(probe);
            const actual = getComputedStyle(element);
            const result = {
              background: [actual.backgroundColor, expected.backgroundColor],
              color: [actual.color, expected.color],
              border: [actual.borderTopColor, expected.borderTopColor],
              width: [actual.borderTopWidth, expected.borderTopWidth],
              shadow: [actual.boxShadow, expected.boxShadow],
              geometry: [
                actual.minBlockSize,
                actual.paddingBlockStart,
                actual.paddingInlineStart,
                actual.fontFamily,
                actual.fontSize,
                actual.fontWeight,
                actual.lineHeight,
              ],
              expectedGeometry: [
                expected.minBlockSize,
                expected.paddingBlockStart,
                expected.paddingInlineStart,
                expected.fontFamily,
                expected.fontSize,
                expected.fontWeight,
                expected.lineHeight,
              ],
              outline: [actual.outline, expected.outline],
              outlineOffset: [actual.outlineOffset, expected.outlineOffset],
              transform: [actual.transform, expected.transform],
            };
            probe.remove();
            return result;
          },
          { state, variant },
        );
        expect(values.background[0]).toBe(values.background[1]);
        expect(values.color[0]).toBe(values.color[1]);
        expect(values.geometry).toEqual(values.expectedGeometry);
        expect(values.shadow[0]).toBe(values.shadow[1]);
        expect(values.transform[0]).toBe(values.transform[1]);
        if (state === "disabled") {
          await expect(button).toHaveCSS(
            "border-top-color",
            "rgba(0, 0, 0, 0)",
          );
          await expect(button).toHaveCSS("cursor", "default");
        } else {
          expect(values.border[0]).toBe(values.border[1]);
          expect(values.width[0]).toBe(values.width[1]);
        }
        if (state === "hover" && variant === "secondary") {
          expect(values.outline[0]).toBe(values.outline[1]);
          expect(values.outlineOffset[0]).toBe(values.outlineOffset[1]);
        }
        if (state === "focus") {
          const focus = await button.evaluate((element) => {
            const probe = document.createElement("span");
            probe.style.outline = "var(--bd-strong) solid var(--bd-focus)";
            probe.style.outlineOffset = "var(--bd-space-4)";
            element.append(probe);
            const expected = getComputedStyle(probe);
            const actual = getComputedStyle(element);
            const result = [
              actual.outline,
              expected.outline,
              actual.outlineOffset,
              expected.outlineOffset,
            ];
            probe.remove();
            return result;
          });
          expect(focus[0]).toBe(focus[1]);
          expect(focus[2]).toBe(focus[3]);
        }
        if (state === "pressed") {
          expect(values.transform[0]).toBe(values.transform[1]);
          await expect(button).toHaveCSS("box-shadow", "none");
          await page.keyboard.up("Space");
        }
      });
    }
  }
}
