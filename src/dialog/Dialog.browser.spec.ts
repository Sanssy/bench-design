import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`Dialog veil and elevation ${theme}`, {
    tag: ["@component:dialog", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=overlays-dialog--document-details&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.getByRole("button", { name: "View details" }).click();
    await expect(
      page.getByRole("dialog", { name: "Document details" }),
    ).toBeVisible();
    const pairs = await page
      .locator(".bd-modal-overlay")
      .evaluate((overlay) => {
        const modal = overlay.querySelector(".bd-modal");
        if (!modal) throw new Error("Modal missing");
        const header = modal.querySelector(".bd-dialog-header");
        const actions = modal.querySelector(".bd-dialog-actions");
        if (!header || !actions) throw new Error("Dialog separators missing");
        const probe = document.createElement("div");
        Object.assign(probe.style, {
          background: "var(--bd-veil)",
          backdropFilter: "blur(var(--bd-veil-blur))",
          boxShadow: "var(--bd-elevation-dialog)",
          border: "var(--bd-hair) solid var(--bd-border-strong)",
          color: "var(--bd-surface)",
          width: "var(--bd-measure)",
        });
        overlay.append(probe);
        const actual = getComputedStyle(modal),
          veil = getComputedStyle(overlay),
          expected = getComputedStyle(probe);
        const pairs = [
          [veil.backgroundColor, expected.backgroundColor],
          [veil.backdropFilter, expected.backdropFilter],
          [actual.boxShadow, expected.boxShadow],
          [actual.borderWidth, expected.borderWidth],
          [actual.borderColor, expected.borderColor],
          [actual.backgroundColor, expected.color],
          [actual.width, expected.width],
          [getComputedStyle(header).borderBlockEndColor, expected.borderColor],
          [getComputedStyle(header).borderBlockEndWidth, expected.borderWidth],
          [
            getComputedStyle(actions).borderBlockStartColor,
            expected.borderColor,
          ],
          [
            getComputedStyle(actions).borderBlockStartWidth,
            expected.borderWidth,
          ],
        ];
        probe.remove();
        return pairs;
      });
    for (const [actual, expected] of pairs) expect(actual).toBe(expected);
  });
}

