import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { classify, createArgs, owned, snapshot } from "./verification.ts";

if (process.argv.slice(2).filter((arg) => arg !== "--").length) {
  console.error(
    "B3 tranche 1 accepts no filters yet; refusing unsupported arguments.",
  );
  process.exit(2);
}
const id = randomUUID();
const name = `bench-design-${id}`;
const image = `bench-design-verify:${id}`;
const reports = join(process.cwd(), ".verification/runs", id);
mkdirSync(reports, { recursive: true });
const scratch = mkdtempSync(join(tmpdir(), `bench-design-${id}-`));
const controller = new AbortController();
const deadline = Date.now() + 15 * 60 * 1000;
const manifest: Record<string, unknown> = {
  id,
  started: new Date().toISOString(),
  filters: {},
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
  manifest.interruption = signal;
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
let hasImage = false;
try {
  manifest.candidate = snapshot(process.cwd(), join(scratch, "candidate"));
  save();
  try {
    manifest.podman = await requireOk(["info", "--format", "json"]);
  } catch (error) {
    throw new Error(`Podman absent or VM unavailable: ${String(error)}`);
  }
  manifest.image = image;
  hasImage = true;
  await requireOk([
    "build",
    "--label",
    `bench-design.run=${id}`,
    "-f",
    join(scratch, "candidate/ci/Containerfile"),
    "-t",
    image,
    join(scratch, "candidate/ci"),
  ]);
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
    "chmod -R u+w /workspace && pnpm install --frozen-lockfile",
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
    gates.map((gate) => `pnpm ${gate} || exit 41`).join("; "),
  ]);
  manifest.result = classify(result.code);
  process.exitCode = result.code === 0 ? 0 : result.code === 41 ? 1 : 2;
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
    for (const kind of ["container", "image"]) {
      if (kind === "container" ? !hasContainer : !hasImage) continue;
      const resourceName = kind === "image" ? image : name;
      const inspected = await podman([kind, "inspect", resourceName], true);
      if (inspected.code !== 0)
        throw new Error(`Cleanup inspection failed: ${kind}`);
      const resource = JSON.parse(inspected.output)[0];
      if (!owned(resource.Config?.Labels ?? resource.Labels ?? {}, id))
        throw new Error("Owner label mismatch; refusing cleanup");
      const removed = await podman([kind, "rm", "--force", resourceName], true);
      if (removed.code !== 0) throw new Error(`Cleanup failed: ${kind}`);
    }
    manifest.cleanup = "complete";
  } catch (error) {
    manifest.cleanup = String(error);
    process.exitCode = 2;
  }
}
