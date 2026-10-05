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

PR CI runs Chromium only (`BD_BROWSERS=chromium`), selecting changed components
and their axe stories against the PR base. Tooling tests, decision docs and root
Markdown need no browser tests; shared or unknown paths and unavailable bases
run the full suite. Button or shared changes also run visual comparisons.
Manual CI dispatch runs the full Chromium suite. The browser job runs as two
parallel shards: the full suite is split test by test; a scoped selection runs
once, on the first shard, which also compares captures. Nightly CI runs all three
browsers on `main` using the cached full image from `ci/Containerfile`.
`pnpm verify` always runs the complete suite before every push. The `static` job runs checks, unit tests, build, visual-value
validation and package tests without a container. The `browser` job runs browser
tests and captures in the slim image from `ci/Containerfile.chromium`.
The image job builds and publishes that image to GHCR only when the recipe
or toolchain installer changes.

## Browser test budget

Each component has at most eight executed Chromium tests. The axe test of each
usage story (light and dark) does not count: stories are curated examples. Browser tests must require a real
engine: computed styles, keyboard interaction or accessibility analysis. Tags,
attributes and props belong in render/interact/assert unit tests. Check typography
once when it is theme-independent; check colors in both themes. Group related
style cases without dropping assertions. Chromium state tests already covered by
visual captures carry `@covered-by-captures`, which the Chromium project skips;
Firefox and WebKit still run them.

The tooling budget test lists the Chromium component tests in `src/` without
starting a browser or needing a build. The axe spec reads
`storybook-static/index.json`, so build Storybook before browser runs. A budget
failure points here.

## Optional Linux verification

`pnpm verify:local` runs checks in the Playwright image pinned by version and
digest (`ci/Containerfile`), using Podman with an active VM. It verifies a snapshot
of the current checkout, including uncommitted files; the checkout, `.git` and
`node_modules` are never mounted.

Use it when a test passes on macOS but fails in CI: Linux has classic scrollbars
that take layout space, unlike macOS overlay scrollbars.

```sh
pnpm verify:local -- --help
pnpm verify:local -- --component app-shell --browser chromium
pnpm verify:local -- --target button --theme dark --workers 2
```

Without filters the whole suite runs on the three browsers. Filters:
`--component` (a `src/` directory: its specs and axe stories, by tag),
`--browser` (chromium reproduces PR CI), `--target` (a11y, fonts, foundations,
themes, button), `--theme` (light, dark, system), `--viewport` (desktop, short;
mobile has no scenarios yet), and `--workers`. Filters intersect; invalid options and empty selections are
rejected before startup. Reports remain in `.verification/runs/<uuid>/`, with
`manifest.json` recording the snapshot, selection, commands, result and cleanup.
Exit codes: 0 success, 1 assertion failure, 2 infrastructure, 130 interruption.
Cleanup touches only resources owned by that run.

## Visual references

GitHub CI is the canonical capture environment: Linux x64 with the pinned
Chromium image. The capture step in the `browser` job compares twenty Button
scenarios, twelve Button-with-icon/IconButton scenarios, and thirty composition
captures (fifteen stories in both themes) in Chromium. Firefox and
WebKit are covered by computed-style tests. After `pnpm build-storybook`, run:

```sh
pnpm exec playwright test --config playwright.visual.config.ts
```

Canonical execution uses `ci/Containerfile.chromium`: pinned Ubuntu 24.04,
Playwright 1.63.0 Chromium, and Node/pnpm from `ci/install-toolchain.sh`.
References live in `tests/visual/baselines/chromium/`.
Button and IconButton use 400 × 160 viewports. Composition captures use full-page
screenshots: recipes at 1280 × 800, and surface, form, feedback, navigation and
collection examples at 800 × 800. DPR is 1; captures wait for `document.fonts.ready`
and disable animations. Compositions clear focus and move the pointer outside the
page. Component edits also trigger captures when the transitive importer graph
reaches a captured component or recipe. `threshold: 0` and `maxDiffPixels: 0` require exact equality
in this environment. Missing references and differences fail the comparison.
`updateSnapshots: none` prevents automatic reference creation or replacement.
The `browser-1-<run>-<attempt>` artifact retains candidates, diffs, traces
and reports for 14 days, including failed comparisons.

For approval, download the artifact for the candidate SHA, inspect every candidate
and any diffs, and obtain explicit approval from the visual owner. After approval,
manually copy only approved `candidate-<scenario>-<theme>.png` files into
`tests/visual/baselines/chromium/`, removing the `candidate-` prefix. Include the
SHA and approved run link in the PR, then rerun CI against those references.
Never use `--update-snapshots` or replace references just to hide a failure.

## Stories and boundaries

A story is a usage example. Keep component stories beside their implementation
(`src/**/*.stories.tsx`), covering variants and static states in light and dark.
Tests drive examples to exercise hover, press and focus. Do not create test-only
stories with counters, control forms or forced interaction states. Observable
behavior that needs no browser belongs in unit tests. Automated WCAG 2 A/AA
checks run on the Button examples, Foundations and Docs pages in both light and
dark themes (`--target a11y`). Storybook loads distributed CSS and offers light, dark and
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

## Icons

Icons use a 24 × 24 viewBox, a 2 px stroke with butt caps (sharp style) and
`currentColor`. Only `svg`,
`path`, `circle`, `rect`, `line`, `polyline` and `polygon` are accepted.
`pnpm check` validates every SVG in `src/icon/svg/`.

For Keyline icons, copy only the used sharp SVG from the reference version
`@keyline-icons/react` 1.5.0, keeping its kebab-case name and the MIT licence
in `src/icon/svg/LICENSE`. No npm dependency is required.

For a custom icon, draw in Inkscape on the same grid with matching stroke and
endpoints. Apply transformations before exporting. Save an SVG, then run
`pnpm icons:normalize path/to/icon.svg`. This rewrites the file only after
validation: metadata, editor namespaces and identifiers are removed, colors
become `currentColor`, and shared stroke attributes move to the root. Filled
and unstroked details are preserved. Unsupported styles or geometry require
manual editing; transforms must be applied in Inkscape. Add the normalized SVG
to `src/icon/svg/` and run `pnpm check` and `pnpm test`.
