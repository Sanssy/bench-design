import type { ReactNode } from "react";
/** A named sequence of caller-ordered events. */
export interface TimelineProps {
  /** Accessible name of the ordered list. */
  label: string;
  items: {
    /** Stable unique identifier. */
    id: string;
    /** Visible date, period or step; never parsed or sorted. */
    marker: string;
    title: ReactNode;
    children?: ReactNode;
  }[];
}
/** A vertical ordered list with decorative rail and caller-owned rich content. */
export function Timeline({ label, items }: TimelineProps) {
  return (
    // biome-ignore lint/a11y/noRedundantRoles: Preserve list semantics in Safari with list-style: none.
    <ol className="bd-timeline" aria-label={label} role="list">
      {items.map(({ id, marker, title, children }) => (
        <li key={id} className="bd-timeline-item">
          <div className="bd-timeline-marker">{marker}</div>
          <div className="bd-timeline-title">{title}</div>
          {children !== undefined && (
            <div className="bd-timeline-content">{children}</div>
          )}
        </li>
      ))}
    </ol>
  );
}
