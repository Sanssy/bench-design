import { globSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generate, lexer, parse, walk } from "css-tree";

const definitions = new Set(["dist/tokens.css", "dist/fonts.css"]);
export interface VisualException {
  file: string;
  selector: string;
  property: string;
  value: string;
  reason: string;
}
export const exceptions: VisualException[] = [
  {
    file: "dist/data.css",
    selector: "@media",
    property: "condition",
    value: "(width>=640px)",
    reason:
      "Timeline switches to its column layout from 640px; CSS variables cannot define media conditions.",
  },
  {
    file: "dist/navigation.css",
    selector: "@media",
    property: "condition",
    value: "(width>=640px)",
    reason:
      "Vertical tabs leave the mobile chip grid from 640px; CSS variables cannot define media conditions.",
  },
  {
    file: "dist/navigation.css",
    selector: "@media",
    property: "condition",
    value: "(width>=960px)",
    reason:
      "Vertical tab lists become sticky from the 960px wide breakpoint; CSS variables cannot define media conditions.",
  },
  {
    file: "dist/navigation.css",
    selector:
      '.bd-tabs[data-orientation="vertical"][data-sticky-list] .bd-tab-list',
    property: "max-block-size",
    value: "calc(100dvh - var(--bd-space-32))",
    reason:
      "A sticky tab list stays within the viewport height; the viewport unit has no token.",
  },
  {
    file: "dist/layout.css",
    selector: "@media",
    property: "condition",
    value: "(width>=640px)",
    reason:
      "AppHeader centres its navigation from 640px, below which navigation takes its own row; CSS variables cannot define media conditions.",
  },
  {
    file: "dist/surfaces.css",
    selector: "@media",
    property: "condition",
    value: "(width<640px)",
    reason:
      "L26 editorial DropZone compacts below 640px for touch layouts; CSS variables cannot define media conditions.",
  },
  {
    file: "dist/data.css",
    selector: "@media",
    property: "condition",
    value: "(width<640px)",
    reason:
      "L30 ConnectedList uses a vertical rail below 640px to keep related items readable; CSS variables cannot define media conditions.",
  },
  {
    file: "dist/overlays.css",
    selector: "@media",
    property: "condition",
    value: "(width<640px)",
    reason:
      "Ratified Dialog end placement fills mobile viewports below 640px; CSS variables cannot define media conditions.",
  },
  {
    file: "dist/forms.css",
    selector: "@media",
    property: "condition",
    value: "(width<640px)",
    reason: "Ratified radio cards use one column below 640px.",
  },
  {
    file: "dist/navigation.css",
    selector: "@media",
    property: "condition",
    value: "(width<640px)",
    reason:
      "Horizontal tab lists scroll below the 640px breakpoint (audit 073).",
  },
  {
    file: "dist/layout.css",
    selector: "@media",
    property: "condition",
    value: "(width>=960px)",
    reason:
      "Ratified AppShell wide breakpoint; CSS variables cannot define media conditions.",
  },
  {
    file: "dist/layout.css",
    selector: "@media",
    property: "condition",
    value: "(width<960px)",
    reason: "Ratified AppShell mobile selector below the wide breakpoint.",
  },
  {
    file: "dist/layout.css",
    selector: "@media",
    property: "condition",
    value: "(width>=960px) and (height>=560px)",
    reason:
      "Ratified AppShell bounded workspace only at wide and sufficiently tall viewports.",
  },
  {
    file: "dist/layout.css",
    selector: ".bd-app-shell-start,.bd-app-shell-end",
    property: "min-inline-size",
    value: "240px",
    reason: "Ratified minimum width of AppShell side panels.",
  },
  {
    file: "dist/layout.css",
    selector: ".bd-side-panel",
    property: "min-inline-size",
    value: "240px",
    reason: "Ratified minimum SidePanel width.",
  },
  {
    file: "dist/layout.css",
    selector: ".bd-app-shell",
    property: "block-size",
    value: "100dvh",
    reason:
      "Ratified viewport height for bounded AppShell at wide and tall viewports.",
  },
  {
    file: "dist/overlays.css",
    selector: ".bd-modal",
    property: "max-block-size",
    value: "88dvh",
    reason:
      "Ratified Dialog height is bounded at 88% of the viewport, including mobile browser chrome.",
  },
  {
    file: "dist/overlays.css",
    selector: ".bd-popover",
    property: "max-inline-size",
    value: "min(var(--bd-measure),calc(100vw - var(--bd-space-32)))",
    reason:
      "An anchored popover must fit the viewport; its containing block is controlled by React Aria.",
  },
  {
    file: "dist/data.css",
    selector: "@media",
    property: "condition",
    value: "(width<640px)",
    reason:
      "Ratified MetaList stacks below 640px; CSS variables cannot define media query thresholds.",
  },
  {
    file: "dist/layout.css",
    selector: "@media",
    property: "condition",
    value: "(width<640px)",
    reason:
      "Ratified Grid collapses and AppHeader places navigation on a second row below 640px; CSS variables cannot define media query thresholds.",
  },
  {
    file: "dist/link.css",
    selector: ".bd-link",
    property: "text-underline-offset",
    value: "0.2em",
    reason:
      "Ratified Link underline offset is relative to the surrounding font size.",
  },
];

