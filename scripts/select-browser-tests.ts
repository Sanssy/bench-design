import { spawnSync } from "node:child_process";
import { appendFileSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// importers maps a component directory to the component directories whose
// files import it (e.g. Link stories render Text), so their tests rerun too.
export function selectBrowserTests(
  paths: string[] | null,
  importers: Record<string, string[]> = {},
) {
  const full = { mode: "full", args: [] as string[], visual: true };
  if (paths === null) return full;
  const patterns = new Set<string>();
  const components = new Set<string>();
  const add = (component: string) => {
    if (components.has(component)) return;
    components.add(component);
    for (const importer of importers[component] ?? []) add(importer);
  };
  for (const path of paths) {
    const component = /^src\/([^/]+)\//.exec(path)?.[1];
    if (component) {
      add(component);
    } else if (/^tests\/browser\/[^/]+\.spec\.ts$/.test(path)) {
      patterns.add(`${escapeRegex(path)}(?:\\s|$)`);
    } else if (
      !/^(tests\/tooling\/|docs\/decisions\/)/.test(path) &&
      !/^[^/]+\.md$/.test(path)
    )
      return full;
  }
  for (const component of components)
    patterns.add(`@component:${escapeRegex(component)}(?:\\s|$)`);
  // Components with visual captures (tests/visual); Icon reaches them as an
  // import of both.
  const visual = ["button", "icon-button"].some((name) => components.has(name));
  return patterns.size
    ? { mode: "scoped", args: ["--grep", [...patterns].join("|")], visual }
    : { mode: "empty", args: [], visual: false };
}

export function componentImporters(root = "src") {
  const importers: Record<string, string[]> = {};
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    for (const file of readdirSync(`${root}/${entry.name}`, {
      withFileTypes: true,
    })) {
      if (!file.isFile()) continue;
      const source = readFileSync(`${root}/${entry.name}/${file.name}`, "utf8");
      for (const [, imported] of source.matchAll(/from "\.\.\/([^/"]+)\//g))
        if (imported && imported !== entry.name)
          importers[imported] = [...(importers[imported] ?? []), entry.name];
    }
  }
  return importers;
}

export function selectionFromBase(base: string | undefined) {
  if (!base) return selectBrowserTests(null);
  const diff = spawnSync(
    "git",
    ["diff", "--name-only", "-z", "--no-renames", `${base}...HEAD`, "--"],
    {
      encoding: "utf8",
    },
  );
  return selectBrowserTests(
    diff.status === 0 ? diff.stdout.split("\0").filter(Boolean) : null,
    componentImporters(),
  );
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const base = process.argv[process.argv.indexOf("--base") + 1];
  const plan = selectionFromBase(
    process.argv.includes("--base") ? base : undefined,
  );
  console.log(JSON.stringify(plan));
  if (process.env.GITHUB_OUTPUT)
    appendFileSync(process.env.GITHUB_OUTPUT, `visual=${plan.visual}\n`);
  if (process.argv.includes("--run") && plan.mode !== "empty") {
    const run = spawnSync("pnpm", ["test:browser", ...plan.args], {
      stdio: "inherit",
    });
    process.exitCode = run.status ?? 1;
  }
}
