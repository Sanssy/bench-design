/** A short, noninteractive text marker. */
export interface BadgeProps {
  children: string | number;
  variant?: "outline" | "solid";
}
/** Label a count or format with monospaced text, without status semantics. */
export function Badge({ children, variant = "outline" }: BadgeProps) {
  return (
    <span className="bd-badge" data-variant={variant}>
      {children}
    </span>
  );
}
