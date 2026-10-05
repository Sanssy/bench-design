import { globSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generate, ident, parse, walk } from "css-tree";

export function stateAttributeViolations(
  source: string,
  file: string,
  contract: string,
): string[] {
  const declared = new Set(
    [...contract.matchAll(/^\| `(data-[a-z-]+)` \|/gm)].map(
      (match) => match[1],
    ),
  );
  const missing = new Map<string, number | undefined>();
  walk(
    parse(source, { positions: true, parseCustomProperty: true }),
    (node) => {
      if (node.type !== "AttributeSelector" || !node.name) return;
      const name = ident.decode(
        typeof node.name === "string" ? node.name : generate(node.name),
      );
      if (name.startsWith("data-") && !declared.has(name) && !missing.has(name))
        missing.set(name, node.loc?.start.line);
    },
  );
  return [...missing].map(
    ([name, line]) => `${file}:${line}: undeclared state attribute ${name}`,
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const contract = readFileSync("docs/state-attributes.md", "utf8");
  const files = globSync("public/*.css");
  if (!files.length) throw new Error("No public CSS to check");
  const errors = files.flatMap((file) =>
    stateAttributeViolations(readFileSync(file, "utf8"), file, contract),
  );
  for (const error of errors) console.error(error);
  if (errors.length) process.exitCode = 1;
  else console.log(`CSS state attributes PASS (${files.length} files)`);
}
