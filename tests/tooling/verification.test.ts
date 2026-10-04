import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  classify,
  createArgs,
  defaultWorkers,
  exitCode,
  imageInputs,
  imageRecipe,
  imageTag,
  owned,
  snapshot,
} from "../../scripts/verification.ts";

test("isolated container has owner label and no host mounts or ports", () => {
  const args = createArgs("abc", "image@sha256:123");
  assert(args.includes("bench-design.run=abc"));
  assert(args.includes("--shm-size=1g"));
  assert(
    !args.some((arg) =>
      /^(--volume|--mount|--publish|--privileged|--network=host|--ipc=host|-v|-p)$/.test(
        arg,
      ),
    ),
  );
});
test("cleanup accepts only the exact owner UUID", () => {
  assert.equal(owned({ "bench-design.run": "other" }, "abc"), false);
  assert.equal(owned({ "bench-design.run": "abc" }, "abc"), true);
});
test("snapshot includes untracked bytes but excludes ignored files", () => {
  const root = mkdtempSync(join(tmpdir(), "verification-test-"));
  try {
    execFileSync("git", ["init", "--quiet", root]);
    const git = (...args: string[]) =>
      execFileSync("git", ["-C", root, ...args]);
    writeFileSync(join(root, ".gitignore"), "ignored\n");
    writeFileSync(join(root, "tracked"), "initial");
    git("add", ".");
    git(
      ..."-c user.name=Test -c user.email=test@example.invalid commit -m fixture".split(
        " ",
      ),
    );
    writeFileSync(join(root, "local"), "candidate");
    writeFileSync(join(root, "ignored"), "excluded");
    const result = snapshot(root, join(root, "ignored-snapshot"));
    writeFileSync(join(root, "local"), "changed");
    assert.equal(
      readFileSync(join(root, "ignored-snapshot/local"), "utf8"),
      "candidate",
    );
    assert(result.files.includes("local"));
    assert(!result.files.includes("ignored"));
    assert.equal(result.dirty, true);
    assert.match(result.hash, /^[a-f0-9]{64}$/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
test("gate failures and infrastructure failures have distinct nonzero results", () => {
  assert.equal(classify(41), "assertion");
  assert.equal(classify(125), "infrastructure");
  assert.equal(classify(0), "success");
});

test("interruption takes precedence over gate and infrastructure results", () => {
  for (const reason of ["SIGINT", "SIGTERM", "deadline"]) {
    assert.equal(classify(41, reason), "interrupted");
    assert.equal(
      exitCode("interrupted", reason),
      reason === "SIGINT" ? 130 : 2,
    );
  }
});

test("verification image tag follows the recipe and the lockfile", () => {
  const root = mkdtempSync(join(tmpdir(), "bd-image-"));
  try {
    mkdirSync(join(root, "ci"));
    for (const file of imageInputs) writeFileSync(join(root, file), file);
    const first = imageTag(root);
    assert.match(first, /^bench-design-verify:[0-9a-f]{16}$/);
    assert.equal(imageTag(root), first);
    writeFileSync(join(root, "pnpm-lock.yaml"), "changed");
    assert.notEqual(imageTag(root), first);
    assert.match(imageRecipe(root), /pnpm fetch/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
test("default workers use half the VM CPUs, between 1 and 4", () => {
  assert.deepEqual([1, 2, 4, 8, 16].map(defaultWorkers), [1, 1, 2, 4, 4]);
});
