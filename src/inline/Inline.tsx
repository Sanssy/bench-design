import type { CSSProperties, ReactNode } from "react";
import type { SpaceToken } from "../space-tokens.js";
/** Approved structural layout options; visual overrides are excluded. */
export interface InlineProps {
  children: ReactNode;
  gap?: SpaceToken;
  as?: "div" | "section" | "ul" | "ol";
  align?: "start" | "center" | "end" | "stretch";
  justify?:
    | "start"
    | "center"
    | "end"
    | "space-between"
    | "space-around"
    | "space-evenly";
}
/** Arrange content in a wrapping horizontal flow. */
export function Inline({
  gap,
  align,
  justify,
  as: Tag = "div",
  children,
}: InlineProps) {
  return (
    <Tag
      className="bd-inline"
      style={
        {
          "--bd-gap": gap === undefined ? undefined : `var(--bd-space-${gap})`,
          "--bd-align": align,
          "--bd-justify": justify,
        } as CSSProperties
      }
    >
      {children}
    </Tag>
  );
}
