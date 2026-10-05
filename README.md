# bench-design

A React design system combining editorial typography, clear structure and
accessible interactions. Shared visual foundations stay in CSS and tokens;
React Aria is encapsulated behind a small component API.

## Current status

V0 as of 2026-10-05: semantic tokens, local fonts, light/dark/system themes,
foundation documentation and the components listed in [components.json](components.json).
The current families cover typography, layout, surfaces, data and status,
forms and filters, navigation, overlays, collections, import and feedback.
The manifest is the source of truth for exports and props.
The [public repository](https://github.com/Sanssy/bench-design) is licensed under MIT.
The package is distributed as a release tarball and is not published to npm. Visual
references require explicit human approval; implementation is not approval.

## Installation

Use Node 24.21.0 and pnpm 12.8.1 for development. The package requires Node
>=24.21.0 and React/React DOM ^19.3.0 as peer dependencies.
Download `bench-design-0.1.0.tgz` from [Release v0.1.0](https://github.com/Sanssy/bench-design/releases/tag/v0.1.0), then install it in your React application:

```sh
pnpm add ./bench-design-0.1.0.tgz
```

To build a tarball from source, run `pnpm install --frozen-lockfile`,
`pnpm build` and `pnpm pack` in this checkout.

## Minimal usage

```tsx
import "bench-design/styles.css";
import { useState } from "react";
import { Button } from "bench-design";

export function SaveAction() {
  const [saved, setSaved] = useState(false);
  return <>
    <Button variant="primary" onPress={() => setSaved(true)}>Save</Button>
    <p role="status">{saved ? "Changes saved" : "No changes saved yet"}</p>
    {saved && <Button onPress={() => setSaved(false)}>Reset</Button>}
  </>;
}
```

Import styles once. For tokens alone, use `bench-design/tokens.css`.
Serve the CSS and its relative `fonts/` assets together, including font licenses.
Button defaults to the secondary variant and `type="button"`; use `isDisabled`
for unavailable actions and native `type="submit"` or `type="reset"` for forms.
Prefer a visible label for the accessible name.

Copy the distributed `bench-design/theme-init.js` to your application's public
assets and load it as a classic blocking script before CSS and React:

```html
<head>
  <script src="/theme-init.js"></script>
  <!-- Application styles follow. -->
</head>
```

Do not add `async`, `defer` or `type="module"`. The initializer reads
`localStorage["bench-design-theme"]`: `light` and `dark` set `data-theme` on
`<html>`; system, missing/invalid values or blocked storage leave it absent.
An existing server attribute wins. Without the attribute, CSS follows the OS
color scheme. To change themes later, set the attribute or remove it for system,
and persist the choice when storage is available. The React entry has no theme
side effects.

## Documentation

Visit the [published site](https://sanssy.github.io/bench-design/) and
[Storybook](https://sanssy.github.io/bench-design/storybook/) for getting
started, principles, themes, foundations and component examples.
For local development, run `pnpm storybook` and open http://localhost:6006/.
After `pnpm build-storybook`, the generated site also provides
`llms.txt`. After `pnpm build`, the package provides
`AGENTS.md` for AI integration. These generated files are not
available in a fresh checkout until built.
The [component manifest](components.json) describes the public API;
[tokens.json](src/tokens.json) is the DTCG token source and is also distributed
as `bench-design/tokens.json`.

## Development

```sh
pnpm install --frozen-lockfile
pnpm verify
pnpm storybook
```

Run `pnpm verify` before every push. It checks formatting, types, boundaries,
tests, builds, visual values, package consumption and all three browsers.
See [CONTRIBUTING.md](CONTRIBUTING.md) for CI, captures and approval, and the
[design system decision](docs/decisions/0001-design-system.md) for boundaries
and versioning.

## License

bench-design is released under the [MIT License](LICENSE). Bundled fonts retain
their own OFL licenses in the distributed `fonts/` directory.
