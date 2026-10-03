import { copyFileSync, cpSync } from "node:fs";

for (const [source, name] of [
  ["src/tokens.css", "tokens.css"],
  ["public/styles.css", "styles.css"],
  ["public/fonts.css", "fonts.css"],
  ["public/theme-init.js", "theme-init.js"],
]) {
  copyFileSync(source, `dist/${name}`);
}

cpSync("public/fonts", "dist/fonts", { recursive: true });
