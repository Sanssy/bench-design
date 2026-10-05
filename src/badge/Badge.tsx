import { Icon } from "../icon/Icon.js";
import type { IconName } from "../icon/icons.js";

/** A short, noninteractive text marker. */
export interface BadgeProps {
  children: string | number;
  /** Semantic tone; include a meaningful label. */
  tone?:
    | "neutral"
    | "success"
    | "warning"
    | "danger"
    | "teal"
    | "magenta"
    | "orange"
    | "violet"
    | "green"
    | "blue";
  /** Metadata is monospaced; tags use the interface font and subtle fills. */
  variant?: "outline" | "solid" | "meta" | "tag";
  /** Decorative catalogue icon; the visible label supplies meaning. */
  icon?: IconName;
}
/** Label a count or format with monospaced text, with a meaningful label. */
export function Badge({
  children,
  icon,
  variant = "outline",
  tone = "neutral",
}: BadgeProps) {
  return (
    <span className="bd-badge" data-variant={variant} data-tone={tone}>
      {icon && <Icon name={icon} size={16} />}
      <span>{children}</span>
    </span>
  );
}
