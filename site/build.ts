import {
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { catalog } from "./catalog.ts";

const manifest = JSON.parse(readFileSync("components.json", "utf8"));
const index = JSON.parse(readFileSync("storybook-static/index.json", "utf8"));
const template = readFileSync("site/index.html", "utf8");
let page = template.replace("<!-- CATALOG -->", catalog(manifest));
for (const name of ["Button", "Badge", "Card"]) {
  const component = manifest.components.find(
    (entry: { name: string }) => entry.name === name,
  );
  if (!component) throw new Error(`Missing specimen: ${name}`);
  page = page.replace(
    `<!-- ${name.toUpperCase()} -->`,
    `storybook/${component.stories[0].href}`,
  );
}
for (const match of page.matchAll(
  /href="storybook\/\.\/\?path=\/story\/([^"]+)"/g,
)) {
  if (!index.entries[match[1] ?? ""])
    throw new Error(`Unknown story: ${match[1]}`);
}
rmSync("site-dist", { recursive: true, force: true });
mkdirSync("site-dist/assets", { recursive: true });
writeFileSync("site-dist/index.html", page);
cpSync("site/site.css", "site-dist/site.css");
cpSync("site/favicon.svg", "site-dist/favicon.svg");
writeFileSync(
  "site-dist/theme.js",
  stripTypeScriptTypes(readFileSync("site/theme.ts", "utf8")),
);
cpSync("dist", "site-dist/assets", { recursive: true });
cpSync("storybook-static", "site-dist/storybook", { recursive: true });
writeFileSync(
  "site-dist/llms.txt",
  readFileSync("storybook-static/llms.txt", "utf8")
    .replaceAll("](./?path=", "](./storybook/?path=")
    .replaceAll("](./components.json)", "](./assets/components.json)")
    .replaceAll("](./tokens.json)", "](./assets/tokens.json)"),
);
