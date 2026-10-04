import type { ReactNode } from "react";
/** A static content card; interaction belongs to its children. */
export interface CardProps {
  children: ReactNode;
  as?: "article" | "section" | "div";
}
/** Group related content inside a raised, bordered article by default. */
export function Card({ children, as: Tag = "article" }: CardProps) {
  return <Tag className="bd-card">{children}</Tag>;
}
