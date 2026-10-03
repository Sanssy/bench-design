import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  browserArgs,
  selection,
} from "../../scripts/verification-selection.ts";

test("arguments reject malformed, duplicate and unknown options before execution", () => {
  for (const args of [
    ["--parallel", "2"],
    ["--workers", "0"],
    ["--workers", "1.5"],
    ["--workers", "9007199254740992"],
    ["--theme", "blue"],
    ["--target"],
    ["--theme", "dark", "--theme", "light"],
    ["--viewport", "huge"],
  ])
    assert.throws(() => selection(args));
  assert.equal(selection([]).workers, 1);
  assert.equal(selection(["--", "--workers", "3"]).workers, 3);
});
test("filters correspond to existing themed scenarios and reject empty intersections", () => {
  assert.deepEqual(
    selection(["--target", "foundations", "--theme", "system"]).targets,
    ["foundations"],
  );
  assert.deepEqual(selection(["--theme", "dark"]).targets, [
    "a11y",
    "foundations",
    "themes",
    "button",
  ]);
  for (const args of [
    ["--target", "fonts", "--theme", "dark"],
    ["--target", "unknown"],
    ["--viewport", "mobile"],
  ])
    assert.throws(() => selection(args), /selection|target/i);
});
test("browser arguments preserve workers and constrain theme tags", () => {
  const plan = selection([
    "--target",
    "button",
    "--theme",
    "dark",
    "--workers",
    "2",
  ]);
  const args = browserArgs(plan);
  assert(args.includes("--workers=2"));
  assert(args.includes("src/button/Button.browser.spec.ts"));
  const grep = new RegExp(args[args.indexOf("--grep") + 1] ?? "");
  assert(grep.test("disabled @theme:dark"));
  assert(!grep.test("disabled @theme:light"));
});

test("invalid CLI creates no resources even outside a Git checkout", () => {
  const cwd = mkdtempSync(join(tmpdir(), "invalid-selection-"));
  try {
    const result = spawnSync(
      process.execPath,
      [
        new URL("../../scripts/verify-local.ts", import.meta.url).pathname,
        "--target",
        "fonts",
        "--theme",
        "dark",
      ],
      { cwd, encoding: "utf8" },
    );
    assert.equal(result.status, 2);
    assert.match(result.stderr, /Empty browser selection/);
    assert.deepEqual(readdirSync(cwd), []);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test("short scenarios support theme intersections and desktop excludes them", () => {
  const plan = selection(["--viewport", "short", "--theme", "dark"]);
  assert.deepEqual(plan.targets, ["button"]);
  const args = browserArgs(plan);
  const grep = new RegExp(args[args.indexOf("--grep") + 1] ?? "");
  assert(grep.test("long @theme:dark @viewport:short"));
  assert(!grep.test("focus @theme:dark"));
  assert(!grep.test("long @theme:light @viewport:short"));
  const desktop = browserArgs(selection(["--viewport", "desktop"]));
  assert(
    !new RegExp(desktop[desktop.indexOf("--grep") + 1] ?? "").test(
      "long @viewport:short",
    ),
  );
  assert.throws(
    () => selection(["--target", "fonts", "--viewport", "short"]),
    /Empty/,
  );
});

test("help exits successfully without creating resources outside Git", () => {
  const cwd = mkdtempSync(join(tmpdir(), "help-selection-"));
  try {
    for (const args of [["--help"], ["--", "--help"]]) {
      const result = spawnSync(
        process.execPath,
        [
          new URL("../../scripts/verify-local.ts", import.meta.url).pathname,
          ...args,
        ],
        { cwd, encoding: "utf8" },
      );
      assert.equal(result.status, 0);
      assert.match(result.stdout, /Usage:.*verify:local/);
      assert.match(result.stdout, /--workers/);
      assert.deepEqual(readdirSync(cwd), []);
    }
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test("CLI validates before loading dependencies and explains missing dependencies", () => {
  const cwd = mkdtempSync(join(tmpdir(), "dependency-free-selection-"));
  try {
    const scripts = join(cwd, "scripts");
    mkdirSync(scripts);
    writeFileSync(join(cwd, "package.json"), '{"type":"module"}');
    for (const file of [
      "verify-local.ts",
      "verification.ts",
      "verification-selection.ts",
      "check-browser-tags.ts",
    ])
      copyFileSync(
        new URL(`../../scripts/${file}`, import.meta.url),
        join(scripts, file),
      );
    const before = readdirSync(cwd);
    for (const [args, status, message] of [
      [["--help"], 0, /Usage:/],
      [["--", "--help"], 0, /Usage:/],
      [["--workers", "0"], 2, /positive safe integer/],
      [["--target", "fonts", "--theme", "dark"], 2, /Empty browser selection/],
      [[], 2, /Missing dependencies: run `pnpm install` before verify:local\./],
    ] as const) {
      const result = spawnSync(
        process.execPath,
        [join(scripts, "verify-local.ts"), ...args],
        { cwd, encoding: "utf8" },
      );
      assert.equal(result.status, status);
      assert.match(result.stdout + result.stderr, message);
      assert.doesNotMatch(
        result.stderr,
        /ERR_MODULE_NOT_FOUND|at ModuleJob|at async/,
      );
      assert.deepEqual(readdirSync(cwd), before);
    }
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test("a11y replaces bootstrap and supports only explicit themes", () => {
  for (const theme of ["light", "dark"]) {
    const args = browserArgs(selection(["--target", "a11y", "--theme", theme]));
    assert(args.includes("tests/browser/a11y.spec.ts"));
    const grep = new RegExp(args[args.indexOf("--grep") + 1] ?? "");
    assert(grep.test(`page @theme:${theme}`));
    assert(!grep.test(`page @theme:${theme === "light" ? "dark" : "light"}`));
  }
  assert.throws(() => selection(["--target", "bootstrap"]), /Unknown target/);
  assert.throws(
    () => selection(["--target", "a11y", "--theme", "system"]),
    /Empty/,
  );
});
