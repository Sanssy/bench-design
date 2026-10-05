import type { CSSProperties, ReactNode } from "react";
import type { SpaceToken } from "../space-tokens.js";
/** A static content card; interaction belongs to its children. */
export interface CardProps {
  children: ReactNode;
  /** Edge-to-edge preview above the content. */
  media?: ReactNode;
  /** Raised by default; outlined uses the border token without a shadow. */
  variant?: "raised" | "outlined";
  /** Content padding from the spacing scale; defaults to 12. */
  padding?: SpaceToken;
  as?: "article" | "section" | "div";
}
/** Group related content inside a raised, bordered article by default. */
export function Card({
  children,
  media,
  variant = "raised",
  padding,
  as: Tag = "article",
}: CardProps) {
  return (
    <Tag
      className={media != null ? "bd-card bd-card-with-media" : "bd-card"}
      data-variant={variant}
      style={
        {
          "--bd-card-padding":
            padding === undefined ? undefined : `var(--bd-space-${padding})`,
        } as CSSProperties
      }
    >
      {media != null ? (
        <>
          <div className="bd-card-media">{media}</div>
          <div className="bd-card-content">{children}</div>
        </>
      ) : (
        children
      )}
    </Tag>
  );
}
