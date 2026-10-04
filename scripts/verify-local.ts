import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  classify,
  createArgs,
  defaultWorkers,
  exitCode,
  imageInputs,
  imageLabel,
  imageRecipe,
  imageTag,
  owned,
  snapshot,
} from "./verification.ts";

import { browserArgs, selection } from "./verification-selection.ts";

const input = process.argv.slice(2);
const normalized = input[0] === "--" ? input.slice(1) : input;
if (normalized.length === 1 && normalized[0] === "--help") {
  console.log(
    "Usage: pnpm verify:local -- [--target a11y|fonts|foundations|themes|button | --component <src directory>] [--browser chromium|firefox|webkit] [--theme light|dark|system] [--viewport desktop|mobile|short] [--workers <positive integer>]\nDefaults: the whole suite on all three browsers, with half the Podman VM CPUs as workers (at most 4). The image, with the locked dependencies, is reused while ci/ and the lockfile are unchanged. --component selects a component's specs and axe stories (e.g. app-shell); --browser chromium reproduces PR CI. mobile has no scenarios; short covers Button. desktop excludes short.",
  );
  process.exit(0);
}
let plan: ReturnType<typeof selection>;
try {
  plan = selection(input);
} catch (error) {
  console.error(String(error));
  process.exit(2);
}
try {
  const { checkBrowserTags } = await import("./check-browser-tags.ts");
  checkBrowserTags();
} catch (error) {
  if (
    error instanceof Error &&
    "code" in error &&
    error.code === "ERR_MODULE_NOT_FOUND"
  )
    console.error(
      "Missing dependencies: run `pnpm install` before verify:local.",
    );
  else console.error(String(error));
  process.exit(2);
}
const id = randomUUID();
const name = `bench-design-${id}`;
const reports = join(process.cwd(), ".verification/runs", id);
mkdirSync(reports, { recursive: true });
const scratch = mkdtempSync(join(tmpdir(), `bench-design-${id}-`));
const controller = new AbortController();
const deadline = Date.now() + 15 * 60 * 1000;
const manifest: Record<string, unknown> = {
  id,
  started: new Date().toISOString(),
  filters: plan.filters,
  workers: plan.workers,
  targets: plan.targets,
  commands: [],
  result: "infrastructure",
  cleanup: "pending",
};
const save = () =>
  writeFileSync(
    join(reports, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
const interrupt = (signal: string) => {
  manifest.interruption ??= signal;
  controller.abort();
};
const onInt = () => interrupt("SIGINT");
const onTerm = () => interrupt("SIGTERM");
process.on("SIGINT", onInt);
process.on("SIGTERM", onTerm);
const timer = setTimeout(() => interrupt("deadline"), deadline - Date.now());
save();
async function podman(args: string[], cleanup = false) {
  const commands = manifest.commands as unknown[];
  const entry = {
    args,
    started: new Date().toISOString(),
    code: null as number | null,
  };
  commands.push(entry);
  save();
  return await new Promise<{ code: number | null; output: string }>(
    (resolve, reject) => {
      const child = spawn("podman", args, {
        signal: cleanup ? undefined : controller.signal,
        timeout: cleanup ? 10000 : Math.max(1, deadline - Date.now()),
        killSignal: "SIGKILL",
      });
      let output = "";
      child.stdout.on("data", (data) => {
        output += data;
      });
      child.stderr.on("data", (data) => {
        output += data;
      });
      child.on("error", reject);
      child.on("close", (code) => {
        entry.code = code;
        writeFileSync(join(reports, `command-${commands.length}.log`), output);
        save();
        resolve({ code, output });
      });
    },
  );
}
async function requireOk(args: string[]) {
  const result = await podman(args);
  if (result.code !== 0)
    throw new Error(`Podman failed: ${args[0]}: ${result.output}`);
  return result.output;
}
let hasContainer = false;
try {
  const candidate = join(scratch, "candidate");
  manifest.candidate = snapshot(process.cwd(), candidate);
  save();
  let info: string;
  try {
    info = await requireOk(["info", "--format", "json"]);
  } catch (error) {
    throw new Error(`Podman absent or VM unavailable: ${String(error)}`);
  }
  manifest.podman = info;
  if (!normalized.some((arg) => arg.startsWith("--workers"))) {
    plan.workers = defaultWorkers(Number(JSON.parse(info).host?.cpus) || 1);
    manifest.workers = plan.workers;
  }
  const image = imageTag(candidate);
  manifest.image = image;
  manifest.imageReused = (await podman(["image", "exists", image])).code === 0;
  if (!manifest.imageReused) {
    const context = join(scratch, "image");
    mkdirSync(context);
    // The recipe replaces ci/Containerfile; snapshot copies are read-only.
    for (const file of imageInputs.filter(
      (item) => item !== "ci/Containerfile",
    ))
      copyFileSync(
        join(candidate, file),
        join(context, file.replace("ci/", "")),
      );
    writeFileSync(join(context, "Containerfile"), imageRecipe(candidate));
    await requireOk([
      "build",
      "--label",
      `${imageLabel}=1`,
      "-f",
      join(context, "Containerfile"),
      "-t",
      image,
      context,
    ]);
    // Keep one verification image: drop those built from older recipes.
    const listed = await podman(
      [
        "images",
        "--filter",
        `label=${imageLabel}`,
        "--format",
        "{{.Repository}}:{{.Tag}}",
      ],
      true,
    );
    for (const stale of listed.output
      .split("\n")
      .filter((tag) => tag.includes(":") && tag !== image))
      await podman(["image", "rm", stale], true);
  }
  hasContainer = true;
  await requireOk(createArgs(id, image));
  await requireOk([
    "cp",
    `${join(scratch, "candidate")}/.`,
    `${name}:/workspace`,
  ]);
  await requireOk(["start", name]);
  await requireOk([
    "exec",
    name,
    "sh",
    "-c",
    "chmod -R u+w /workspace && pnpm install --frozen-lockfile --prefer-offline",
  ]);
  const gates =
    "check test build check:visual-values build-storybook test:package test:browser".split(
      " ",
    );
  const result = await podman([
    "exec",
    name,
    "sh",
    "-c",
    gates
      .map(
        (gate) =>
          `pnpm ${gate}${
            gate === "test:browser"
              ? " " +
                browserArgs(plan)
                  .map((arg) => `'${arg}'`)
                  .join(" ")
              : ""
          } || exit 41`,
      )
      .join("; "),
  ]);
  manifest.result = classify(result.code);
  process.exitCode = exitCode(String(manifest.result));
} catch (error) {
  manifest.error = String(error);
  console.error(manifest.error);
  process.exitCode = 2;
} finally {
  clearTimeout(timer);
  await cleanup();
  rmSync(scratch, { recursive: true, force: true });
  manifest.finished = new Date().toISOString();
  save();
  if (manifest.interruption) {
    manifest.result = classify(null, String(manifest.interruption));
    process.exitCode = exitCode(
      String(manifest.result),
      String(manifest.interruption),
    );
    save();
  }
  process.off("SIGINT", onInt);
  process.off("SIGTERM", onTerm);
  console.log(`Verification ${manifest.result}; reports: ${reports}`);
}

async function cleanup() {
  try {
    if (hasContainer) {
      for (const path of ["playwright-report", "test-results"])
        await podman(["cp", `${name}:/workspace/${path}`, reports], true);
    }
    // The image is kept for the next run; only this run's container goes.
    if (hasContainer) {
      const inspected = await podman(["container", "inspect", name], true);
      if (inspected.code !== 0)
        throw new Error("Cleanup inspection failed: container");
      const resource = JSON.parse(inspected.output)[0];
      if (!owned(resource.Config?.Labels ?? {}, id))
        throw new Error("Owner label mismatch; refusing cleanup");
      const removed = await podman(["container", "rm", "--force", name], true);
      if (removed.code !== 0) throw new Error("Cleanup failed: container");
    }
    manifest.cleanup = "complete";
  } catch (error) {
    manifest.cleanup = String(error);
    process.exitCode = 2;
  }
}
