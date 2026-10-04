/** A short, noninteractive text marker. */
export interface BadgeProps {
  children: string | number;
  /** Semantic tone; include a meaningful label. */
  tone?: "neutral" | "success" | "warning" | "danger";
  variant?: "outline" | "solid";
}
/** Label a count or format with monospaced text, with a meaningful label. */
export function Badge({
  children,
  variant = "outline",
  tone = "neutral",
}: BadgeProps) {
  return (
    <span className="bd-badge" data-variant={variant} data-tone={tone}>
      {children}
    </span>
  );
}
