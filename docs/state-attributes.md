# CSS state attribute contract

This is the authoritative list of `data-*` attribute selectors used by
`public/*.css`. It is a maintenance boundary, not an additional component API.
Use component props to control state; applications must not manufacture these
attributes to simulate interaction. See [React Aria decision](decisions/0002-react-aria.md).

## React Aria attributes

React Aria emits these attributes on the primitives wrapped by the design system.
Boolean state selectors test presence, not a particular string value.

| Attribute | Meaning / current consumers |
| --- | --- |
| `data-disabled` | Disabled controls and drop zones; also emitted by DS field wrappers below. |
| `data-dragging` | Collection item being dragged. |
| `data-drop-target` | Active drop zone or reorder indicator. |
| `data-empty` | Empty search field. |
| `data-entering` | Overlay entrance transition. |
| `data-expanded` | Expanded tree item or disclosure. |
| `data-focus-visible` | Keyboard-visible focus on controls, collections and overlays. |
| `data-focused` | Focused input or collection option. |
| `data-hovered` | Hovered interactive control or option. |
| `data-invalid` | Invalid field/control; also emitted by DS field wrappers below. |
| `data-layout` | GridList layout (`grid` selector). |
| `data-orientation` | Tabs axis (`vertical` selector). |
| `data-placeholder` | Select value displaying its placeholder. |
| `data-pending` | Button activity; React Aria blocks activation and retains focus. |
| `data-pressed` | Pressed button or number step control. |
| `data-selected` | Selected choice, tab, toggle or collection item; also emitted by FilterMenu below. |

## Design system attributes

These are set explicitly by DS components. Shared names retain the same state
meaning; ownership depends on the element, not just the attribute name.

| Attribute | Meaning / current producer |
| --- | --- |
| `data-active-panel` | AppShell active mobile panel (`start`, `end`). |
| `data-align` | Table cell alignment (`end` selector). |
| `data-category` | CategoryLabel category color. |
| `data-direction` | Table sort indicator direction (`descending` selector). |
| `data-disabled` | SegmentedControl and ColorSwatchPicker field wrapper state. |
| `data-invalid` | SegmentedControl and ColorSwatchPicker field wrapper validation state. |
| `data-mode` | Value formatting (`plain`, `dense`, `indexed`). |
| `data-rejected` | DropZone has rejected files. |
| `data-selected` | FilterMenu trigger has applied selections. |
| `data-size` | Heading/Text typography role and Avatar size. |
| `data-sticky` | Table frame enables a sticky header. |
| `data-tone` | Surface, Badge, Status, Notice, Text and Toast semantic tone. |
| `data-variant` | Button/IconButton/ToggleButton, Badge, Text and RadioGroup presentation; GridList selection treatment. |

## Maintenance

`pnpm check` parses every `public/*.css` file and fails on any attribute selector
missing from the tables above. `pnpm test` also exercises the checker against
unknown, nested and escaped selectors. Comments, strings and class names are
not attribute selectors. The check proves name coverage, not runtime emission
or valid values: interaction tests remain necessary.

When adding a selector, record its owner and meaning here in the same PR.
Changing a React Aria state requires checking the wrapper's behavior and tests;
adding a name to this list alone cannot establish compatibility.
