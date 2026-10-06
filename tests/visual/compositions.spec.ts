import { expect, test } from "@playwright/test";

const recipes = [
  "recipes-library--browse-and-inspect",
  "recipes-workspace--edit-in-panel",
  "recipes-choice--confirm-selection",
  "recipes-document-library--browse-documents",
  "recipes-ask-with-sources--ask-and-read",
  "recipes-overview--personal-records",
  "layout-appheader--centered-navigation",
  "layout-page--document",
];
const components = [
  "surfaces-card--collection-summary",
  "surfaces-surface--workspace",
  "surfaces-surface--inverse",
  "form-textfield--review",
  "form-select--review",
  "form-checkbox--review",
  "form-radiogroup--cards-review",
  "feedback-notice--storage-messages",
  "feedback-status--upload-results",
  "navigation-tabs--library-sections",
  "collections-gridlist--resource-cards",
  "collections-table--resource-inventory",
  "navigation-topnav--page-navigation",
  "surfaces-actioncard--archive",
  "surfaces-actioncard--editorial-entity",
  "navigation-actionlist--outlined-steps",
  "data-timeline--event-columns",
  "data-connectedlist--related-resources",
  "media-icontile--category-markers",
  "form-composer--card",
  "layout-paper--document",
  "data-referencelist--accent-references",
  "feedback-badge--related-topics",
  "data-categorylabel--categories",
  "form-button--pending",
  "form-button--icon-end",
  "typography-link--metadata",
  "surfaces-card--outlined-media",
  "form-searchfield--underlined",
  "form-segmentedcontrol--facets-with-counts",
  "collections-gridlist--media-cards",
  "collections-collectionview--title-search",
  "surfaces-emptystate--editorial-library",
  "import-dropzone--editorial-start",
  "navigation-tabs--framed-sections",
  "navigation-tabs--rich-sections",
  "surfaces-surface--category-preview",
  "data-avatar--identity",
];

for (const theme of ["light", "dark"] as const) {
  for (const { story, width } of [
    ...recipes.map((story) => ({ story, width: 1280 })),
    ...components.map((story) => ({ story, width: 800 })),
  ]) {
    test(
      `${story} visual in ${theme}`,
      {
        tag: [`@theme:${theme}`, "@viewport:desktop"],
      },
      async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(
          `/iframe.html?id=${story}&viewMode=story&globals=a11y.manual:!true;theme:${theme}&embed=true`,
        );
        await expect(page.locator("#storybook-root")).not.toBeEmpty();
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await page.evaluate(async () => {
          await document.fonts.ready;
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        });
        await page.mouse.move(-1, -1);
        const file = `${story}-${theme}.png`;
        const candidate = testInfo.outputPath(`candidate-${file}`);
        await page.screenshot({
          path: candidate,
          fullPage: true,
          animations: "disabled",
          caret: "hide",
        });
        await testInfo.attach(`candidate-${file}`, {
          path: candidate,
          contentType: "image/png",
        });
        await expect(page).toHaveScreenshot(file, { fullPage: true });
      },
    );
  }
}
