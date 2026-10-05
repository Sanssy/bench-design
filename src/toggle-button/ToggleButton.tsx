import { ToggleButton as AriaToggleButton } from "react-aria-components";
import { Icon } from "../icon/Icon.js";
import type { IconName } from "../icon/icons.js";

/** An independent binary option with a required accessible name. */
export interface ToggleButtonProps {
  /** Visible label, or accessible name when displaying an icon. */
  label: string;
  /** Decorative catalogue icon displayed instead of the visible label. */
  icon?: IconName;
  /** Controlled selected state. */
  isSelected?: boolean;
  /** Initial uncontrolled selected state. */
  defaultSelected?: boolean;
  /** Called with the requested selected state. */
  onChange?: (isSelected: boolean) => void;
  /** Prevent activation and remove the button from keyboard navigation. */
  isDisabled?: boolean;
}
/** A React Aria toggle using shared button geometry and selection tokens. */
export function ToggleButton({
  label,
  icon,
  isSelected,
  defaultSelected,
  onChange,
  isDisabled = false,
}: ToggleButtonProps) {
  return (
    <AriaToggleButton
      className={
        icon === undefined
          ? "bd-button bd-toggle-button"
          : "bd-button bd-icon-button bd-toggle-button"
      }
      data-variant="secondary"
      {...(icon === undefined ? {} : { "aria-label": label })}
      {...(isSelected === undefined ? {} : { isSelected })}
      {...(defaultSelected === undefined ? {} : { defaultSelected })}
      {...(onChange === undefined ? {} : { onChange })}
      isDisabled={isDisabled}
    >
      {icon === undefined ? label : <Icon name={icon} size={20} />}
    </AriaToggleButton>
  );
}
