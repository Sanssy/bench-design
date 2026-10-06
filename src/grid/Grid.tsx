import type { CSSProperties, ReactNode } from "react";
import type { SpaceToken } from "../space-tokens.js";
/** Approved structural layout options; visual overrides are excluded. */
export interface GridProps {
  children: ReactNode;
  gap?: SpaceToken;
  as?: "div" | "section" | "ul" | "ol";
  /** Named track proportions; overrides columns when asymmetric. */
  template?: "equal" | "hero" | "sidebar" | "marker";
  columns: 2 | 3 | 4;
}
/** Arrange content in equal or named columns, collapsing below 640px. */
export function Grid({
  columns,
  template,
  gap,
  as: Tag = "div",
  children,
}: GridProps) {
  return (
    <Tag
      className="bd-grid"
      data-template={template}
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
