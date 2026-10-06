import type { CSSProperties, ReactNode } from "react";
import type { SpaceToken } from "../space-tokens.js";
/** Approved structural layout options; visual overrides are excluded. */
export interface StackProps {
  children: ReactNode;
  gap?: SpaceToken;
  as?: "div" | "section" | "ul" | "ol";
  /** Reflow a vertical action group into a full-width wrapping row below 640px. */
  mobileDirection?: "row";
  align?: "start" | "center" | "end" | "stretch";
}
/** Arrange content vertically with spacing tokens. */
export function Stack({
  gap,
  align = "stretch",
  mobileDirection,
  as: Tag = "div",
  children,
}: StackProps) {
  return (
    <Tag
      className="bd-stack"
      data-mobile-direction={mobileDirection}
      style={
        {
          "--bd-gap": gap === undefined ? undefined : `var(--bd-space-${gap})`,
          "--bd-align": align,
        } as CSSProperties
      }
    >
      {children}
    </Tag>
  );
}
