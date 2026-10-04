import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { checkIcon } from "./check-icons.ts";
import { type Element, geometry, paint, parseIcon } from "./icon-xml.ts";

function serializeIcon(element: Element): string {
  const attrs = Object.entries(element.attrs)
    .map(([name, value]) => ` ${name}="${value}"`)
    .join("");
  return element.children.length
    ? `<${element.name}${attrs}>${element.children.map(serializeIcon).join("")}</${element.name}>`
    : `<${element.name}${attrs}/>`;
}

// Inkscape style declarations that do not change the rendering of an icon.
const neutral: Record<string, string> = {
  opacity: "1",
  "fill-opacity": "1",
  "stroke-opacity": "1",
  "stroke-dasharray": "none",
  "stroke-dashoffset": "0",
  "stroke-miterlimit": "4",
  "paint-order": "normal",
  display: "inline",
};

export function normalizeIcon(source: string, file = "icon.svg"): string {
  const cleaned = source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(
      /<(metadata|sodipodi:namedview)\b[^>]*(?:\/>|>[\s\S]*?<\/\1>)/g,
      "",
    );
  const root = parseIcon(cleaned, file);
  const defaults = {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "butt",
    "stroke-linejoin": "round",
  };
  const rootPaint: Record<string, string> = {};
  function flatten(
    element: Element,
    inherited: Record<string, string>,
  ): Element[] {
    if (
      Object.keys(element.attrs).some(
        (name) => name === "transform" || name.endsWith(":transform"),
      )
    )
      throw new Error(
        `${file}: Apply the transformation in Inkscape before exporting.`,
      );
    // Inkscape always writes an empty <defs/>; anything inside it is unsupported.
    if (element.name === "defs" && !element.children.length) return [];
    if (!geometry[element.name] && element.name !== "g")
      throw new Error(`${file}: unsupported element ${element.name}`);
    const own = { ...element.attrs };
    for (const declaration of (own.style ?? "").split(";").filter(Boolean)) {
      const [name, value] = declaration.split(":").map((part) => part.trim());
      if (name && neutral[name] === value) continue;
      if (!name || !value || !paint.includes(name))
        throw new Error(`${file}: unsupported style ${declaration}`);
      own[name] = value;
    }
    const effective = { ...inherited };
    for (const name of paint)
      if (own[name] !== undefined) effective[name] = own[name];
    for (const name of ["fill", "stroke"])
      if (effective[name] !== "none") effective[name] = "currentColor";
    if (effective["stroke-width"] !== "2")
      throw new Error(`${file}: stroke-width must be 2 before normalization`);
    if (element === root) Object.assign(rootPaint, effective);
    const children = element.children.flatMap((child) =>
      flatten(child, effective),
    );
    if (element.name === "g") return children;
    const attrs: Record<string, string> = {};
    for (const name of geometry[element.name] ?? [])
      if (own[name] !== undefined) attrs[name] = own[name];
    if (element === root)
      Object.assign(attrs, effective, { xmlns: "http://www.w3.org/2000/svg" });
    else
      for (const name of paint)
        if (effective[name] !== rootPaint[name])
          attrs[name] = effective[name] ?? "";
    return [{ name: element.name, attrs, children }];
  }
  const result = `${serializeIcon(flatten(root, defaults)[0] as Element)}\n`;
  checkIcon(result, file);
  return result;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    const file = process.argv[2];
    if (!file || process.argv.length !== 3)
      throw new Error("Usage: pnpm icons:normalize <file.svg>");
    const result = normalizeIcon(readFileSync(file, "utf8"), file);
    writeFileSync(file, result);
  } catch (error) {
    console.error((error as Error).message);
    process.exitCode = 1;
  }
}
