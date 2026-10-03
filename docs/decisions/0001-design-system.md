# 0001 — A standalone React design system

Status: accepted decisions. Foundations and Button are implemented; visual
reference approval and publication remain separate decisions.

## Context and decision

Several products share a visual identity and generic components.
`bench-design` has its own repository and initially distributes one package
without product business logic.

React and TypeScript form the component layer. React Aria Components provides
accessible interactions; the design system encapsulates its API and remains
responsible for accessible names, focus, styles and verification. Consumers use
the design system exports. Storybook shows real components and their states,
without a parallel implementation.

CSS foundations and tokens are independent of React: primitive tokens, semantic
tokens, then component tokens only when needed. Compositions remain generic.
Business rules, permissions and content belong to products. DDD, Tell Don't Ask
and the Law of Demeter guide relevant boundaries.

## Distribution and maintenance

The package uses ESM with TypeScript declarations; CSS and tokens are imported
explicitly. React and React DOM are peers; React Aria Components is a runtime
dependency. Fonts are distributed locally with their licenses. An isolated
consumer installed from `pnpm pack` must verify exports, types, CSS and assets.

Node uses the latest LTS available at bootstrap; other tools use the latest
compatible stable versions. Selected versions are exact and the lockfile is
tracked. Test images are pinned by digest.

The initial version line is 0.1.x. Before 1.0, incompatible changes increment
MINOR and compatible fixes increment PATCH. From 1.0 onward, standard SemVer
applies. The API includes exports, props, tokens and documented behavior.
Removals are announced with a replacement and removal version; migrations are
documented. The registry, initial publication, documentation hosting and design
system license remain undecided.

## Verification

UI tests use render/interact/assert. Given/When/Then applies to domain behavior.
Accessibility tests combine automated checks and keyboard navigation. Canonical
captures use a pinned Linux environment. New or changed visual references require
human approval; automatic replacement of expected images is prohibited.

Product commands and CI work from a standalone clone. This document records
lasting maintenance decisions; execution planning and evidence do not belong in
the distributed package. `pnpm verify` runs all three browsers before every push;
PR CI runs Chromium, including captures in its browser job.

## Storybook and delivery

A foundation or component is delivered only when its stories cover variants
and static states in light and dark themes. Without stories, the slice remains
open and review is refused. Each story is a usage example; interaction states
are exercised by driving those examples, without test-only stories. Behavior
observable without a browser belongs in unit tests.

Component stories are adjacent (`src/**/*.stories.tsx`); `tests/fixtures/`
remains a technical harness. Foundation pages document colors, typography,
spacing, geometry and themes. Storybook loads distributed CSS and offers light,
dark and system themes; its commands build the package.

`pnpm check` checks exports from `src/index.ts`, follows barrels and aliases,
and requires adjacent stories for exported PascalCase functions, classes and
wrappers, as well as default exports. Zero components produces an explicit
report. Presence checks do not prove variant or state coverage: stories provide
the basis for browser tests and visual captures.
