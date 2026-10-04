import { type ReactNode, useId, useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "react-aria-components";

/** Application landmarks and optional named side panels. */
export interface AppShellProps {
  /** Content of the application header. */
  header: ReactNode;
  /** Optional start panel with its accessible name and selector label. */
  start?: { label: string; content: ReactNode };
  /** Primary application content. */
  children: ReactNode;
  /** Optional end panel with its accessible name and selector label. */
  end?: { label: string; content: ReactNode };
  /** Optional application footer. */
  footer?: ReactNode;
}
/** A viewport workspace on large screens and a natural document on small screens. */
export function AppShell({
  header,
  start,
  children,
  end,
  footer,
}: AppShellProps) {
  const id = useId();
  const [selected, setSelected] = useState("start");
  const active =
    selected === "start" && start ? "start" : end ? "end" : "start";
  return (
    <div className="bd-app-shell" data-active-panel={active}>
      <header className="bd-app-shell-header">{header}</header>
      <div className="bd-app-shell-workspace">
        {/* Zones scroll on their own on wide screens: keyboard users must
            be able to focus them to scroll (WCAG 2.1.1). */}
        {/* biome-ignore lint/a11y/noNoninteractiveTabindex: the zone is a keyboard-scrollable region. */}
        <main className="bd-app-shell-main" tabIndex={0}>
          {children}
        </main>
        {(start || end) && (
          <ToggleButtonGroup
            className="bd-app-shell-selector bd-tab-list"
            aria-label={[start?.label, end?.label].filter(Boolean).join(" / ")}
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[active]}
            onSelectionChange={(keys) => {
              const key = [...keys][0];
              if (key === "start" || key === "end") setSelected(key);
            }}
          >
            {start && (
              <ToggleButton
                className="bd-tab"
                id="start"
                aria-controls={`${id}-start`}
              >
                {start.label}
              </ToggleButton>
            )}
            {end && (
              <ToggleButton
                className="bd-tab"
                id="end"
                aria-controls={`${id}-end`}
              >
                {end.label}
              </ToggleButton>
            )}
          </ToggleButtonGroup>
        )}
        {start && (
          <aside
            id={`${id}-start`}
            className="bd-app-shell-start"
            aria-label={start.label}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: the zone is a keyboard-scrollable region.
            tabIndex={0}
          >
            {start.content}
          </aside>
        )}
        {end && (
          <aside
            id={`${id}-end`}
            className="bd-app-shell-end"
            aria-label={end.label}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: the zone is a keyboard-scrollable region.
            tabIndex={0}
          >
            {end.content}
          </aside>
        )}
      </div>
      {footer !== undefined && footer !== null && (
        <footer className="bd-app-shell-footer">{footer}</footer>
      )}
    </div>
  );
}
