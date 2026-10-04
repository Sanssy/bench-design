import type { CSSProperties, ReactNode } from "react";
import type { SpaceToken } from "../space-tokens.js";
/** Approved structural layout options; visual overrides are excluded. */
export interface GridProps {
  children: ReactNode;
  gap?: SpaceToken;
  as?: "div" | "section" | "ul" | "ol";
  columns: 2 | 3 | 4;
}
/** Arrange content in equal columns, collapsing below 640px. */
export function Grid({ columns, gap, as: Tag = "div", children }: GridProps) {
  return (
    <Tag
      className="bd-grid"
      style={
        {
          "--bd-gap": gap === undefined ? undefined : `var(--bd-space-${gap})`,
          "--bd-columns": columns,
        } as CSSProperties
      }
    >
      {children}
    </Tag>
  );
}
