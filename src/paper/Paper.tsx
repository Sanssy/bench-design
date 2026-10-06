import type { ReactNode } from "react";
/** Content of a generic document sheet. */
export interface PaperProps {
  children: ReactNode;
  /** compact suits thumbnails, such as card previews: smaller inset, words kept whole. */
  size?: "default" | "compact";
}
/** A raised, bordered document sheet constrained to the reading measure. */
export function Paper({ children, size = "default" }: PaperProps) {
  return (
    <div className="bd-paper" data-size={size}>
      {children}
    </div>
  );
}
