import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import manifest from "../components.json" with { type: "json" };
import tokens from "../src/tokens.json" with { type: "json" };

const components = manifest.components.map((component) => {
  const prefixes = component.stories.map((story) => {
    const path = new URL(
      story.href,
      "https://storybook.local",
    ).searchParams.get("path");
    const match = path?.match(/^\/story\/(.+)--[^/]+$/);
    if (!match)
      throw new Error(
        `Invalid story href for ${component.name}: ${story.href}`,
      );
    return match[1];
  });
  if (!prefixes.length || new Set(prefixes).size !== 1) {
    throw new Error(`Expected one story title prefix for ${component.name}`);
  }
  return { ...component, docsId: `${prefixes[0]}--docs` };
});
const code = (value: string) => `\`${value.replaceAll("|", "\\|")}\``;
const componentGuide = components
  .map(
    (component) =>
      `### ${component.name}\n\n${code(component.import)}\n\n${component.description}\n\n` +
      "| Prop | Type | Required | Default |\n| --- | --- | --- | --- |\n" +
      component.props
        .map(
          (prop) =>
            `| ${code(prop.name)} | ${code(prop.type)} | ${prop.required ? "Yes" : "No"} | ${"default" in prop ? code(prop.default) : "—"} |`,
        )
        .join("\n"),
  )
  .join("\n\n");
const site = process.argv.find((arg) => arg.startsWith("--site="))?.slice(7);
if (site) {
  const index = JSON.parse(readFileSync(`${site}/index.json`, "utf8")) as {
    entries: Record<string, unknown>;
  };
  for (const component of components) {
    if (!Object.hasOwn(index.entries, component.docsId)) {
      throw new Error(`Missing Storybook Docs page: ${component.docsId}`);
    }
  }
}

const guide = `# bench-design — integration

Available foundations: tokens, CSS, local fonts and themes. Exported components provide reusable structure and accessible semantics.
The generated API manifest is available at [components.json](./components.json).
The MCP server is deferred. The package is private;
no npm release is available.

## Supported imports

- Choose bench-design/styles.css (tokens and fonts) or bench-design/tokens.css.
- Import exported components from bench-design using the manifest below.
- Catalog: bench-design/tokens.json; in Node, use with { type: "json" }.
  Bundlers do not require this attribute.
- Serve bench-design/theme-init.js from the application origin as a
  blocking classic script in head before CSS and React, without async or defer.
- Serve fonts/ assets relative to the styles, including their licenses.
- Do not import src/, internal files or components that are not exported.

## Form selection API

Select, ComboBox and MultiComboBox use value/defaultValue/onChange.
Select values are string identifiers or null; ComboBox values are complete
FieldOption objects or null; MultiComboBox values are FieldOption arrays.
Use null for an empty single choice and an empty array for multiple choices.
FilterMenu keeps value/onApply; collection selection APIs remain unchanged.

## Components

${componentGuide}

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
contrast (3:1) in the actual context. Follow each component’s documented semantics and accessible naming guidance.
The print theme is deferred: do not invent its values. Wait for document.fonts.ready before screenshots.
`;

mkdirSync("dist", { recursive: true });
writeFileSync("dist/AGENTS.md", guide);
copyFileSync("src/tokens.json", "dist/tokens.json");
copyFileSync("components.json", "dist/components.json");
if (site) {
  mkdirSync(site, { recursive: true });
  const pages = [
    ["Getting started", "docs-getting-started--page"],
    ["Principles", "docs-principles--page"],
    ["Themes", "docs-themes--page"],
  ] as const;
  writeFileSync(
    `${site}/llms.txt`,
    `# bench-design\n\n> React design system: foundations, DTCG tokens, local fonts and themes.\n\nPrivate package: exported components are described in the API manifest; npm release deferred.\n\n## Form selection API\n\nSelect, ComboBox and MultiComboBox use value/defaultValue/onChange. Select takes string identifiers or null; ComboBox takes complete FieldOption objects or null; MultiComboBox takes FieldOption arrays (empty to clear). FilterMenu keeps value/onApply; collection selection APIs remain unchanged.\n\n## Documentation\n\n${pages.map(([label, id]) => `- [${label}](./?path=/story/${encodeURIComponent(id)})`).join("\n")}\n\n## Components\n\n${components.map((component) => `- [${component.name}](./?path=/docs/${encodeURIComponent(component.docsId)})`).join("\n")}\n\n- [Component API manifest](./components.json): imports, props, defaults and stories.\n- [DTCG tokens](./tokens.json): values, descriptions and usage rules.\n`,
  );
  copyFileSync("src/tokens.json", `${site}/tokens.json`);
  copyFileSync("components.json", `${site}/components.json`);
}
