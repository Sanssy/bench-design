import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Every `Stories.Name` used by a Docs page must be an export of the stories
// file it imports; otherwise Storybook renders the page empty (of={undefined}).
export function docsReferenceErrors(mdx: string, file: string): string[] {
  const imported = /import \* as (\w+) from ['"](\.[^'"]+)['"]/.exec(mdx);
  if (!imported) return [];
  const [, alias, path] = imported;
  const stories = readFileSync(resolve(dirname(file), `${path}.tsx`), "utf8");
  const exported = new Set(
    [...stories.matchAll(/^export const (\w+)/gm)].map((match) => match[1]),
  );
  return [...mdx.matchAll(new RegExp(`\\b${alias}\\.(\\w+)`, "g"))]
    .map((match) => match[1] ?? "")
    .filter((name) => !exported.has(name))
    .map((name) => `${file}: ${alias}.${name} is not a story export`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const root = fileURLToPath(new URL("../src/", import.meta.url));
  const errors = readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) =>
      readdirSync(join(root, entry.name))
        .filter((name) => name.endsWith(".mdx"))
        .map((name) => join(root, entry.name, name)),
    )
    .flatMap((file) => docsReferenceErrors(readFileSync(file, "utf8"), file));
  for (const error of errors) console.error(error);
  if (errors.length) process.exitCode = 1;
  else console.log("Docs story references PASS");
}
