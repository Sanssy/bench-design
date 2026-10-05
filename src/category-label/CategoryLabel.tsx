import { Icon } from "../icon/Icon.js";
import type { IconName } from "../icon/icons.js";

/** A category marker accompanied by a visible text label. */
export interface CategoryLabelProps {
  /** Category hue; the consuming product assigns its meaning. */
  category: "teal" | "magenta" | "orange" | "violet" | "green" | "blue";
  /** Visible label; color must never carry the meaning alone. */
  children: string;
  /** Decorative icon replacing the category square. */
  icon?: IconName;
  /** Marker keeps the outlined presentation; plain removes its surface. */
  variant?: "marker" | "plain";
}
/** Noninteractive category text with a decorative color square. */
export function CategoryLabel({
  category,
  children,
  icon,
  variant = "marker",
}: CategoryLabelProps) {
  return (
    <span
      className="bd-category-label"
      data-category={category}
      data-variant={variant}
    >
      {icon ? (
        <Icon name={icon} size={16} />
      ) : (
        <span className="bd-category-label__marker" aria-hidden="true" />
      )}
      <span>{children}</span>
    </span>
  );
}
