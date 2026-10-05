import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { checkFontAssets } from "../../scripts/check-font-assets.ts";

const assets: [string, string, string][] = [
  [
    "Fraunces.ttf",
    "177ff6c0f14e5550a3c624247cd1189611d4eb65d000b14944c63d967958abbb",
    "fraunces-OFL.txt",
  ],
  [
    "Fraunces-Italic.ttf",
    "b24448c43702fac4ee856781d461a0dfba8d8e594b6e8e190234b75fed2c0e01",
    "fraunces-OFL.txt",
  ],
  [
    "IBMPlexMono-SemiBold.ttf",
    "d3c38e55c78f5b0f28009fddba4834ec503278936a5986032424c9bd2d23aa46",
    "ibmplexmono-OFL.txt",
  ],
  [
    "Manrope.ttf",
    "d0639be45d0af36e798172419d7bd173c4bd4f29e2b76cbb69db1d11bf8b0a40",
    "manrope-OFL.txt",
  ],
  [
    "IBMPlexMono-Regular.ttf",
    "6a3412f058c7d8dfd9170c41e85ade48e5156ecb89356110ca57a0a27734af46",
    "ibmplexmono-OFL.txt",
  ],
];
test("local font bytes match approved sources and include OFL licenses", () => {
  for (const [file, hash, license] of assets) {
    assert(existsSync(`public/fonts/${file}`), `missing ${file}`);
    assert.equal(
      createHash("sha256")
        .update(readFileSync(`public/fonts/${file}`))
        .digest("hex"),
      hash,
    );
    assert.match(
      readFileSync(`public/fonts/${license}`, "utf8"),
      /SIL OPEN FONT LICENSE Version 1.1/,
    );
  }
});
test("font foundations expose approved families, weight ranges, swap and role fallbacks", () => {
  const css = existsSync("public/fonts.css")
    ? readFileSync("public/fonts.css", "utf8").replace(/\s+/g, " ")
    : "";
  const faces = [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(
    (match) => match[1],
  );
  assert.equal(faces.length, 5, "five local faces required");
  for (const [family, weight, file, style] of [
    ["Bench Fraunces", "100 900", "Fraunces.ttf", "normal"],
    ["Bench Manrope", "200 800", "Manrope.ttf", "normal"],
    ["Bench Plex", "400", "IBMPlexMono-Regular.ttf", "normal"],
    ["Bench Fraunces", "100 900", "Fraunces-Italic.ttf", "italic"],
    ["Bench Plex", "600", "IBMPlexMono-SemiBold.ttf", "normal"],
  ] as const) {
    const face = faces.find((entry) => entry?.includes(`./fonts/${file}`));
    assert(face, `missing font face ${file}`);
    assert(face.includes(`font-family: "${family}"`));
    assert(face.includes(`font-weight: ${weight};`));
    assert(face.includes(`font-style: ${style};`));
    assert(face.includes("font-display: swap;"));
    assert(face.includes(`url("./fonts/${file}") format("truetype")`));
  }
  for (const [role, family, fallback] of [
    [
      "editorial",
      "Bench Fraunces",
      '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
    ],
    [
      "ui",
      "Bench Manrope",
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    ],
    [
      "metadata",
      "Bench Plex",
      '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
    ],
    [
      "mono",
      "Bench Plex",
      '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
    ],
  ])
    assert(css.includes(`--bd-font-${role}: "${family}", ${fallback};`));
  assert(!/https?:|local\(/.test(css), "font CSS must use bundled assets only");
  assert(
    readFileSync("public/styles.css", "utf8").includes('@import "./fonts.css"'),
  );
});

test("font distribution includes every provenance entry with matching bytes", () => {
  checkFontAssets(new URL("../../public/styles.css", import.meta.url));
});
