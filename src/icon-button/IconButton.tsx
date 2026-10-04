import { useImperativeHandle, useLayoutEffect, useRef } from "react";
import { Button as AriaButton } from "react-aria-components";
import type { ButtonProps } from "../button/Button.js";
import { Icon } from "../icon/Icon.js";
import type { IconName } from "../icon/icons.js";

/** An icon-only action with an explicit accessible name. */
export interface IconButtonProps
  extends Pick<
    ButtonProps,
    "variant" | "isDisabled" | "onPress" | "type" | "ref"
  > {
  /** Decorative icon from the shared catalogue. */
  icon: IconName;
  /** Required action name, used for aria-label and the native title. */
  label: string;
}
/** A 48px square action; label supplies its accessible name and native tooltip. */
export function IconButton({
  icon,
  label,
  variant = "secondary",
  isDisabled = false,
  onPress,
  type = "button",
  ref,
}: IconButtonProps) {
  const domRef = useRef<HTMLButtonElement>(null);
  useImperativeHandle(ref, () => domRef.current as HTMLButtonElement);
  // React Aria filters title; apply the native tooltip to its DOM button.
  useLayoutEffect(() => {
    domRef.current?.setAttribute("title", label);
  }, [label]);
  return (
    <AriaButton
      className="bd-button bd-icon-button"
      data-variant={variant}
      aria-label={label}
      isDisabled={isDisabled}
      type={type}
      ref={domRef}
      {...(onPress === undefined ? {} : { onPress })}
    >
      <Icon name={icon} size={20} />
    </AriaButton>
  );
}
