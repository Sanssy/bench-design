# Contributing to bench-design

## Toolchain and commands

Use the pinned Node 24.21.0 (`.nvmrc`) and pnpm 12.8.1.
Install dependencies with `pnpm install --frozen-lockfile`. On a development
machine, install Playwright browsers once with `pnpm exec playwright install`.

| Command | Responsibility |
| --- | --- |
| `pnpm check` | Formatting, strict types, import boundaries and generated catalogs |
| `pnpm test` | Render/interact/assert and tooling tests |
| `pnpm build` | ESM package, TypeScript declarations, CSS and integration docs |
| `pnpm build-storybook` | Foundation documentation and component examples |
| `pnpm test:package` | Tarball imported and type-checked by an isolated consumer |
| `pnpm test:browser` | Chromium, Firefox, WebKit and automated accessibility checks |
| `pnpm verify` | All checks above, including visual-value validation |

## Verify changes

```sh
pnpm install --frozen-lockfile
pnpm verify
```

Run `pnpm verify` before every push. It runs check, test, build, visual-value
validation, Storybook, package consumption and browser tests in Chromium,
Firefox and WebKit. An empty selection or skipped execution is never success.

PR CI runs Chromium only (`BD_BROWSERS=chromium`); it does not rerun on `main`
after merge. The `static` job runs checks, unit tests, build, visual-value
validation and package tests without a container. The `browser` job runs browser
tests and captures in the slim image from `ci/Containerfile.chromium`.
The image job builds and publishes that image to GHCR only when the recipe
or toolchain installer changes.

## Optional Linux verification

`pnpm verify:local` runs checks in the Playwright image pinned by version and
digest (`ci/Containerfile`), using Podman with an active VM. It verifies a snapshot
of the current checkout, including uncommitted files; the checkout, `.git` and
`node_modules` are never mounted.

```sh
pnpm verify:local -- --help
pnpm verify:local -- --target button --theme dark --workers 2
```

Filters: `--target` (bootstrap, fonts, foundations, themes, button), `--theme`
(light, dark, system), `--viewport` (desktop, short; mobile has no scenarios yet),
and `--workers`. Filters intersect; invalid options and empty selections are
rejected before startup. Reports remain in `.verification/runs/<uuid>/`, with
`manifest.json` recording the snapshot, selection, commands, result and cleanup.
Exit codes: 0 success, 1 assertion failure, 2 infrastructure, 130 interruption.
Cleanup touches only resources owned by that run.

## Visual references

GitHub CI is the canonical capture environment: Linux x64 with the pinned
Chromium image. The capture step in the `browser` job compares twenty Button
scenarios (two variants, five states, two themes) in Chromium. Firefox and
WebKit are covered by computed-style tests. After `pnpm build-storybook`, run:

```sh
pnpm exec playwright test --config playwright.visual.config.ts
```

Canonical execution uses `ci/Containerfile.chromium`: pinned Ubuntu 24.04,
Playwright 1.63.0 Chromium, and Node/pnpm from `ci/install-toolchain.sh`.
References live in `tests/visual/baselines/chromium/`.
The viewport is 400 × 160, DPR 1; captures wait for `document.fonts.ready`
and disable animations. `threshold: 0` and `maxDiffPixels: 0` require exact equality
in this environment. Missing references and differences fail the comparison.
`updateSnapshots: none` prevents automatic reference creation or replacement.
The `button-visual-<run>-<attempt>` artifact retains candidates, diffs, traces
and reports for 14 days, including failed comparisons.

For approval, download the artifact for the candidate SHA, inspect every candidate
and any diffs, and obtain explicit approval from the visual owner. After approval,
manually copy only approved `candidate-<variant>-<state>-<theme>.png` files into
`tests/visual/baselines/chromium/`, removing the `candidate-` prefix. Include the
SHA and approved run link in the PR, then rerun CI against those references.
Never use `--update-snapshots` or replace references just to hide a failure.

## Stories and boundaries

A story is a usage example. Keep component stories beside their implementation
(`src/**/*.stories.tsx`), covering variants and static states in light and dark.
Tests drive examples to exercise hover, press and focus. Do not create test-only
stories with counters, control forms or forced interaction states. Observable
behavior that needs no browser belongs in unit tests. `tests/fixtures/` is a
technical harness. Storybook loads distributed CSS and offers light, dark and
system themes. A missing story for an exported component fails `pnpm check`;
story presence alone does not prove state coverage.

Keep business rules and product content outside the package. Encapsulate React
Aria behind an explicit API. Shared visual fixes belong in tokens and primitives.
Test observable behavior and the distributed package. Do not edit generated
files manually or approve visual references yourself. Describe consumer impact
for every public contract change. Public documentation, examples, commit messages
and PR titles/descriptions use English; consumers supply component labels.

## Compatibility

Development and CI use exactly Node 24.21.0, pnpm 12.8.1 and React/React DOM
19.3.0. The package accepts React/React DOM `^19.3.0` and Node `>=24.21.0`.
The isolated consumer explicitly tests the lower bounds; later versions allowed
by those ranges are not claimed to be tested. Product commands and CI work from
a standalone clone.
