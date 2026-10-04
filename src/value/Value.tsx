/** A numeric display with an accessible name, optional total, sign and unit. */
export interface ValueProps {
  value: string | number;
  total?: string | number;
  unit?: string;
  sign?: "+" | "-" | "±";
  mode?: "hero" | "indexed" | "dense" | "plain";
  /** Overrides the generated English accessible name. */
  label?: string;
}
/** Displays a value as one named image; defaults to surrounding text size. */
export function Value({
  value,
  total,
  unit,
  sign,
  mode = "plain",
  label,
}: ValueProps) {
  const name = `${sign ?? ""}${value}${total !== undefined ? ` of ${total}` : ""}${unit ? ` ${unit}` : ""}`;
  return (
    <span
      className="bd-value"
      data-mode={mode}
      role="img"
      aria-label={label ?? name}
    >
      {sign && <span className="bd-value__sign">{sign}</span>}
      <span className="bd-value__number">{value}</span>
      {total !== undefined && (
        <span className="bd-value__total">
          <span className="bd-value__operator">/</span>
          <span>{total}</span>
        </span>
      )}
      {unit && <span className="bd-value__unit">{unit}</span>}
    </span>
  );
}
