import type { ReactNode } from "react";
/** Content of a generic document sheet. */
export interface PaperProps {
  children: ReactNode;
}
/** A raised, bordered document sheet constrained to the reading measure. */
export function Paper({ children }: PaperProps) {
  return <div className="bd-paper">{children}</div>;
}
