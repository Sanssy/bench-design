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
  headingLevel = 2,
  count,
  countVariant = "plain",
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