export function visualViolations(
  source: string,
  file: string,
  registry = exceptions,
) {
  if (definitions.has(file)) return [];
  const errors: string[] = [];
  const tree = parse(source, { positions: true, parseCustomProperty: true });
  walk(tree, {
    visit: "Atrule",
    enter(rule) {
      if (rule.name !== "media" || !rule.prelude) return;
      const value = generate(rule.prelude);
      let rawLength = false;
      walk(rule.prelude, (node) => {
        if (
          node.type === "Dimension" &&
          lexer.matchType("length", node).matched
        )
          rawLength = true;
      });
      if (
        rawLength &&
        !registry.some(
          (entry) =>
            entry.file === file &&
            entry.selector === "@media" &&
            entry.property === "condition" &&
            entry.value === value &&
            entry.reason.trim(),
        )
      )
        errors.push(
          `${file}:${rule.loc?.start.line}: @media ${value} requires an explicit breakpoint exception`,
        );
    },
  });
  walk(tree, {
    visit: "Declaration",
    enter(declaration) {
      const value = generate(declaration.value);
      const selector = this.rule ? generate(this.rule.prelude) : "";
      if (
        registry.some(
          (entry) =>
            entry.file === file &&
            entry.selector === selector &&
            entry.property === declaration.property &&
            entry.value === value &&
            entry.reason?.trim(),
        )
      )
        return;
      let forbidden = false;
      walk(declaration.value, (node) => {
        if (
          ["Dimension", "Number"].includes(node.type) &&
          lexer.matchType("length", node).matched &&
          !(node.type === "Number" && Number(node.value) === 0)
        )
          forbidden = true;
        if (
          ["Hash", "Identifier", "Function"].includes(node.type) &&
          lexer.matchType("color", node).matched &&
          !["currentcolor", "transparent"].includes(
            node.name?.toLowerCase() ?? "",
          )
        )
          forbidden = true;
      });
      if (forbidden) {
        const location = declaration.loc;
        if (!location) throw new Error("Declaration source location missing");
        errors.push(
          `${file}:${location.start.line}: ${selector} ${declaration.property}: ${value} requires a token`,
        );
      }
    },
  });
  return errors;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const files = globSync("dist/**/*.css");
  if (!files.length)
    throw new Error("No distributed CSS to check; run build first");
  const errors = files.flatMap((file) =>
    visualViolations(readFileSync(file, "utf8"), file),
  );
  for (const error of errors) console.error(error);
  if (errors.length) process.exitCode = 1;
  else
    console.log(`Distributed visual values PASS (${files.length} CSS files)`);
}
