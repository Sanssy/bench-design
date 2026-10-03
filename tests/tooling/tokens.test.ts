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
    assert.match(result.stderr, /diverges from tokens.json/);
    assert.equal(readFileSync(path, "utf8"), divergent);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("DTCG hex fallback agrees with every sRGB color", () => {
  const tokens = JSON.parse(readFileSync("src/tokens.json", "utf8"));
  for (const theme of ["light", "dark"]) {
    for (const token of Object.values(tokens[theme]) as {
      $value: { components: number[]; hex: string };
    }[]) {
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

test("usage metadata is sourced guidance rather than a repeated label", () => {
  const tokens = JSON.parse(readFileSync("src/tokens.json", "utf8"));
  for (const group of ["base", "light", "dark"]) {
    for (const token of Object.values(tokens[group]) as {
      $description: string;
      $extensions: {
        "org.bench-design": { usage: string; usageSource: string };
      };
    }[]) {
      const metadata = token.$extensions["org.bench-design"];
      assert.notEqual(metadata.usage, token.$description);
      assert.match(metadata.usageSource, /B2-TOKENS-PROPOSAL.*§7/);
    }
  }
});

test("Button hover accent is ratified in both themes", () => {
  const tokens = JSON.parse(readFileSync("src/tokens.json", "utf8"));
  for (const theme of ["light", "dark"]) {
    const token = tokens[theme]["accent-hover"];
    assert.ok(token, `${theme} hover accent must exist`);
    assert.equal(token.$value.hex, "#e5f593");
    assert.equal(token.$type, "color");
    assert.match(token.$extensions["org.bench-design"].usage, /--bd-on-accent/);
    assert.match(token.$extensions["org.bench-design"].usageSource, /§8/);
  }
});
