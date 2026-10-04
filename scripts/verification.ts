import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import { dirname, join } from "node:path";

export const ownerLabel = "bench-design.run";
export function createArgs(id: string, image: string): string[] {
  return [
    "create",
    "--name",
    `bench-design-${id}`,
    "--label",
    `${ownerLabel}=${id}`,
  ].concat(["--init", "--shm-size=1g", image, "sleep", "infinity"]);
}
/** Files that define a verification image: same contents, same image. */
export const imageInputs = [
  "ci/Containerfile",
  "ci/install-toolchain.sh",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
];
export const imageLabel = "bench-design.verify-image";
export function imageTag(root: string) {
  const hash = createHash("sha256");
  for (const file of imageInputs)
    hash
      .update(file)
      .update("\0")
      .update(fs.readFileSync(join(root, file)));
  return `bench-design-verify:${hash.digest("hex").slice(0, 16)}`;
}
/** The CI recipe plus the locked dependencies, fetched once into the image store. */
export function imageRecipe(root: string) {
  return `${fs.readFileSync(join(root, "ci/Containerfile"), "utf8").trimEnd()}
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /deps/
RUN cd /deps && pnpm fetch --frozen-lockfile && rm -rf /deps
`;
}
/** Half the Podman VM CPUs, at most the 4 workers CI uses. */
export function defaultWorkers(cpus: number) {
  return Math.max(1, Math.min(4, Math.floor(cpus / 2)));
}
export function owned(labels: Record<string, string>, id: string) {
  return labels[ownerLabel] === id;
}
export function classify(code: number | null, interruption?: string) {
  if (interruption) return "interrupted";
  return code === 0 ? "success" : code === 41 ? "assertion" : "infrastructure";
}
export function snapshot(root: string, destination: string) {
  const git = (...args: string[]) =>
    execFileSync("git", ["-C", root, ...args], {
      encoding: "utf8",
      timeout: 10000,
    });
  const sha = git("rev-parse", "HEAD").trim();
  const dirty = git("status", "--porcelain").length > 0;
  const files = [
    ...new Set(
      git("ls-files", "-z", "--cached", "--others", "--exclude-standard")
        .split("\0")
        .filter(Boolean),
    ),
  ].sort();
  const hash = createHash("sha256");
  const included: string[] = [];
  for (const file of files) {
    const privatePaths = [
      ".git",
      ".agents",
      ".claude",
      ".codex",
      ".verification",
    ];
    if (file.split("/").some((part) => privatePaths.includes(part))) continue;
    const source = join(root, file);
    const stat = fs.lstatSync(source, { throwIfNoEntry: false });
    if (!stat) continue;
    if (!stat.isFile())
      throw new Error(`Snapshot refuses symlink/non-file: ${file}`);
    const bytes = fs.readFileSync(source);
    const mode = stat.mode & 0o111 ? 0o555 : 0o444;
    hash.update(JSON.stringify([file, mode, bytes.length])).update(bytes);
    const target = join(destination, file);
    fs.mkdirSync(dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes);
    fs.chmodSync(target, mode);
    included.push(file);
  }
  return { sha, dirty, hash: hash.digest("hex"), files: included };
}

export function exitCode(result: string, interruption?: string) {
  return interruption === "SIGINT"
    ? 130
    : result === "success"
      ? 0
      : result === "assertion"
        ? 1
        : 2;
}
