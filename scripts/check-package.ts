import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { checkFontAssets } from "./check-font-assets.ts";
import { checkPublicJavaScript } from "./check-public-javascript.ts";
import { checkPublicTypes } from "./check-public-types.ts";

const consumer = mkdtempSync(join(tmpdir(), "bench-design-consumer-"));
const run = (cmd: string, args: string[]) =>
  execFileSync(cmd, args, { cwd: consumer, stdio: "inherit" });
try {
  execFileSync("pnpm", ["pack", "--pack-destination", consumer], {
    stdio: "inherit",
  });
  const tarballName = readdirSync(consumer).find((name) =>
    name.endsWith(".tgz"),
  );
  assert(tarballName, "packed tarball is missing");
  const tarball = join(consumer, tarballName);
  const entries = execFileSync("tar", ["-tzf", tarball], { encoding: "utf8" })
    .trim()
    .split("\n");
  assert(
    entries.includes("package/dist/index.js"),
    "packed ESM entry is missing",
  );
  assert(
    entries.includes("package/dist/index.d.ts"),
    "packed types are missing",
  );
  assert(
    entries.every(
      (entry) =>
        entry.startsWith("package/dist/") ||
        ["package/package.json", "package/README.md"].includes(entry),
    ),
    "unexpected private/source/test file in tarball",
  );
  for (const name of [
    "tokens.css",
    "tokens.json",
    "AGENTS.md",
    "styles.css",
    "theme-init.js",
  ]) {
    assert(entries.includes(`package/dist/${name}`), `packed ${name} missing`);
  }
  const extracted = join(consumer, "extracted");
  mkdirSync(extracted);
  execFileSync("tar", ["-xzf", tarball, "-C", extracted]);
  checkPublicTypes(join(extracted, "package/dist"));
  checkPublicJavaScript(join(extracted, "package/dist"));
  checkFontAssets(pathToFileURL(join(extracted, "package/dist/styles.css")));
  const pkg: {
    packageManager: string;
    devDependencies: { typescript: string; "@types/react": string };
  } = JSON.parse(readFileSync("package.json", "utf8"));
  writeFileSync(
    join(consumer, "package.json"),
    JSON.stringify({
      private: true,
      type: "module",
      packageManager: pkg.packageManager,
      dependencies: {
        "bench-design": `file:${tarball}`,
        // Explicit tested lower bound, independent of the package peer ranges.
        react: "19.3.0",
        "react-dom": "19.3.0",
      },
      devDependencies: {
        typescript: pkg.devDependencies.typescript,
        "@types/react": pkg.devDependencies["@types/react"],
      },
    }),
  );
  writeFileSync(
    join(consumer, "index.tsx"),
    `import { Button, type ButtonProps } from "bench-design";
import { createRef } from "react";
const props: ButtonProps = { children: "Save", type: "submit", variant: "primary", ref: createRef<HTMLButtonElement>(), onPress: () => {}, isDisabled: false, "aria-label": "Save document", "aria-labelledby": "save-label" };
const button = <Button {...props} />;
// @ts-expect-error content is required
const missingContent = <Button />;
// @ts-expect-error general HTML passthrough is excluded
const click = <Button onClick={() => {}}>Save</Button>;
// @ts-expect-error routing is excluded
const link = <Button href="/">Save</Button>;
// @ts-expect-error unapproved variant
const variant = <Button variant="tertiary">Save</Button>;
// @ts-expect-error unapproved type
const type = <Button type="link">Save</Button>;
void [button, missingContent, click, link, variant, type];
`,
  );
  run("pnpm", ["install", "--ignore-scripts", "--strict-peer-dependencies"]);
  run("pnpm", [
    "exec",
    "tsc",
    "--noEmit",
    "--strict",
    "--module",
    "NodeNext",
    "--moduleResolution",
    "NodeNext",
    "--jsx",
    "react-jsx",
    "index.tsx",
  ]);
  run("node", [
    "--input-type=module",
    "-e",
    'import assert from "node:assert/strict"; import * as ds from "bench-design"; assert.deepEqual(Object.keys(ds), ["Button"]); assert.equal(typeof ds.Button, "function");',
  ]);
  run("node", [
    "--input-type=module",
    "-e",
    `
    import assert from "node:assert/strict";
    import { readFileSync } from "node:fs";
    const tokens = readFileSync(new URL(import.meta.resolve("bench-design/tokens.css")), "utf8");
    assert(tokens.includes("--bd-surface:"));
    const styles = readFileSync(new URL(import.meta.resolve("bench-design/styles.css")), "utf8");
    assert(styles.includes('@import "./tokens.css"'));
    const init = await import("bench-design/theme-init.js");
    assert.deepEqual(Object.keys(init), []);
  `,
  ]);
  checkFontAssets(
    pathToFileURL(join(consumer, "node_modules/bench-design/dist/styles.css")),
  );
  console.log(
    "Distribution PASS: isolated tarball ESM/types, Button public API, no private files",
  );
} finally {
  rmSync(consumer, { recursive: true, force: true });
}
