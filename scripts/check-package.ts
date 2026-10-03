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
  for (const name of ["tokens.css", "styles.css", "theme-init.js"]) {
    assert(entries.includes(`package/dist/${name}`), `packed ${name} missing`);
  }
  const extracted = join(consumer, "extracted");
  mkdirSync(extracted);
  execFileSync("tar", ["-xzf", tarball, "-C", extracted]);
  checkFontAssets(pathToFileURL(join(extracted, "package/dist/styles.css")));
  const pkg: {
    packageManager: string;
    devDependencies: { typescript: string };
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
      devDependencies: { typescript: pkg.devDependencies.typescript },
    }),
  );
  writeFileSync(
    join(consumer, "index.ts"),
    'import * as ds from "bench-design";\nconst api: Record<string, never> = ds;\nvoid api;\n',
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
    "index.ts",
  ]);
  run("node", [
    "--input-type=module",
    "-e",
    'import assert from "node:assert/strict"; import * as ds from "bench-design"; assert.deepEqual(Object.keys(ds), []);',
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
    "Distribution PASS: isolated tarball ESM/types, no public API or private files",
  );
} finally {
  rmSync(consumer, { recursive: true, force: true });
}