test("Dialog contains focus, Escape closes and restores the trigger", {
  tag: ["@component:dialog", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=overlays-dialog--document-details&viewMode=story&globals=a11y.manual:!true;theme:light",
  );
  const trigger = page.getByRole("button", { name: "View details" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Document details" });
  await expect(dialog).toBeVisible();
  // React Aria makes the page behind inert: out of the accessibility tree
  // and unreachable by pointer or keyboard.
  expect(
    await page.evaluate(
      () => (document.querySelector("#storybook-root") as HTMLElement).inert,
    ),
  ).toBe(true);
  await expect(dialog).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "Download" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
  // The focused Close button shows its tooltip: the first Escape dismisses
  // the tooltip (WCAG 1.4.13), the second closes the dialog.
  await expect(page.getByRole("tooltip")).toHaveText("Close");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("Dialog body scrolls while its footer stays visible at desktop and short mobile sizes", {
  tag: ["@component:dialog", "@theme:light"],
}, async ({ page }) => {
  for (const viewport of [
    { width: 1000, height: 720 },
    { width: 360, height: 480 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(
      "/iframe.html?id=overlays-dialog--reading-guide&viewMode=story&globals=a11y.manual:!true;theme:light",
    );
    await page.getByRole("button", { name: "Read guide" }).click();
    const body = page.locator(".bd-dialog-body"),
      footer = page.locator(".bd-dialog-actions");
    await expect(footer).toBeVisible();
    const before = await footer.boundingBox();
    const scroll = await body.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
      return {
        overflow: getComputedStyle(element).overflowY,
        height: element.clientHeight,
        total: element.scrollHeight,
        top: element.scrollTop,
      };
    });
    expect(scroll.overflow).toBe("auto");
    expect(scroll.total).toBeGreaterThan(scroll.height);
    expect(scroll.top).toBeGreaterThan(0);
    await body.evaluate((element) => {
      element.scrollTop = 0;
    });
    await body.focus();
    await page.keyboard.press("End");
    await expect
      .poll(() => body.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    expect(await footer.boundingBox()).toEqual(before);
    const modal = await page.locator(".bd-modal").boundingBox();
    expect(modal).not.toBeNull();
    expect(modal?.height).toBeLessThanOrEqual(viewport.height * 0.88 + 1);
    const sideMargin = await page.evaluate(
      () =>
        Number.parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--bd-space-32",
          ),
        ) / 2,
    );
    expect(modal?.x).toBeGreaterThanOrEqual(sideMargin);
    expect((modal?.x ?? 0) + (modal?.width ?? 0)).toBeLessThanOrEqual(
      viewport.width - sideMargin,
    );
    expect((before?.y ?? 0) + (before?.height ?? 0)).toBeLessThan(
      viewport.height,
    );
  }
});

test("Dialog appearance follows motion tokens and respects reduced motion", {
  tag: ["@component:dialog", "@theme:light"],
}, async ({ page }) => {
  // Deterministic: check the entering rule React Aria triggers through
  // data-entering, instead of racing the animationstart event under load.
  await page.goto(
    "/iframe.html?id=overlays-dialog--document-details&viewMode=story&globals=a11y.manual:!true;theme:light",
  );
  const entering = () =>
    page.evaluate(() => {
      const overlay = document.createElement("div");
      overlay.className = "bd-modal-overlay";
      overlay.setAttribute("data-entering", "");
      const probe = document.createElement("div");
      probe.style.animationDuration = "var(--bd-duration-fast)";
      probe.style.animationTimingFunction = "var(--bd-ease-out)";
      document.body.append(overlay, probe);
      const actual = getComputedStyle(overlay);
      const expected = getComputedStyle(probe);
      const result = {
        name: actual.animationName,
        duration: [actual.animationDuration, expected.animationDuration],
        ease: [
          actual.animationTimingFunction,
          expected.animationTimingFunction,
        ],
      };
      overlay.remove();
      probe.remove();
      return result;
    });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const motion = await entering();
  expect(motion.name).toBe("bd-overlay-appear");
  expect(motion.duration[0]).toBe(motion.duration[1]);
  expect(motion.ease[0]).toBe(motion.ease[1]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect((await entering()).name).toBe("none");
  // React Aria still opens the dialog without the animation.
  await page.getByRole("button", { name: "View details" }).click();
  await expect(
    page.getByRole("dialog", { name: "Document details" }),
  ).toBeVisible();
});

test("Open Dialog passes automated axe in both themes", {
  tag: ["@component:dialog", "@theme:light", "@theme:dark"],
}, async ({ page }) => {
  for (const theme of ["light", "dark"]) {
    for (const [story, trigger, title] of [
      ["document-details", "View details", "Document details"],
      ["reading-guide", "Read guide", "Reading guide"],
    ] as const) {
      await page.goto(
        `/iframe.html?id=overlays-dialog--${story}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );
      await page.getByRole("button", { name: trigger }).click();
      await expect(page.getByRole("dialog", { name: title })).toBeVisible();
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      expect(result.violations).toEqual([]);
    }
  }
});

for (const theme of ["light", "dark"] as const) {
  test(`Controlled Dialog restores origin focus and passes axe at 320px ${theme}`, {
    tag: ["@component:dialog", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(
      `/iframe.html?id=overlays-dialog--controlled-help&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const origin = page.getByRole("button", { name: "Read editing help" });
    await expect(origin).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await origin.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Editing help" });
    await expect(dialog).toBeVisible();
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
        .violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(origin).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(dialog).toBeVisible();
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(origin).toBeFocused();
  });
}
