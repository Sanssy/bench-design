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
      const color = value.color.replace(
        /^\{(?:light|dark)\.(.+)\}$/,
        "var(--bd-$1)",
      );
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
const declarations = (theme: "light" | "dark") =>
  Object.keys(tokens[theme]).map(
    (name) => `--bd-${name}: var(--bd-color-${theme}-${name});`,
  );
const dark = [
  ...Object.entries(tokens.base).flatMap(([name, token]) => {
    const metadata = token.$extensions["org.bench-design"];
    return "darkValue" in metadata
      ? [`--bd-${name}: ${metadata.darkValue.value}${metadata.darkValue.unit};`]
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
const types = `/** Generated from tokens.json; run pnpm tokens:generate. */
/** Ratified spacing scale used by layout gaps and surface padding. */
export type SpaceToken = ${Object.keys(tokens.base)
  .filter((name) => name.startsWith("space-"))
  .map((name) => name.slice(6))
  .join(" | ")};
`;
const typesPath =
  process.argv.find((arg) => arg.startsWith("--types="))?.slice(8) ??
  "src/space-tokens.ts";
const path =
  process.argv.find((arg) => arg.startsWith("--css="))?.slice(6) ??
  "src/tokens.css";
if (process.argv.includes("--stdout")) process.stdout.write(css);
else if (process.argv.includes("--check")) {
  if (
    readFileSync(path, "utf8") !== css ||
    readFileSync(typesPath, "utf8") !== types
  ) {
    console.error(
      "Generated tokens diverge from tokens.json; run pnpm tokens:generate",
    );
    process.exitCode = 1;
  }
} else {
  writeFileSync(path, css);
  writeFileSync(typesPath, types);
}
