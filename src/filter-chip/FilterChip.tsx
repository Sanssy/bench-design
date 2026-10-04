import { ToggleButton } from "react-aria-components";
/** An immediate, optionally controlled filter toggle. */
export interface FilterChipProps {
  /** Visible accessible label. */
  label: string;
  /** Controlled active state. */
  isSelected?: boolean;
  /** Initial uncontrolled active state. */
  defaultSelected?: boolean;
  /** Called immediately when the user toggles the filter. */
  onChange?: (selected: boolean) => void;
  /** Prevent interaction. */
  isDisabled?: boolean;
}
/** A compact toggle; the application owns filtering and result counts. */
export function FilterChip({
  label,
  isSelected,
  defaultSelected,
  onChange,
  isDisabled,
}: FilterChipProps) {
  return (
    <ToggleButton
      className="bd-filter-chip"
      {...(isSelected === undefined ? {} : { isSelected })}
      {...(defaultSelected === undefined ? {} : { defaultSelected })}
      {...(onChange === undefined ? {} : { onChange })}
      {...(isDisabled === undefined ? {} : { isDisabled })}
    >
      {label}
    </ToggleButton>
  );
}
