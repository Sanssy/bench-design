import {
  type ComponentProps,
  type ReactNode,
  useId,
  useState,
  useSyncExternalStore,
} from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";

const wideQuery = "(min-width: 960px)";
function subscribeWidth(listener: () => void) {
  const query = window.matchMedia(wideQuery);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}
function isWide() {
  return window.matchMedia(wideQuery).matches;
}

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
  const wide = useSyncExternalStore(subscribeWidth, isWide, () => false);
  const [selected, setSelected] = useState("start");
  const panels = [
    ...(start ? [{ key: "start", panel: start }] : []),
    ...(end ? [{ key: "end", panel: end }] : []),
  ];
  const active =
    selected === "start" && start ? "start" : end ? "end" : "start";
  return (
    <div className="bd-app-shell" data-active-panel={active}>
      <header className="bd-app-shell-header">{header}</header>
      <Tabs
        className="bd-app-shell-workspace"
        selectedKey={active}
        onSelectionChange={(key) => {
          if (key === "start" || key === "end") setSelected(key);
        }}
      >
        {(start || end) && (
          <TabList
            className="bd-app-shell-selector bd-tab-list"
            aria-label={[start?.label, end?.label].filter(Boolean).join(" / ")}
          >
            {panels.map(({ key, panel }) => (
              <Tab
                key={key}
                className="bd-tab"
                id={key}
                render={(props) => (
                  <div
                    {...(props as ComponentProps<"div">)}
                    id={`${id}-${key}-tab`}
                    aria-controls={`${id}-${key}`}
                  />
                )}
              >
                {panel.label}
              </Tab>
            ))}
          </TabList>
        )}
        {/* Zones scroll on their own on wide screens: keyboard users must
            be able to focus them to scroll (WCAG 2.1.1). */}
        {/* biome-ignore lint/a11y/noNoninteractiveTabindex: the zone is a keyboard-scrollable region. */}
        <main className="bd-app-shell-main" tabIndex={0}>
          {children}
        </main>
        {panels.map(({ key, panel }) => (
          <TabPanel
            key={key}
            id={key}
            shouldForceMount
            className={`bd-app-shell-${key}`}
            render={(props) => (
              <div
                {...props}
                id={`${id}-${key}`}
                {...(wide
                  ? {
                      role: "complementary",
                      "aria-label": panel.label,
                      "aria-labelledby": undefined,
                    }
                  : {
                      role: "tabpanel",
                      "aria-label": undefined,
                      "aria-labelledby": `${id}-${key}-tab`,
                    })}
                inert={wide ? false : key !== active}
                // biome-ignore lint/a11y/noNoninteractiveTabindex: desktop regions and mobile tabpanels must support keyboard scrolling.
                tabIndex={0}
              />
            )}
          >
            {panel.content}
          </TabPanel>
        ))}
      </Tabs>
      {footer !== undefined && footer !== null && (
        <footer className="bd-app-shell-footer">{footer}</footer>
      )}
    </div>
  );
}
