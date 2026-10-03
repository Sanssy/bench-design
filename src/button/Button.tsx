import type { ReactNode, Ref } from "react";
import { Button as AriaButton } from "react-aria-components";

/** Explicit public API; interaction is delegated to React Aria. */
export interface ButtonProps {
  children: ReactNode;
  onPress?: () => void;
  isDisabled?: boolean;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
  ref?: Ref<HTMLButtonElement>;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/** Native button semantics with React Aria activation. Styles are deferred. */
export function Button({
  children,
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
      {children}
    </AriaButton>
  );
}
