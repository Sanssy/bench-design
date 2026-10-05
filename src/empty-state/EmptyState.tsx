import type { ReactNode } from "react";
import { Heading } from "../heading/Heading.js";
import type { IconName } from "../icon/icons.js";
import { IconTile } from "../icon-tile/IconTile.js";
import { Text } from "../text/Text.js";
/** Explain an empty collection and optionally offer a next action. */
export interface EmptyStateProps {
  title: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Plain description text; it renders inside a paragraph. */
  children: string;
  action?: ReactNode;
  /** Decorative catalogue icon on a neutral tile. */
  icon?: IconName;
  /** Editorial heading and solid border; defaults to default. */
  variant?: "default" | "editorial";
}
/** An empty collection message with a semantic heading and muted description. */
export function EmptyState({
  title,
  level = 3,
  children,
  action,
  icon,
  variant = "default",
}: EmptyStateProps) {
  return (
    <div className="bd-empty-state" data-variant={variant}>
      {icon && <IconTile icon={icon} tone="neutral" />}
      <Heading level={level} size={variant === "editorial" ? "lead" : "ui"}>
        {title}
      </Heading>
      <Text tone="muted">{children}</Text>
      {action != null && <div className="bd-empty-state__action">{action}</div>}
    </div>
  );
}
