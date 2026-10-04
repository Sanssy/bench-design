import type { CSSProperties, ReactNode } from "react";
import type { SpaceToken } from "../space-tokens.js";
/** A background block with spacing from the shared scale. */
export interface SurfaceProps {
  children: ReactNode;
  tone?: "raised" | "subtle";
  padding?: SpaceToken;
  as?: "div" | "section" | "article" | "aside";
}
/** Group content on a raised or subtle background without a border. */
export function Surface({
  children,
  tone = "raised",
  padding,
  as: Tag = "div",
}: SurfaceProps) {
  return (
    <Tag
      className="bd-surface"
      data-tone={tone}
      style={
        {
          "--bd-surface-padding":
            padding === undefined ? undefined : `var(--bd-space-${padding})`,
        } as CSSProperties
      }
    >
      {children}
    </Tag>
  );
}
