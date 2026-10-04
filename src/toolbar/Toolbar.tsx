import type { ReactNode } from "react";
import { Toolbar as AriaToolbar } from "react-aria-components";

/** A named group of Button and IconButton actions. */
export interface ToolbarProps {
  /** Required accessible name of the toolbar. */
  label: string;
  /** Button and IconButton actions. */
  children: ReactNode;
}
/** A horizontal action group with React Aria arrow-key navigation. */
export function Toolbar({ label, children }: ToolbarProps) {
  return (
    <AriaToolbar className="bd-toolbar" aria-label={label}>
      {children}
    </AriaToolbar>
  );
}
