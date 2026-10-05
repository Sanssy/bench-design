import { type ReactNode, useId } from "react";
import { Heading } from "../heading/Heading.js";
/** Consumer-owned collection composition; no filtering or sorting is performed. */
export interface CollectionViewProps {
  /** Visible heading and accessible region name. */
  label: string;
  /** Optional total supplied by the consumer, including zero. */
  count?: number;
  /** Search, filters and view controls supplied by the consumer. */
  toolbar?: ReactNode;
  /** Consumer-owned result summary and sorting controls. */
  footer?: ReactNode;
  /** Replace collection content with the empty state. */
  isEmpty?: boolean;
  /** Usually an EmptyState explaining that no results match. */
  emptyState?: ReactNode;
  /** Rendered collection; the consumer owns its data and state. */
  children: ReactNode;
}
/** A named collection region with a sticky tools slot and a result footer. */
export function CollectionView({
  label,
  count,
  toolbar,
  footer,
  isEmpty = false,
  emptyState,
  children,
}: CollectionViewProps) {
  const id = useId();
  return (
    <section className="bd-collection-view" aria-labelledby={id}>
      <header className="bd-collection-view-header">
        <div id={id}>
          <Heading level={2} size="heading">
            {label}
          </Heading>
        </div>
        {count !== undefined && (
          <span className="bd-collection-view-count">{count}</span>
        )}
      </header>
      {toolbar != null && (
        <div className="bd-collection-view-toolbar">{toolbar}</div>
      )}
      <div className="bd-collection-view-content">
        {isEmpty ? emptyState : children}
      </div>
      {footer != null && (
        <div className="bd-collection-view-footer">{footer}</div>
      )}
    </section>
  );
}
