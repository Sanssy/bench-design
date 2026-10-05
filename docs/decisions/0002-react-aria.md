# 0002 — Retain React Aria behind the design system boundary

Status: Accepted

## Decision

Retain React Aria as the interaction and accessibility foundation. The exact
`react-aria-components` version is pinned in `package.json`. The design system
wraps its primitives rather than exposing their entire upstream API.

React Aria owns keyboard and pointer interaction, focus movement and restoration,
accessible roles and relationships, selection, overlay behavior, and the state
attributes consumed by CSS. The [state attribute contract](../state-attributes.md)
distinguishes upstream attributes from attributes emitted by our wrappers,
including names used by both.

Tokens, theme values, CSS presentation and the public component API belong to the
design system. React Aria state is an input to our CSS, not a source of visual
values. Public props and exports are intentionally defined by our components;
an upstream feature or API change does not automatically become public here.

## Replacement cost

A replacement must reproduce the observable interaction and accessibility
contracts: keyboard navigation, selection, disabled and validation behavior,
focus containment/restoration, overlays, drag and drop, locale handling and
state emission. It would require adapting wrappers and state selectors,
revalidating public API compatibility, and rerunning unit, accessibility,
three-browser and visual checks. Keeping tokens and presentation separate
reduces visual migration work, but does not remove this behavioral cost.

## Upgrade policy

Upgrade React Aria in a dedicated PR, separate from feature and visual changes.
Review upstream changes and the state attribute contract, preserve the DS public
API or explicitly handle its versioning, and run the complete verification
suite. Verify Chromium, Firefox and WebKit, including accessibility and keyboard
behavior; produce and inspect light/dark screenshots for the delivered stories.
A passing type check alone is insufficient. Do not replace visual baselines to
hide a regression; baseline changes require explicit approval.

## Application guidance

Prefer importing accessible components and the provider from this design system.
Avoid importing React Aria directly for the same component tree. If direct use
is necessary, align `react-aria-components` with the exact version pinned by the
design system and verify provider/context integration and interaction behavior.
Do not treat upstream props or internal `data-*` attributes as the DS public API.
