import { type ReactNode, useId } from "react";
import { Heading } from "../heading/Heading.js";
/** Consumer-owned collection composition; no filtering or sorting is performed. */
export interface CollectionViewProps {
  /** Visible heading and accessible region name. */
  label: string;
  /** Heading level within the page outline; defaults to 2. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Optional total supplied by the consumer, including zero. */
  count?: number;
  /** Count appearance; defaults to plain. */
  countVariant?: "plain" | "outlined";
  /** Search, filters and view controls supplied by the consumer. */
  toolbar?: ReactNode;
  /** Keep the toolbar sticky within its scrolling ancestor; defaults to true. */
  stickyToolbar?: boolean;
  /** Consumer actions beside the title, outside the accessible region name. */
  actions?: ReactNode;
  /** Consumer-owned result summary and sorting controls. */
  footer?: ReactNode;
  /** Replace collection content with the empty state. */
  isEmpty?: boolean;
  /** Usually an EmptyState explaining that no results match. */
  emptyState?: ReactNode;
  /** Rendered collection; the consumer owns its data and state. */
  children: ReactNode;
}
/** A named collection region with an optionally sticky tools slot and a result footer. */
export function CollectionView({
  label,
  headingLevel = 2,
  count,
  countVariant = "plain",
  toolbar,
  stickyToolbar = true,
  actions,
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
          <Heading level={headingLevel} size="heading">
            {label}
            {count !== undefined && (
              <>
                {" "}
                <span
                  className="bd-collection-view-count"
                  data-variant={countVariant}
                >
                  {count}
                </span>
              </>
            )}
          </Heading>
        </div>
        {actions != null && (
          <div className="bd-collection-view-actions">{actions}</div>
        )}
      </header>
      {toolbar != null && (
        <div className="bd-collection-view-toolbar" data-sticky={stickyToolbar}>
          {toolbar}
        </div>
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
