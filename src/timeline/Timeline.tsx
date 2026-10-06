import type { ReactNode } from "react";
import { Link } from "../link/Link.js";
/** A named sequence of caller-ordered events. */
export interface TimelineProps {
  /** Accessible name of the ordered list. */
  label: string;
  /** Stacked rail by default; ruled columns from 640px when requested. */
  layout?: "stacked" | "columns";
  items: {
    /** Stable unique identifier. */
    id: string;
    /** Visible date, period or step; never parsed or sorted. */
    marker: string;
    title: ReactNode;
    /** Optional navigation destination for the title. */
    href?: string;
    children?: ReactNode;
  }[];
}
/** A vertical ordered list with decorative rail and caller-owned rich content. */
export function Timeline({ label, items, layout = "stacked" }: TimelineProps) {
  return (
    <ol
      className="bd-timeline"
      aria-label={label}
      // biome-ignore lint/a11y/noRedundantRoles: Preserve list semantics in Safari with list-style: none.
      role="list"
      data-layout={layout}
    >
      {items.map(({ id, marker, title, href, children }) => (
        <li key={id} className="bd-timeline-item">
          <div className="bd-timeline-marker">{marker}</div>
          <div className="bd-timeline-title">
            {href === undefined ? (
              title
            ) : (
              <Link href={href} trailingIcon="arrow-up-right">
                {title}
              </Link>
            )}
          </div>
          {children !== undefined && (
            <div className="bd-timeline-content">{children}</div>
          )}
        </li>
      ))}
    </ol>
  );
}
