import type { ReactNode, Ref } from "react";
import { Button as AriaButton } from "react-aria-components";

import { Icon } from "../icon/Icon.js";
import type { IconName } from "../icon/icons.js";

/** Explicit public API; interaction is delegated to React Aria. */
export interface ButtonProps {
  children: ReactNode;
  /** Decorative icon before the visible label. */
  icon?: IconName;
  onPress?: () => void;
  isDisabled?: boolean;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
  ref?: Ref<HTMLButtonElement>;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/**
 * A visible-label action with React Aria activation and native button semantics.
 * Defaults to the secondary variant and type="button"; submit and reset are native.
 * Use the DOM ref to restore focus. Explicit accessible names must include the
 * visible label; prefer children alone when no additional context is needed.
 */
export function Button({
  children,
  icon,
  onPress,
  isDisabled = false,
  variant = "secondary",
  type = "button",
  ref,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
}: ButtonProps) {
  return (
    <AriaButton
      className={
        icon === undefined ? "bd-button" : "bd-button bd-button--with-icon"
      }
      ref={ref}
      type={type}
      {...(onPress === undefined ? {} : { onPress })}
      isDisabled={isDisabled}
      data-variant={variant}
      {...(ariaLabel === undefined ? {} : { "aria-label": ariaLabel })}
      {...(ariaLabelledby === undefined
        ? {}
        : { "aria-labelledby": ariaLabelledby })}
    >
      {icon === undefined ? null : <Icon name={icon} size={20} />}
      {children}
    </AriaButton>
  );
}
