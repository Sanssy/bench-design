import { copyFileSync, cpSync } from "node:fs";

for (const [source, name] of [
  ["src/tokens.css", "tokens.css"],
  ["src/tokens.json", "tokens.json"],
  ["public/styles.css", "styles.css"],
  ["public/button.css", "button.css"],
  ["public/typography.css", "typography.css"],
  ["public/link.css", "link.css"],
  ["public/fonts.css", "fonts.css"],
  ["public/theme-init.js", "theme-init.js"],
] as const) {
  copyFileSync(source, `dist/${name}`);
}

cpSync("public/fonts", "dist/fonts", { recursive: true });
