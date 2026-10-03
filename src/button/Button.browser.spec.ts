import { expect, test } from "@playwright/test";

test("disabled Button is inert and unfocusable in both themes", {
  tag: ["@theme:light", "@theme:dark", "@component:button"],
}, async ({ page }) => {
  for (const theme of ["light", "dark"]) {
    await page.goto(
      `/iframe.html?id=form-button--disabled&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    const button = page.getByRole("button", {
      name: "Save",
      exact: true,
    });
    await expect(button).toBeVisible();
    await expect(button).toBeDisabled();
    await button.evaluate((element) => {
      element.dataset.clicks = "0";
      element.addEventListener("click", () => {
        element.dataset.clicks = String(Number(element.dataset.clicks) + 1);
      });
    });
    await page.keyboard.press("Tab");
    await expect(button).not.toBeFocused();
    await button.evaluate((element) => element.focus());
    await expect(button).not.toBeFocused();
    const box = await button.boundingBox();
    if (!box) throw new Error("Rendered Button has no pointer target");
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.keyboard.press("Enter");
    await page.keyboard.press("Space");
    await expect(button).not.toBeFocused();
    await expect(button).toHaveAttribute("data-clicks", "0");
  }
});

test("keyboard focus uses the focus token, mouse hides it in both themes", {
  tag: ["@theme:light", "@theme:dark", "@component:button"],
}, async ({ page }) => {
  for (const theme of ["light", "dark"]) {
    await page.goto(
      `/iframe.html?id=form-button--primary&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    const button = page.getByRole("button", {
      name: "Save",
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
  }
});

for (const theme of ["light", "dark"]) {
  test(`long content remains reachable in short viewport, ${theme}`, {
    tag: [`@theme:${theme}`, "@viewport:short", "@component:button"],
  }, async ({ page }) => {
    for (const scale of [1, 2]) {
      await page.setViewportSize({ width: 320, height: 240 });
      await page.goto(
        `/iframe.html?id=form-button--primary&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );
      const button = page.getByRole("button");
      // The wrap rule is pure CSS: swap in a long unbreakable label in place.
      await button.evaluate((element) => {
        element.textContent =
          "Save all changes to the document and return to the list of available documents — UnbrokenReferenceABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      });
      // CSS magnification exercises reflow; browser zoom still needs manual proof.
      await page.locator("body").evaluate((element, value) => {
        element.style.zoom = String(value);
      }, scale);
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
      await expect(button).toContainText("UnbrokenReference");
      await button.click({ trial: true });
    }
  });
}

for (const theme of ["light", "dark"]) {
  for (const variant of ["primary", "secondary"]) {
    for (const state of ["rest", "hover", "pressed", "focus", "disabled"]) {
      test(`${variant} ${state} visual tokens in ${theme}`, {
        // Chromium is covered pixel-exactly by tests/visual captures.
        tag: [`@theme:${theme}`, "@component:button", "@covered-by-captures"],
      }, async ({ page }) => {
        await page.goto(
          `/iframe.html?id=form-button--${state === "disabled" ? "disabled" : variant}&viewMode=story&globals=theme:${theme}&args=variant:${variant}`,
        );
        const button = page.getByRole("button", {
          name: "Save",
          exact: true,
        });
        await expect(button).toBeVisible();
        if (state === "hover") {
          await button.hover();
          await expect(button).toHaveAttribute("data-hovered", "true");
        }
        if (state === "pressed") {
          await button.hover();
          await page.keyboard.press("Tab");
          await expect(button).toBeFocused();
          await page.keyboard.down("Space");
          await expect(button).toHaveAttribute("data-pressed", "true");
        }
        if (state === "focus") {
          await page.keyboard.press("Tab");
          await expect(button).toBeFocused();
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
