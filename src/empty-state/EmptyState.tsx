import type { ReactNode } from "react";
import { Heading } from "../heading/Heading.js";
import { Text } from "../text/Text.js";
/** Explain an empty collection and optionally offer a next action. */
export interface EmptyStateProps {
  title: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Plain description text; it renders inside a paragraph. */
  children: string;
  action?: ReactNode;
}
/** An empty collection message with a semantic heading and muted description. */
export function EmptyState({
  title,
  level = 3,
  children,
  action,
}: EmptyStateProps) {
  return (
    <div className="bd-empty-state">
      <Heading level={level} size="ui">
        {title}
      </Heading>
      <Text tone="muted">{children}</Text>
      {action != null && <div className="bd-empty-state__action">{action}</div>}
    </div>
  );
}
