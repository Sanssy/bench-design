import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "@babel/parser";

type Node = Record<string, unknown>;
function node(value: unknown): value is Node {
  return typeof value === "object" && value !== null;
}
export function browserTagErrors(
  source: string,
  file = "scenario.ts",
): string[] {
  const tree = parse(source, { sourceType: "module", plugins: ["typescript"] });
  const errors: string[] = [];
  function literal(value: unknown): string | undefined {
    if (!node(value)) return undefined;
    if (value.type === "StringLiteral") return String(value.value);
    if (value.type === "TemplateLiteral") {
      const quasis = value.quasis as Node[];
      const expressions = value.expressions as Node[];
      return quasis
        .map(
          (quasi, index) =>
            String((quasi.value as Node).cooked) +
            (expressions[index]
              ? `\${${source.slice(Number(expressions[index].start), Number(expressions[index].end))}}`
              : ""),
        )
        .join("");
    }
    return undefined;
  }
  function walk(value: unknown, visit: (child: Node) => void) {
    if (Array.isArray(value)) {
      for (const child of value) walk(child, visit);
    } else if (node(value)) {
      visit(value);
      for (const child of Object.values(value)) walk(child, visit);
    }
  }
  walk(tree, (call) => {
    if (
      call.type !== "CallExpression" ||
      !node(call.callee) ||
      call.callee.name !== "test"
    )
      return;
    const args = call.arguments as Node[];
    const tags: string[] = [];
    if (args[1]?.type === "ObjectExpression") {
      for (const property of args[1].properties as Node[]) {
        if (
          node(property.key) &&
          (property.key.name === "tag" || property.key.value === "tag")
        )
          walk(property.value, (value) => {
            const tag = literal(value);
            if (tag?.startsWith("@theme:")) tags.push(tag.slice(7));
          });
      }
    }
    walk(args.at(-1), (child) => {
      if (
        child.type !== "CallExpression" ||
        !node(child.callee) ||
        !node(child.callee.property) ||
        child.callee.property.name !== "goto"
      )
        return;
      const url = literal((child.arguments as Node[])[0]);
      const theme = url?.split("globals=theme:")[1]?.split("&")[0];
      if (theme && (tags.length !== 1 || tags[0] !== theme))
        errors.push(
          `${file}:${(call.loc as { start: { line: number } }).start.line}: story theme ${theme} requires matching theme tag`,
        );
    });
  });
  return errors;
}
export function checkBrowserTags(root = process.cwd()) {
  const files = ["tests/browser", "src"].flatMap((directory) =>
    readdirSync(resolve(root, directory), {
      recursive: true,
      withFileTypes: true,
    })
      .filter(
        (entry) =>
          entry.isFile() && /(?:browser\.spec|\.spec)\.ts$/.test(entry.name),
      )
      .map((entry) => resolve(entry.parentPath, entry.name)),
  );
  const errors = files.flatMap((file) =>
    browserTagErrors(readFileSync(file, "utf8"), file),
  );
  if (errors.length) throw new Error(errors.join("\n"));
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  checkBrowserTags();
