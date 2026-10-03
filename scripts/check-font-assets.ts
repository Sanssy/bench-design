import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

export function checkFontAssets(stylesURL: URL) {
  const styles = readFileSync(stylesURL, "utf8");
  assert(styles.includes('@import "./fonts.css"'), "fonts import missing");
  const cssURL = new URL("./fonts.css", stylesURL);
  assert(existsSync(cssURL), "packed fonts.css missing");
  const css = readFileSync(cssURL, "utf8");
  const provenance: {
    file: string;
    bytes: number;
    sha256: string;
    family: string;
  }[] = JSON.parse(
    readFileSync(new URL("./fonts/provenance.json", stylesURL), "utf8"),
  );
  const urls = [...css.matchAll(/url\("([^"]+)"\)/g)].map((match) => match[1]);
  assert.equal(urls.length, 3, "three bundled font URLs required");
  for (const font of provenance) {
    const relative = `./fonts/${font.file}`;
    assert(urls.includes(relative), `missing CSS URL ${relative}`);
    const bytes = readFileSync(new URL(relative, cssURL));
    assert.equal(bytes.length, font.bytes);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), font.sha256);
    const license = readFileSync(
      new URL(`./fonts/${font.family}-OFL.txt`, stylesURL),
      "utf8",
    );
    assert.match(license, /SIL OPEN FONT LICENSE Version 1.1/);
  }
}
