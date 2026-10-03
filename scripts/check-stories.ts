import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "@babel/parser";

export function storyCoverage(entry: string) {
  const visited = new Set<string>();
  function exportsOf(file: string): Map<string, string> {
    if (visited.has(file)) throw new Error(`Cyclic export graph: ${file}`);
    visited.add(file);
    const tree = parse(readFileSync(file, "utf8"), {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });
    const local = new Map<string, string>();
    const exported = new Map<string, string>();
    function dependency(name: string) {
      if (!name.startsWith(".")) return new Map<string, string>();
      const base = resolve(dirname(file), name).replace(/\.jsx?$/, "");
      const target = [
        base,
        `${base}.tsx`,
        `${base}.ts`,
        resolve(base, "index.ts"),
        resolve(base, "index.tsx"),
      ].find(
        (candidate) => existsSync(candidate) && statSync(candidate).isFile(),
      );
      if (!target)
        throw new Error(`Cannot resolve component export: ${name} in ${file}`);
      return exportsOf(target);
    }
    function collect(node: (typeof tree.program.body)[number]) {
      if (
        node.type === "FunctionDeclaration" ||
        node.type === "ClassDeclaration"
      ) {
        if (node.id) local.set(node.id.name, file);
      }
      if (node.type === "VariableDeclaration") {
        for (const item of node.declarations) {
          if (
            item.id.type === "Identifier" &&
            item.init &&
            [
              "ArrowFunctionExpression",
              "FunctionExpression",
              "CallExpression",
            ].includes(item.init.type)
          )
            local.set(item.id.name, file);
        }
      }
      if (node.type === "ImportDeclaration" && node.importKind !== "type") {
        const imported = dependency(node.source.value);
        for (const item of node.specifiers) {
          if (item.type === "ImportSpecifier" && item.importKind === "type")
            continue;
          const name =
            item.type === "ImportSpecifier"
              ? item.imported.type === "Identifier"
                ? item.imported.name
                : item.imported.value
              : "default";
          const origin = imported.get(name);
          if (origin) local.set(item.local.name, origin);
        }
      }
    }
    for (const node of tree.program.body) {
      if (node.type === "ExportNamedDeclaration" && node.declaration)
        collect(node.declaration);
      else collect(node);
    }
    for (const node of tree.program.body) {
      if (node.type === "ExportAllDeclaration" && node.exportKind !== "type") {
        for (const [name, origin] of dependency(node.source.value))
          if (name !== "default") exported.set(name, origin);
      }
      if (
        node.type === "ExportNamedDeclaration" &&
        node.exportKind !== "type"
      ) {
        const candidates = node.source ? dependency(node.source.value) : local;
        if (node.declaration)
          for (const [name, origin] of local) {
            if (
              node.declaration.type === "VariableDeclaration"
                ? node.declaration.declarations.some(
                    (item) =>
                      item.id.type === "Identifier" && item.id.name === name,
                  )
                : "id" in node.declaration &&
                  node.declaration.id?.type === "Identifier" &&
                  node.declaration.id.name === name
            )
              exported.set(name, origin);
          }
        for (const item of node.specifiers) {
          if (item.type !== "ExportSpecifier" || item.exportKind === "type")
            continue;
          const origin = candidates.get(item.local.name);
          if (origin)
            exported.set(
              item.exported.type === "Identifier"
                ? item.exported.name
                : item.exported.value,
              origin,
            );
        }
      }
      if (node.type === "ExportDefaultDeclaration") {
        const value = node.declaration;
        const origin =
          value.type === "Identifier" ? local.get(value.name) : file;
        if (origin) exported.set("default", origin);
      }
    }
    visited.delete(file);
    return exported;
  }
  const components = [...exportsOf(entry)].filter(
    ([name]) => /^[A-Z]/.test(name) || name === "default",
  );
  const missing = components.flatMap(([name, file]) => {
    const story = file.replace(/\.tsx?$/, ".stories.tsx");
    return existsSync(story)
      ? []
      : [`${name}: missing adjacent story ${story}`];
  });
  return { count: components.length, missing };
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const result = storyCoverage(resolve("src/index.ts"));
  for (const message of result.missing) console.error(message);
  if (result.missing.length) process.exitCode = 1;
  else
    console.log(
      `Story coverage: ${result.count} exported components${result.count === 0 ? " (no components delivered yet)" : " PASS"}`,
    );
}
