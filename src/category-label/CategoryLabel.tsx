/** A category marker accompanied by a visible text label. */
export interface CategoryLabelProps {
  /** Category hue; the consuming product assigns its meaning. */
  category: "teal" | "magenta" | "orange" | "violet" | "green" | "blue";
  /** Visible label; color must never carry the meaning alone. */
  children: string;
}
/** Noninteractive category text with a decorative color square. */
export function CategoryLabel({ category, children }: CategoryLabelProps) {
  return (
    <span className="bd-category-label" data-category={category}>
      <span className="bd-category-label__marker" aria-hidden="true" />
      {children}
    </span>
  );
}
