import { globSync, readFileSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "@babel/parser";

const root = resolve("src");
const allowed = new Set(["react", "react-dom", "react-aria-components"]);
export function violations(source, file) {
  const errors = [];
  const tree = parse(source, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
    createImportExpressions: true,
  });
  function check(specifier, reexport) {
    const name = specifier.value;
    if (name.startsWith(".")) {
      const target = resolve(dirname(file), name);
      if (
        !target.startsWith(`${root}${sep}`) ||
        /(?:\.stories|\.test)\./.test(target)
      ) {
        errors.push(`${file}: private/test/story import ${name}`);
      }
    } else {
      const pkg = name.startsWith("@")
        ? name.split("/").slice(0, 2).join("/")
        : name.split("/")[0];
      if (!allowed.has(pkg) || (reexport && pkg === "react-aria-components")) {
        errors.push(`${file}: forbidden dependency/re-export ${name}`);
      }
      if (file.includes(`${sep}foundations${sep}`) && allowed.has(pkg)) {
        errors.push(`${file}: foundations must be React-independent`);
      }
    }
  }
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (
      [
        "ImportDeclaration",
        "ExportNamedDeclaration",
        "ExportAllDeclaration",
      ].includes(node.type) &&
      node.source
    ) {
      check(node.source, node.type !== "ImportDeclaration");
    }
    if (
      node.type === "ImportExpression" &&
      node.source.type === "StringLiteral"
    )
      check(node.source, false);
    if (
      node.type === "CallExpression" &&
      node.callee.type === "Identifier" &&
      node.callee.name === "require" &&
      node.arguments[0]?.type === "StringLiteral"
    )
      check(node.arguments[0], false);
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === "object") visit(value);
    }
  }
  visit(tree);
  return errors;
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const errors = globSync("src/**/*.{ts,tsx}").flatMap((file) =>
    violations(readFileSync(file, "utf8"), resolve(file)),
  );
  for (const error of errors) console.error(error);
  if (errors.length) process.exitCode = 1;
  else console.log("Package TypeScript boundaries PASS");
}
