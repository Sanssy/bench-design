import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { catalog } from "../../site/catalog.ts";

test("catalog includes every manifest export and its real story destination", () => {
  const manifest = JSON.parse(readFileSync("components.json", "utf8"));
  const html = catalog(manifest);
  for (const component of manifest.components) {
    assert.ok(html.includes(`>${component.name}</a>`), component.name);
    assert.ok(html.includes(`storybook/${component.stories[0].href}`));
  }
  assert.ok(html.includes("Layout"));
});
test("catalog escapes public text", () => {
  assert.ok(
    catalog({
      components: [
        {
          name: "<Widget>",
          description: 'A & "B"',
          stories: [{ href: "./?path=/story/forms-widget--default" }],
        },
      ],
    }).includes("&lt;Widget&gt;"),
  );
});

test("catalog families can be expanded and show their export count", () => {
  const html = catalog({
    components: [
      {
        name: "Widget",
        description: "First sentence. Second sentence.",
        stories: [{ href: "./?path=/story/forms-widget--default" }],
      },
    ],
  });
  assert.ok(html.includes("<details>"));
  assert.ok(html.includes("<summary>Forms (1)</summary>"));
});

test("catalog descriptions stop after the first sentence", () => {
  const html = catalog({
    components: [
      {
        name: "Widget",
        description: "First sentence. Second sentence.",
        stories: [{ href: "./?path=/story/forms-widget--default" }],
      },
    ],
  });
  assert.ok(html.includes("First sentence."));
  assert.ok(!html.includes("Second sentence."));
});

test("editorial entry explains the language before recipes and installation", () => {
  const html = readFileSync("site/index.html", "utf8");
  const sections = [...html.matchAll(/<section id="([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(sections, [
    "top",
    "principles",
    "recipes",
    "start",
    "foundations",
    "catalog",
    "accessibility",
  ]);
  assert.equal((html.match(/class="section-head"/g) ?? []).length, 6);
  assert.equal((html.match(/class="flow-number"/g) ?? []).length, 3);
  assert.ok(html.includes('class="brand-mark" aria-hidden="true"'));
});
