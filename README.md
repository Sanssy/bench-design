# bench-design

Shared React Design System for Trame, Bibliothèque + Atelier and Decision Engine.
React Aria remains encapsulated inside the package.

B1 establishes the executable toolchain. The public ESM entry and declarations
are deliberately empty: no design system components are delivered yet. B2 adds the foundations below. The Storybook technical bootstrap harness exercises tooling;
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

B2 foundations: import
`bench-design/styles.css` once, or `bench-design/tokens.css` for tokens alone.
Component CSS uses semantic roles (`--bd-surface`, `--bd-text`, `--bd-border`,
`--bd-border-strong`, `--bd-accent`, `--bd-on-accent`, `--bd-focus`, etc.).
Every light accent surface requires a strong border; the dark decorative divider
is unavailable until ratified. Breakpoint tokens are documentation values;
CSS custom properties cannot be substituted in media query conditions.

Serve `bench-design/theme-init.js` from your own origin as a classic blocking
script in `<head>`, before styles and React rendering (no async/defer). It reads
`localStorage["bench-design-theme"]`: `light`/`dark` set `data-theme` on `<html>`;
`system`, missing/invalid entries or blocked storage leave it absent. An existing
server attribute wins. For later changes, set `data-theme="light|dark"` explicitly,
or remove it for system mode, and persist the same choice if storage is available.
Without the attribute CSS follows `prefers-color-scheme`, including OS changes.
The ESM entry has no theme side effects. The initializer also tolerates SSR import.

`styles.css` loads local Bench Fraunces (100–900), Bench Manrope (200–800)
and Bench Plex (400), with `font-display: swap`. Font roles are
`--bd-font-editorial` (serif fallback), `--bd-font-ui` (sans-serif),
`--bd-font-metadata` and `--bd-font-mono` (monospace). Serve the CSS and its
relative `fonts/` assets together; no CDN or local installed font is required.
The distributed `fonts/` directory includes original OFL licenses and
`provenance.json` with source URLs and SHA-256 hashes. Fonts were copied
unchanged from the approved trame-core reference. Await `document.fonts.ready`
before captures.

The visual-value check (`node scripts/check-visual-values.mjs`, after build)
examines declarations in distributed `dist/**/*.css` using a CSS parser.
Only `dist/tokens.css` and `dist/fonts.css` are exempt definition files;
other exceptions require an exact file, selector, property, value and reason.
The check rejects raw colors and lengths, including variable fallbacks.
Unitless numbers such as `line-height: 1.5` and `font-weight: 500`, media query
conditions and unparsed `Raw` values are outside its current coverage.
Percentages, `auto`, `currentColor` and `transparent` are accepted.
Unitless zero is accepted for absent spacing or borders without a token.
