import type { ReactNode } from "react";
/** Semantic heading level is independent of its visual size. */
export interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  size?: "display" | "heading" | "lead" | "ui";
  children: ReactNode;
}
/** A native heading. Choose level for document structure and size for emphasis. */
export function Heading({ level, size, children }: HeadingProps) {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  const resolvedSize =
    size ??
    (["display", "heading", "lead", "ui", "ui", "ui"] as const)[level - 1];
  return (
    <Tag className="bd-heading" data-size={resolvedSize}>
      {children}
    </Tag>
  );
}
