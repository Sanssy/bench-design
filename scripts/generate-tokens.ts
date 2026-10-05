import { readFileSync, writeFileSync } from "node:fs";
import tokens from "../src/tokens.json" with { type: "json" };

type BaseToken = (typeof tokens.base)[keyof typeof tokens.base];
function baseValue(token: BaseToken) {
  const value = token.$value;
  if (Array.isArray(value)) return `cubic-bezier(${value.join(", ")})`;
  if (typeof value === "object") {
    if ("offsetX" in value) {
      const dimension = (part: { value: number; unit: string }) =>
        `${part.value}${part.unit}`;
      const color =
        typeof value.color === "string"
          ? value.color.replace(/^\{(?:light|dark)\.(.+)\}$/, "var(--bd-$1)")
          : `rgba(${value.color.components.map((channel) => Math.round(channel * 255)).join(", ")}, ${value.color.alpha})`;
      return [
        dimension(value.offsetX),
        dimension(value.offsetY),
        dimension(value.blur),
        dimension(value.spread),
        color,
      ].join(" ");
    }
    return `${value.value}${value.unit}`;
  }
  const metadata = token.$extensions["org.bench-design"];
  return `${value}${"cssUnit" in metadata ? metadata.cssUnit : ""}`;
}
function themeValue(token: BaseToken, theme: "light" | "dark") {
  const metadata = token.$extensions["org.bench-design"];
  if (theme === "dark" && "darkValue" in metadata) {
    const value = metadata.darkValue;
    return typeof value === "string" ? value : `${value.value}${value.unit}`;
  }
  return baseValue(token);
}
const declarations = (theme: "light" | "dark") =>
  Object.keys(tokens[theme]).map(
    (name) => `--bd-${name}: var(--bd-color-${theme}-${name});`,
  );
const dark = [
  ...Object.entries(tokens.base).flatMap(([name, token]) => {
    const metadata = token.$extensions["org.bench-design"];
    return "darkValue" in metadata
      ? [`--bd-${name}: ${themeValue(token, "dark")};`]
      : [];
  }),
  ...declarations("dark"),
  ...Object.keys(tokens.light)
    .filter((name) => !(name in tokens.dark))
    .map((name) => `--bd-${name}: initial;`),
  "color-scheme: dark;",
];
const indent = (lines: string[], spaces: number) =>
  lines.map((line) => `${" ".repeat(spaces)}${line}`).join("\n");
const palette = (theme: "light" | "dark") =>
  Object.entries(tokens[theme]).map(([name, token]) => {
    const channels = token.$value.components.map((channel) =>
      Math.round(channel * 255),
    );
    const value =
      token.$value.alpha === 1
        ? `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`
        : `rgba(${channels.join(", ")}, ${token.$value.alpha})`;
    return `--bd-color-${theme}-${name}: ${value};`;
  });
const css = `:root {\n${indent(
  [
    ...Object.entries(tokens.base).map(
      ([name, token]) => `--bd-${name}: ${baseValue(token)};`,
    ),
    ...palette("light"),
    ...declarations("light"),
    ...palette("dark"),
    "color-scheme: light;",
  ],
  2,
)}\n}\n\n@media (prefers-color-scheme: dark) {\n  :root:not([data-theme]) {\n${indent(dark, 4)}\n  }\n}\n\n:root[data-theme="dark"] {\n${indent(dark, 2)}\n}\n`;
const inverseContext = (theme: "light" | "dark") => [
  ...Object.entries(tokens.base).flatMap(([name, token]) => {
    const metadata = token.$extensions["org.bench-design"];
    return "darkValue" in metadata && token.$type !== "shadow"
      ? [`--bd-${name}: ${themeValue(token, theme)};`]
      : [];
  }),
  ...declarations(theme),
  ...Object.keys(tokens[theme === "light" ? "dark" : "light"])
    .filter((name) => !(name in tokens[theme]))
    .map((name) => `--bd-${name}: initial;`),
  // Shadow aliases are resolved at their declaration site, so rebind locally.
  ...Object.entries(tokens.base)
    .filter(
      ([, token]) =>
        typeof token.$value === "object" && "offsetX" in token.$value,
    )
    .map(([name, token]) => `--bd-${name}: ${themeValue(token, theme)};`),
  `color-scheme: ${theme};`,
];
const inverseCss = `
.bd-surface[data-tone="inverse"] {
${indent(inverseContext("dark"), 2)}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) .bd-surface[data-tone="inverse"] {
${indent(inverseContext("light"), 4)}
  }
}

:root[data-theme="dark"] .bd-surface[data-tone="inverse"] {
${indent(inverseContext("light"), 2)}
}
`;
const types = `/** Generated from tokens.json; run pnpm tokens:generate. */
/** Ratified spacing scale used by layout gaps and surface padding. */
export type SpaceToken = ${Object.keys(tokens.base)
  .filter((name) => name.startsWith("space-"))
  .map((name) => name.slice(6))
  .join(" | ")};
/** Shared elevation roles; their CSS values follow the local theme. */
export type ElevationToken = ${Object.entries(tokens.base)
  .filter(([, token]) => token.$type === "shadow")
  .map(([name]) => JSON.stringify(name))
  .join(" | ")};
`;
const typesPath =
  process.argv.find((arg) => arg.startsWith("--types="))?.slice(8) ??
  "src/space-tokens.ts";
const path =
  process.argv.find((arg) => arg.startsWith("--css="))?.slice(6) ??
  "src/tokens.css";
if (process.argv.includes("--stdout")) process.stdout.write(css + inverseCss);
else if (process.argv.includes("--check")) {
  if (
    readFileSync(path, "utf8") !== css + inverseCss ||
    readFileSync(typesPath, "utf8") !== types
  ) {
    console.error(
      "Generated tokens diverge from tokens.json; run pnpm tokens:generate",
    );
    process.exitCode = 1;
  }
} else {
  writeFileSync(path, css + inverseCss);
  writeFileSync(typesPath, types);
}
