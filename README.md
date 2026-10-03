# bench-design

Shared React Design System for Trame, Bibliothèque + Atelier and Decision Engine.
React Aria supplies accessible control behavior; the DS owns its public API,
tokens, styles and generic composition. Storybook documents the real components.

Preparation stage: no component implementation or runnable toolchain yet.
The local private corpus carries the approved decisions, proposed Button pilot
and execution workflow. Repository CI must not depend on private local links.

## Repository decisions

The [foundation decision](docs/decisions/0001-design-system.md) records the stack,
boundaries, distribution and versioning. [Contributing](CONTRIBUTING.md) lists the
planned quality gates and their current availability. Both are readable in a fresh
clone; private plans and skills remain local.

## Local preparation

After installing the private ecosystem with `eco install`, open
`docs/design-system/PROJECT-CONTRACT.md` for the project decisions and
`docs/design-system/EXECUTOR-HANDOFF.md` for the delivery route. These paths are
local links excluded from product Git; a fresh clone does not include them.

The next milestone is the React/Storybook bootstrap with pinned dependencies
and executable checks, then the approved Button pilot.
