import type { ReactNode } from "react";
import { Heading } from "../heading/Heading.js";

/** Content and optional second-level heading of a workspace panel. */
export interface SidePanelProps {
  /** Optional visible heading; the parent provides the panel's accessible name. */
  title?: string;
  /** Panel content supplied by the consuming application. */
  children: ReactNode;
}
/** A padded side panel using the shared panel width and workspace scroll rules. */
export function SidePanel({ title, children }: SidePanelProps) {
  return (
    <div className="bd-side-panel">
      {title !== undefined && (
        <Heading level={2} size="heading">
          {title}
        </Heading>
      )}
      {children}
    </div>
  );
}
