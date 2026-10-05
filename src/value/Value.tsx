import { useBenchMessages } from "../bench-provider/BenchProvider.js";
/** A numeric display with an accessible name, optional total, sign and unit. */
export interface ValueProps {
  /** Empty strings use a fallback accessible name when no label is supplied. */
  value: string | number;
  total?: string | number;
  unit?: string;
  /** Applies to a positive magnitude; do not include a sign in value. */
  sign?: "+" | "-" | "±";
  mode?: "hero" | "indexed" | "dense" | "plain";
  /** Overrides the generated localized accessible name. */
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
  const { messages: m, number } = useBenchMessages();
  const name = `${sign ?? ""}${total !== undefined ? m.valueTotal(typeof value === "number" ? number(value) : value, typeof total === "number" ? number(total) : total) : typeof value === "number" ? number(value) : value}${unit ? ` ${unit}` : ""}`;
  return (
    <span
      className="bd-value"
      data-mode={mode}
      role="img"
      aria-label={label?.trim() ? label : name.trim() || m.noValue}
    >
      {sign && <span className="bd-value__sign">{sign}</span>}
      <span className="bd-value__number">
        {typeof value === "number" ? number(value) : value}
      </span>
      {total !== undefined && (
        <span className="bd-value__total">
          <span className="bd-value__operator">/</span>
          <span>{typeof total === "number" ? number(total) : total}</span>
        </span>
      )}
      {unit && <span className="bd-value__unit">{unit}</span>}
    </span>
  );
}
