import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import manifest from "../../components.json" with { type: "json" };
import tokens from "../../src/tokens.json" with { type: "json" };

test("generated agent guide carries catalog usage without private paths", () => {
  execFileSync(process.execPath, ["scripts/build-agent-docs.ts"]);
  const guide = readFileSync("dist/AGENTS.md", "utf8");
  assert.match(guide, /bench-design\/styles.css/);
  assert.match(guide, /theme-init.js/);
  for (const component of manifest.components) {
    assert.ok(guide.includes(`### ${component.name}\n`));
    assert.ok(guide.includes(component.import));
    assert.ok(guide.includes(component.description));
    for (const prop of component.props) {
      assert.ok(
        guide.includes(
          `| \`${prop.name}\` | \`${prop.type.replaceAll("|", "\\|")}\` | ${prop.required ? "Yes" : "No"} | ${"default" in prop ? `\`${prop.default}\`` : "—"} |`,
        ),
      );
    }
  }
  for (const group of [tokens.base, tokens.light, tokens.dark]) {
    for (const token of Object.values(group)) {
      assert.ok(guide.includes(token.$extensions["org.bench-design"].usage));
    }
  }
  assert.doesNotMatch(guide, /private-claude|\.agents\/skills|\/Users\//);
});

test("static documentation index links to pages and serves the catalog", () => {
  const directory = mkdtempSync(join(tmpdir(), "bench-docs-"));
  try {
    const entries = Object.fromEntries(
      manifest.components.map((component) => {
        const story = component.stories[0];
        assert.ok(story);
        const path = new URL(
          story.href,
          "https://storybook.local",
        ).searchParams.get("path");
        assert.ok(path);
        const storyId = path.replace("/story/", "").split("--")[0];
        return [`${storyId}--docs`, { type: "docs" }];
      }),
    );
    writeFileSync(join(directory, "index.json"), JSON.stringify({ entries }));
    execFileSync(process.execPath, [
      "scripts/build-agent-docs.ts",
      `--site=${directory}`,
    ]);
    const index = readFileSync(join(directory, "llms.txt"), "utf8");
    assert.match(index, /^# bench-design\n/);
    for (const id of [
      "docs-getting-started--page",
      "docs-principles--page",
      "docs-themes--page",
    ]) {
      assert.ok(index.includes(`./?path=/story/${encodeURIComponent(id)}`));
    }
    for (const component of manifest.components) {
      const story = component.stories[0];
      assert.ok(story);
      const path = new URL(
        story.href,
        "https://storybook.local",
      ).searchParams.get("path");
      assert.ok(path);
      const prefix = path.replace("/story/", "").split("--")[0];
      assert.ok(
        index.includes(`- [${component.name}](./?path=/docs/${prefix}--docs)`),
      );
    }
    assert.match(index, /\[DTCG tokens\]\(.\/tokens.json\)/);
    assert.equal(
      readFileSync(join(directory, "tokens.json"), "utf8"),
      readFileSync("src/tokens.json", "utf8"),
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("tarball includes integration guide and token catalog without repository instructions", () => {
  const directory = mkdtempSync(join(tmpdir(), "bench-docs-pack-"));
  try {
    execFileSync(process.execPath, ["scripts/build-agent-docs.ts"]);
    execFileSync("pnpm", ["pack", "--out", join(directory, "package.tgz")], {
      stdio: "pipe",
    });
    const entries = execFileSync(
      "tar",
      ["-tzf", join(directory, "package.tgz")],
      { encoding: "utf8" },
    ).split("\n");
    assert.ok(entries.includes("package/dist/AGENTS.md"));
    assert.ok(entries.includes("package/dist/tokens.json"));
    assert.ok(!entries.includes("package/AGENTS.md"));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("missing Storybook Docs page refuses site generation", () => {
  const directory = mkdtempSync(join(tmpdir(), "bench-docs-missing-"));
  try {
    writeFileSync(
      join(directory, "index.json"),
      JSON.stringify({
        entries: Object.fromEntries(
          manifest.components
            .filter((component) => component.name !== "Button")
            .map((component) => {
              const path = new URL(
                component.stories[0]?.href ?? "",
                "https://storybook.local",
              ).searchParams.get("path");
              return [
                `${path?.replace(/^\/story\//, "").replace(/--[^/]+$/, "")}--docs`,
                {},
              ];
            }),
        ),
      }),
    );
    assert.throws(
      () =>
        execFileSync(
          process.execPath,
          ["scripts/build-agent-docs.ts", `--site=${directory}`],
          { stdio: "pipe" },
        ),
      /Missing Storybook Docs page: form-button--docs/,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
