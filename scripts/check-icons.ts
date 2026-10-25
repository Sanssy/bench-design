import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { type Element, geometry, paint, parseIcon } from "./icon-xml.ts";

type IconArtworkProfile = {
  strokeWidth: "2" | "3";
  linecap: "butt" | "round";
  path?: string;
};

const sharpProfile: IconArtworkProfile = {
  strokeWidth: "2",
  linecap: "butt",
};
const roundedCloseProfile: IconArtworkProfile = {
  strokeWidth: "3",
  linecap: "round",
  path: "M6 6l12 12M18 6L6 18",
};

export function getIconArtworkProfile(file: string): IconArtworkProfile {
  return file.split(/[\\/]/).at(-1) === "close-rounded.svg"
    ? roundedCloseProfile
    : sharpProfile;
}

export function checkIcon(source: string, file = "icon.svg") {
  const fail = (rule: string): never => {
    throw new Error(`${file}: ${rule}`);
  };
  const profile = getIconArtworkProfile(file);
  const root = parseIcon(source, file);
  if (root.name !== "svg" || root.attrs.viewBox !== "0 0 24 24")
    fail('viewBox must be "0 0 24 24" on the svg root');
  if (root.attrs["stroke-width"] !== profile.strokeWidth)
    fail(`root stroke-width must be ${profile.strokeWidth}`);
  // Sharp style (ICON ratification): butt caps on every icon.
  if (root.attrs["stroke-linecap"] !== profile.linecap)
    fail(`root stroke-linecap must be "${profile.linecap}"`);
  if (!root.attrs.fill || !root.attrs.stroke)
    fail("root fill and stroke must be explicit");
  function visit(element: Element) {
    const allowed = geometry[element.name];
    if (!allowed || (element !== root && element.name === "svg"))
      fail(`element ${element.name} is not allowed`);
    for (const [name, value] of Object.entries(element.attrs)) {
      if (![...(allowed ?? []), ...paint].includes(name))
        fail(`attribute ${name} is not allowed`);
      if (
        ["fill", "stroke"].includes(name) &&
        !["none", "currentColor"].includes(value)
      )
        fail(`${name} color must be currentColor or none`);
      if (name === "stroke-width" && value !== profile.strokeWidth)
        fail(`stroke-width must be ${profile.strokeWidth}`);
      if (name === "xmlns" && value !== "http://www.w3.org/2000/svg")
        fail("xmlns must be the SVG namespace");
      if (name === "stroke-linecap" && value !== profile.linecap)
        fail(`stroke-linecap must be "${profile.linecap}"`);
      if (
        name === "stroke-linejoin" &&
        !["miter", "round", "bevel"].includes(value)
      )
        fail("invalid stroke-linejoin");
    }
    for (const child of element.children) visit(child);
  }
  visit(root);
  if (profile.path) {
    const closeRootAttributes = [
      "xmlns",
      "viewBox",
      "fill",
      "stroke",
      "stroke-width",
      "stroke-linecap",
      "stroke-linejoin",
    ];
    if (
      root.attrs.fill !== "none" ||
      root.attrs.stroke !== "currentColor" ||
      root.attrs["stroke-linejoin"] !== "round" ||
      Object.keys(root.attrs).length !== closeRootAttributes.length ||
      closeRootAttributes.some((name) => root.attrs[name] === undefined) ||
      root.children.length !== 1 ||
      root.children[0]?.name !== "path" ||
      Object.keys(root.children[0].attrs).length !== 1 ||
      root.children[0].attrs.d !== profile.path ||
      root.children[0].children.length !== 0
    )
      fail(
        "reserved close artwork must match the approved single-path geometry",
      );
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    const directory = new URL("../src/icon/svg/", import.meta.url);
    const files = readdirSync(directory).filter((file) =>
      file.endsWith(".svg"),
    );
    if (!files.length) throw new Error("src/icon/svg: no SVG icons found");
    for (const file of files)
      checkIcon(readFileSync(new URL(file, directory), "utf8"), file);
    console.log(`Checked ${files.length} icons.`);
  } catch (error) {
    console.error((error as Error).message);
    process.exitCode = 1;
  }
}
