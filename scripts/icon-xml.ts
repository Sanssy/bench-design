export type Element = {
  name: string;
  attrs: Record<string, string>;
  children: Element[];
};
export function parseIcon(source: string, file: string): Element {
  const fail = () => {
    throw new Error(`${file}: malformed or unsupported XML`);
  };
  const stack: Element[] = [];
  let root: Element | undefined;
  const tokens = source.match(/<[^>]*>|[^<]+/g) ?? [];
  if (tokens.join("") !== source) fail();
  for (const token of tokens) {
    if (!token.startsWith("<")) {
      if (token.trim()) fail();
      continue;
    }
    if (/^<\?xml\s[^<>]*\?>$/.test(token)) continue;
    const closing = token.match(/^<\/([\w:-]+)\s*>$/);
    if (closing) {
      if (stack.pop()?.name !== closing[1]) fail();
      continue;
    }
    const opening = token.match(/^<([\w:-]+)((?:\s[^<>]*)?)\s*\/?>$/);
    if (!opening) fail();
    const name = opening?.[1] ?? "";
    let rest = (opening?.[2] ?? "").replace(/\/$/, "");
    const attrs: Record<string, string> = {};
    while (rest.trim()) {
      const attr = rest.match(/^\s+([\w:-]+)\s*=\s*(["'])([^<>&]*?)\2/);
      if (!attr || Object.hasOwn(attrs, attr[1] ?? "")) fail();
      attrs[attr?.[1] ?? ""] = attr?.[3] ?? "";
      rest = rest.slice(attr?.[0].length);
    }
    const element = { name, attrs, children: [] };
    const parent = stack.at(-1);
    if (parent) parent.children.push(element);
    else {
      if (root) fail();
      root = element;
    }
    if (!token.endsWith("/>")) stack.push(element);
  }
  if (!root || stack.length) fail();
  return root as Element;
}
export const geometry: Record<string, string[]> = {
  svg: ["xmlns", "viewBox", "width", "height"],
  path: ["d"],
  circle: ["cx", "cy", "r"],
  rect: ["x", "y", "width", "height", "rx", "ry"],
  line: ["x1", "y1", "x2", "y2"],
  polyline: ["points"],
  polygon: ["points"],
};
export const paint = [
  "fill",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "fill-rule",
  "clip-rule",
];
