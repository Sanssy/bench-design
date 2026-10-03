# bench-design

Shared React Design System for Trame, Bibliothèque + Atelier and Decision Engine.
React Aria remains encapsulated inside the package.

B1 establishes the executable toolchain. The public ESM entry and declarations
are deliberately empty: no design system components, tokens, styles or fonts
are delivered yet. The Storybook technical bootstrap harness exercises tooling;
its tests do not establish accessibility of future design system components.

Use Node 24.21.0 and pnpm 12.8.1, then:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm build-storybook
pnpm test:package
pnpm storybook
```

Browser tests require the pinned Linux image. See [Contributing](CONTRIBUTING.md).
The [foundation decision](docs/decisions/0001-design-system.md) records boundaries
and versioning. CI and package distribution require no private ecosystem links.
