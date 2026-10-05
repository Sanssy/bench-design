import type { ReactNode } from "react";
/** A caller-ordered sequence of related items. */
export interface ConnectedListProps {
  /** Accessible name of the ordered list. */
  label: string;
  items: {
    /** Stable unique identifier. */
    id: string;
    title: ReactNode;
    meta?: ReactNode;
  }[];
}
/** Show related items without calculating their relationships. */
export function ConnectedList({ label, items }: ConnectedListProps) {
  return (
    // biome-ignore lint/a11y/noRedundantRoles: Preserve list semantics in Safari with list-style: none.
    <ol className="bd-connected-list" aria-label={label} role="list">
      {items.map(({ id, title, meta }) => (
        <li key={id} className="bd-connected-list-item">
          <div className="bd-connected-list-title">{title}</div>
          {meta !== undefined && (
            <div className="bd-connected-list-meta">{meta}</div>
          )}
        </li>
      ))}
    </ol>
  );
}
