import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("token generation preserves ratified CSS", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/generate-tokens.ts", "--stdout"],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, readFileSync("src/tokens.css", "utf8"));
});

test("token check rejects divergent CSS without rewriting it", () => {
  const directory = mkdtempSync(join(tmpdir(), "bench-tokens-"));
  const path = join(directory, "tokens.css");
  const divergent = readFileSync("src/tokens.css", "utf8").replace(
    "4px",
    "5px",
  );
  try {
    writeFileSync(path, divergent);
    const result = spawnSync(
      process.execPath,
      ["scripts/generate-tokens.ts", "--check", `--css=${path}`],
      { encoding: "utf8" },
    );
    assert.equal(result.status, 1, "divergence must fail");
    assert.match(result.stderr, /diverge from tokens.json/);
    assert.equal(readFileSync(path, "utf8"), divergent);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("DTCG hex fallback agrees with every sRGB color", () => {
  const tokens = JSON.parse(readFileSync("src/tokens.json", "utf8"));
  for (const theme of ["light", "dark"]) {
    for (const token of Object.values(tokens[theme]) as {
      $value: { components: number[]; hex: string } | string;
    }[]) {
      if (typeof token.$value === "string") continue;
      const hex = `#${token.$value.components
        .map((channel) =>
          Math.round(channel * 255)
            .toString(16)
            .padStart(2, "0"),
        )
        .join("")}`;
      assert.equal(token.$value.hex, hex);
    }
  }
});

test("usage metadata is guidance rather than a repeated label", () => {
  const tokens = JSON.parse(readFileSync("src/tokens.json", "utf8"));
  for (const group of ["base", "light", "dark"]) {
    for (const token of Object.values(tokens[group]) as {
      $description: string;
      $extensions: {
        "org.bench-design": { usage: string; usageSource?: string };
      };
    }[]) {
      const metadata = token.$extensions["org.bench-design"];
      assert.notEqual(metadata.usage, token.$description);
      // Published metadata must not point to private design documents.
      assert.equal(metadata.usageSource, undefined);
    }
  }
});

test("published tokens cite no private design documents", () => {
  const source = readFileSync("src/tokens.json", "utf8");
  // Section marks or proposal names would point to private design documents.
  assert.doesNotMatch(source, /B2-TOKENS-PROPOSAL|§/);
});

test("Button hover accent is ratified in both themes", () => {
  const tokens = JSON.parse(readFileSync("src/tokens.json", "utf8"));
  for (const theme of ["light", "dark"]) {
    const token = tokens[theme]["accent-hover"];
    assert.ok(token, `${theme} hover accent must exist`);
    assert.equal(token.$value.hex, "#e5f593");
    assert.equal(token.$type, "color");
    assert.match(token.$extensions["org.bench-design"].usage, /--bd-on-accent/);
  }
});

test("spacing types are generated from the public token source", () => {
  const tokens = JSON.parse(readFileSync("src/tokens.json", "utf8"));
  const scale = Object.keys(tokens.base)
    .filter((name) => name.startsWith("space-"))
    .map((name) => name.slice(6))
    .join(" | ");
  assert.ok(
    readFileSync("src/space-tokens.ts", "utf8").includes(
      `export type SpaceToken = ${scale};`,
    ),
  );
});

test("status tokens match ratification in both themes", () => {
  const tokens = JSON.parse(readFileSync("src/tokens.json", "utf8"));
  const expected = {
    light: ["#626f41", "#eaecd7", "#935e34", "#f7e1c7", "#943f36", "#f3e7de"],
    dark: ["#91a464", "#2a3225", "#c38657", "#322d23", "#cd7f76", "#332c28"],
  };
  for (const theme of ["light", "dark"] as const) {
    [
      "success",
      "success-subtle",
      "warning",
      "warning-subtle",
      "danger",
      "danger-subtle",
    ].forEach((name, i) => {
      assert.equal(tokens[theme][name]?.$value.hex, expected[theme][i]);
    });
  }
});

test("overlay tokens preserve alpha, depth and motion", () => {
  const css = readFileSync("src/tokens.css", "utf8");
  assert.match(css, /--bd-color-light-veil: rgba\(24, 32, 28, 0\.38\)/);
  assert.match(css, /--bd-color-dark-veil: rgba\(8, 13, 10, 0\.6\)/);
  assert.match(
    css,
    /--bd-elevation-dialog: 8px 8px 0px 0px var\(--bd-shadow\)/,
  );
  assert.match(css, /--bd-duration-fast: 150ms/);
  assert.match(css, /--bd-ease-out: cubic-bezier\(0, 0, 0\.58, 1\)/);
  assert.match(css, /--bd-veil-blur: 3px/);
  assert.match(css, /--bd-veil-blur: 0px/);
});

test("category hues match the palette and retain graphical contrast in both themes", () => {
  const tokens = JSON.parse(readFileSync("src/tokens.json", "utf8"));
  const luminance = (hex: string) =>
    [0.2126, 0.7152, 0.0722].reduce((sum, weight, i) => {
      const c = Number.parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
      return (
        sum + weight * (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
      );
    }, 0);
  const expected = {
    light: ["#2b7f8c", "#b03a73", "#b85a22", "#6650a8", "#4a7d36", "#3666a3"],
    dark: ["#5fb8c4", "#e07aac", "#e3925a", "#a594e3", "#8bbf76", "#7ea6e0"],
  };
  for (const theme of ["light", "dark"] as const) {
    ["teal", "magenta", "orange", "violet", "green", "blue"].forEach(
      (name, i) => {
        const token = tokens[theme][`category-${name}`];
        assert.equal(token?.$value.hex, expected[theme][i]);
        assert.match(
          token.$extensions["org.bench-design"].usage,
          /Never use color alone/,
        );
        for (const surface of ["surface", "surface-raised"]) {
          const a = luminance(token.$value.hex),
            b = luminance(tokens[theme][surface].$value.hex);
          assert.ok(
            (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 3,
            `${theme} ${name} on ${surface}`,
          );
        }
      },
    );
  }
});

test("inverse surfaces remap semantic roles for explicit and system themes", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/generate-tokens.ts", "--stdout"],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  const css = result.stdout;
  for (const [selector, theme] of [
    ['.bd-surface[data-tone="inverse"]', "dark"],
    [':root[data-theme="dark"] .bd-surface[data-tone="inverse"]', "light"],
    [':root:not([data-theme]) .bd-surface[data-tone="inverse"]', "light"],
  ] as const) {
    const start = css.indexOf(`${selector} {`);
    assert.ok(start >= 0, `missing inverse context: ${selector}`);
    const block = css.slice(start, css.indexOf("}", start));
    const tokens = JSON.parse(readFileSync("src/tokens.json", "utf8"));
    for (const role of Object.keys(tokens[theme])) {
      assert.ok(
        block.includes(`--bd-${role}: var(--bd-color-${theme}-${role});`),
        `${theme} ${role}`,
      );
    }
    for (const [role, target] of Object.entries({
      "selection-strong": "text",
      "on-selection-strong": "surface",
    })) {
      assert.equal(tokens[theme][role]?.$value, `{${theme}.${target}}`);
      assert.ok(
        css.includes(
          `--bd-color-${theme}-${role}: var(--bd-color-${theme}-${target});`,
        ),
      );
    }
    assert.ok(block.includes(`color-scheme: ${theme};`));
  }
});

test("soft elevation generates a composite shadow and theme overrides", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/generate-tokens.ts", "--stdout"],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  const css = result.stdout;
  assert.match(
    css,
    /--bd-elevation-soft: 2px 2px 9px 0px rgba\(24, 32, 28, 0\.086\);/,
  );
  for (const selector of [
    ':root[data-theme="dark"]',
    ":root:not([data-theme])",
    '.bd-surface[data-tone="inverse"]',
  ]) {
    const start = css.indexOf(`${selector} {`);
    assert.match(
      css.slice(start, css.indexOf("}", start)),
      /--bd-elevation-soft: none;/,
    );
  }
  for (const selector of [
    ':root[data-theme="dark"] .bd-surface[data-tone="inverse"]',
    ':root:not([data-theme]) .bd-surface[data-tone="inverse"]',
  ]) {
    const start = css.indexOf(`${selector} {`);
    assert.match(
      css.slice(start, css.indexOf("}", start)),
      /--bd-elevation-soft: 2px 2px 9px 0px rgba\(24, 32, 28, 0\.086\);/,
    );
  }
  assert.ok(
    readFileSync("src/space-tokens.ts", "utf8").includes(
      'export type ElevationToken = "elevation-dialog" | "elevation-soft";',
    ),
  );
});

test("soft elevation is limited to the three approved surface roots", () => {
  const css = ["public/surfaces.css", "public/data.css"]
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
  const selectors = Array.from(
    css.matchAll(
      /([^{}]+)\{[^{}]*box-shadow: var\(--bd-elevation-soft\);[^{}]*\}/g,
    ),
  )
    .flatMap((match) =>
      (match[1] ?? "").split(",").map((selector) => selector.trim()),
    )
    .sort();
  assert.deepEqual(selectors, [
    ".bd-card",
    ".bd-inspector",
    '.bd-surface[data-tone="raised"]',
  ]);
});

test("subtle categories preserve exact colors and readable text in both themes", () => {
  const tokens = JSON.parse(readFileSync("src/tokens.json", "utf8"));
  const expected = {
    light: ["#e0e6d9", "#eee2d6", "#e4e0e6", "#eddee0", "#dde6e3", "#dee3e6"],
    dark: ["#293628", "#372f23", "#2d2f39", "#362b31", "#223534", "#273239"],
  };
  const luminance = (hex: string) =>
    [0.2126, 0.7152, 0.0722].reduce((sum, weight, i) => {
      const c = Number.parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
      return (
        sum + weight * (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
      );
    }, 0);
  for (const theme of ["light", "dark"] as const) {
    ["green", "orange", "violet", "magenta", "teal", "blue"].forEach(
      (name, i) => {
        const hex = tokens[theme][`category-${name}-subtle`]?.$value.hex;
        assert.equal(hex, expected[theme][i]);
        for (const text of ["text", "text-muted"]) {
          const a = luminance(String(hex)),
            b = luminance(tokens[theme][text].$value.hex);
          assert.ok(
            (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5,
            `${theme} ${name} ${text}`,
          );
        }
      },
    );
  }
});

test("avatar and neutral notice token pairs remain readable in both themes", () => {
  const tokens = JSON.parse(readFileSync("src/tokens.json", "utf8"));
  const luminance = (hex: string) =>
    [0.2126, 0.7152, 0.0722].reduce((sum, weight, i) => {
      const c = Number.parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
      return (
        sum + weight * (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
      );
    }, 0);
  for (const theme of ["light", "dark"]) {
    for (const [foreground, background] of [
      ["text", "surface-subtle"],
      ["on-accent", "accent"],
    ] as const) {
      const a = luminance(tokens[theme][foreground].$value.hex);
      const b = luminance(tokens[theme][background].$value.hex);
      assert.ok(
        (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5,
        `${theme}: ${foreground}/${background}`,
      );
    }
  }
});
