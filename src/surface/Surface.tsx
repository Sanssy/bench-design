import type { CSSProperties, ReactNode } from "react";
/** A background block with spacing from the shared scale. */
export interface SurfaceProps {
  children: ReactNode;
  tone?: "raised" | "subtle";
  padding?: 4 | 8 | 12 | 16 | 24 | 32 | 48 | 64 | 96;
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
