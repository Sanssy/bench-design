import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "@babel/parser";

export function generateComponents(entry = "src/index.ts") {
  const entrySource = readFileSync(entry, "utf8");
  const ast = (source: string) =>
    parse(source, { sourceType: "module", plugins: ["typescript", "jsx"] });
  const components = ast(entrySource).program.body.flatMap((item) => {
    if (
      item.type !== "ExportNamedDeclaration" ||
      item.exportKind === "type" ||
      !item.source
    )
      return [];
    const file = resolve(
      dirname(entry),
      item.source.value.replace(/\.js$/, ".tsx"),
    );
    const source = readFileSync(file, "utf8");
    const code = ast(source);
    return item.specifiers.flatMap((exported) => {
      const name =
        exported.exported.type === "Identifier"
          ? exported.exported.name
          : exported.exported.value;
      const node = code.program.body.find(
        (node) =>
          node.type === "ExportNamedDeclaration" &&
          node.declaration?.type === "FunctionDeclaration" &&
          node.declaration.id?.name === name,
      );
      // A public export the generator cannot describe must fail, never vanish.
      if (
        node?.type !== "ExportNamedDeclaration" ||
        node.declaration?.type !== "FunctionDeclaration"
      )
        throw new Error(`Unsupported component export: ${name}`);
      const fn = node.declaration;
      const parameter = fn.params[0];
      if (
        parameter &&
        (parameter.type !== "ObjectPattern" ||
          parameter.typeAnnotation?.type !== "TSTypeAnnotation" ||
          parameter.typeAnnotation.typeAnnotation.type !== "TSTypeReference")
      )
        throw new Error(`Unsupported API: ${name}`);
      const propsName =
        parameter?.typeAnnotation?.type === "TSTypeAnnotation"
          ? source.slice(
              parameter.typeAnnotation.typeAnnotation.start ?? 0,
              parameter.typeAnnotation.typeAnnotation.end ?? 0,
            )
          : "";
      const api = code.program.body.find(
        (node) =>
          node.type === "ExportNamedDeclaration" &&
          node.declaration?.type === "TSInterfaceDeclaration" &&
          node.declaration.id.name === propsName,
      );
      if (
        parameter &&
        (api?.type !== "ExportNamedDeclaration" ||
          api.declaration?.type !== "TSInterfaceDeclaration")
      )
        throw new Error(`Missing props: ${name}`);
      const defaults = new Map<string, string>();
      for (const prop of parameter?.properties ?? []) {
        if (
          prop.type === "ObjectProperty" &&
          prop.value.type === "AssignmentPattern"
        )
          defaults.set(
            prop.key.type === "Identifier"
              ? prop.key.name
              : source.slice(prop.key.start ?? 0, prop.key.end ?? 0),
            source.slice(
              prop.value.right.start ?? 0,
              prop.value.right.end ?? 0,
            ),
          );
      }
      // Expand relative literal aliases so the manifest lists valid values.
      const resolveAlias = (text: string) => {
        const imported = ast(source).program.body.find(
          (node) =>
            node.type === "ImportDeclaration" &&
            node.source.value.startsWith(".") &&
            node.specifiers.some((specifier) => specifier.local.name === text),
        );
        if (imported?.type !== "ImportDeclaration") return text;
        const target = resolve(
          dirname(file),
          `${imported.source.value.replace(/\.js$/, "")}.ts`,
        );
        const alias = ast(readFileSync(target, "utf8")).program.body.find(
          (node) =>
            node.type === "ExportNamedDeclaration" &&
            node.declaration?.type === "TSTypeAliasDeclaration" &&
            node.declaration.id.name === text,
        );
        if (
          alias?.type !== "ExportNamedDeclaration" ||
          alias.declaration?.type !== "TSTypeAliasDeclaration"
        )
          return text;
        const union = alias.declaration.typeAnnotation;
        const members = union.type === "TSUnionType" ? union.types : [union];
        return members.every(
          (member) =>
            member.type === "TSLiteralType" &&
            (member.literal.type === "StringLiteral" ||
              member.literal.type === "NumericLiteral"),
        )
          ? members
              .map((member) =>
                member.type === "TSLiteralType" &&
                (member.literal.type === "StringLiteral" ||
                  member.literal.type === "NumericLiteral")
                  ? JSON.stringify(member.literal.value)
                  : "",
              )
              .join(" | ")
          : text;
      };
      const props = (
        api?.type === "ExportNamedDeclaration" &&
        api.declaration?.type === "TSInterfaceDeclaration"
          ? api.declaration.body.body
          : []
      ).map((prop) => {
        if (prop.type !== "TSPropertySignature" || !prop.typeAnnotation)
          throw new Error(`Unsupported prop: ${name}`);
        const key =
          prop.key.type === "Identifier"
            ? prop.key.name
            : prop.key.type === "StringLiteral"
              ? prop.key.value
              : "";
        const type = prop.typeAnnotation.typeAnnotation;
        return {
          name: key,
          type: resolveAlias(source.slice(type.start ?? 0, type.end ?? 0)),
          required: !prop.optional,
          ...(defaults.has(key) ? { default: defaults.get(key) } : {}),
        };
      });
      const storiesSource = readFileSync(
        file.replace(/\.tsx$/, ".stories.tsx"),
        "utf8",
      );
      const stories = ast(storiesSource);
      const title = storiesSource.match(/title:\s*["']([^"']+)["']/)?.[1];
      if (!title) throw new Error(`Missing story title: ${name}`);
      const names = stories.program.body.flatMap((node) =>
        node.type === "ExportNamedDeclaration" &&
        node.declaration?.type === "VariableDeclaration"
          ? node.declaration.declarations.map((decl) => {
              if (decl.id.type !== "Identifier")
                throw new Error("Unsupported story export");
              return decl.id.name;
            })
          : [],
      );
      return [
        {
          name,
          import: `import { ${name} } from "bench-design";`,
          description: (
            node.leadingComments?.find((comment) =>
              comment.value.startsWith("*"),
            )?.value ?? ""
          )
            .replace(/^\s*\* ?/gm, "")
            .trim()
            .replace(/\s*\n\s*/g, " "),
          props,
          stories: names.map((name) => ({
            name,
            href: `./?path=/story/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}--${name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}`,
          })),
        },
      ];
    });
  });
  return `${JSON.stringify({ components }, null, 2)}\n`;
}

export function checkComponents(path: string, expected: string) {
  return readFileSync(path, "utf8") === expected;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const generated = generateComponents();
  if (process.argv.includes("--check")) {
    if (!checkComponents("components.json", generated)) {
      console.error(
        "components.json diverges from code; run pnpm components:generate",
      );
      process.exitCode = 1;
    }
  } else writeFileSync("components.json", generated);
}
