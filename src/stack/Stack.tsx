import type { CSSProperties, ReactNode } from "react";
/** Approved structural layout options; visual overrides are excluded. */
export interface StackProps {
  children: ReactNode;
  gap?: 4 | 8 | 12 | 16 | 24 | 32 | 48 | 64 | 96;
  as?: "div" | "section" | "ul" | "ol";
  align?: "start" | "center" | "end" | "stretch";
}
/** Arrange content vertically with spacing tokens. */
export function Stack({
  gap,
  align = "stretch",
  as: Tag = "div",
  children,
}: StackProps) {
  return (
    <Tag
      className="bd-stack"
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
