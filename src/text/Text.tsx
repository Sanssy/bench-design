import type { ReactNode } from "react";
/** Reading text, inline text and metadata with token-based typography. */
export interface TextProps {
  size?: "meta" | "ui" | "body" | "lead";
  tone?: "default" | "muted";
  variant?: "default" | "label" | "mono";
  as?: "p" | "span";
  children: ReactNode;
}
/** A paragraph or inline text. Label and mono variants always use meta size. */
export function Text({
  size = "ui",
  tone = "default",
  variant = "default",
  as: Tag = "p",
  children,
}: TextProps) {
  return (
    <Tag
      className="bd-text"
      data-size={size}
      data-tone={tone}
      data-variant={variant}
    >
      {children}
    </Tag>
  );
}
