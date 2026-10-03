import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import tokens from "../src/tokens.json" with { type: "json" };

const guide = `# bench-design — integration

Available foundations: tokens, CSS, local fonts and themes. Button provides primary and secondary variants, disabled states, React Aria activation and native button types.
The components.json manifest and MCP server are not available. The package is private;
no npm release is available.

## Supported imports

- Choose bench-design/styles.css (tokens and fonts) or bench-design/tokens.css.
- Import Button and ButtonProps from bench-design; children is required,
  use onPress for actions, type defaults to button, with native submit/reset.
  API: isDisabled, primary/secondary variants (secondary by default), DOM ref,
  aria-label and aria-labelledby. No general HTML attribute passthrough.
- Catalog: bench-design/tokens.json; in Node, use with { type: "json" }.
  Bundlers do not require this attribute.
- Serve bench-design/theme-init.js from the application origin as a
  blocking classic script in head before CSS and React, without async or defer.
- Serve fonts/ assets relative to the styles, including their licenses.
- Do not import src/, internal files or components that are not exported.

## Rules

Use semantic --bd-* roles; never use --bd-color-* palettes in components
or hardcoded visual values. The guidance below comes from tokens.json
and is regenerated on every build. Business rules belong in the application;
shared visual fixes belong in the primitives.

${Object.entries(tokens)
  .filter(([name]) => ["base", "light", "dark"].includes(name))
  .map(
    ([name, group]) =>
      `### ${name}\n\n${Object.entries(group)
        .map(([role, token]) => {
          const value = token as {
            $extensions: { "org.bench-design": { usage: string } };
          };
          return `- --bd-${role} : ${value.$extensions["org.bench-design"].usage}`;
        })
        .join("\n")}`,
  )
  .join("\n\n")}

## Themes and accessibility

On html, data-theme="light" or "dark" sets the theme; without the attribute,
the system chooses. theme-init.js reads localStorage["bench-design-theme"] and
preserves an existing server attribute. For system, missing or invalid choices,
or inaccessible storage, no attribute is added. To change the choice later,
update the attribute (remove it for system) and persist the choice if possible.

Keep semantic HTML, accessible names, keyboard support and visible focus. Check
focus order, body text contrast (4.5:1), required control borders and focus
contrast (3:1) in the actual context. Button wraps React Aria. Prefer visible content for its accessible name; explicit
names must include the visible label. Use the DOM ref to restore focus.
A dark decorative divider, error role and print theme are deferred:
do not invent these values. Wait for document.fonts.ready before screenshots.
`;

mkdirSync("dist", { recursive: true });
writeFileSync("dist/AGENTS.md", guide);
copyFileSync("src/tokens.json", "dist/tokens.json");
const site = process.argv.find((arg) => arg.startsWith("--site="))?.slice(7);
if (site) {
  mkdirSync(site, { recursive: true });
  const pages = [
    ["Getting started", "docs-getting-started--page"],
    ["Principles", "docs-principles--page"],
    ["Themes", "docs-themes--page"],
  ] as const;
  writeFileSync(
    `${site}/llms.txt`,
    `# bench-design\n\n> React design system: foundations, DTCG tokens, local fonts and themes.\n\nPrivate package: Button with primary and secondary variants available; npm release deferred.\n\n## Documentation\n\n${pages.map(([label, id]) => `- [${label}](./?path=/story/${encodeURIComponent(id)})`).join("\n")}\n- [DTCG tokens](./tokens.json): values, descriptions and usage rules.\n`,
  );
  copyFileSync("src/tokens.json", `${site}/tokens.json`);
}
