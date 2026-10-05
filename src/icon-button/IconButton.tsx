import { useImperativeHandle, useRef } from "react";
import {
  Button as AriaButton,
  Tooltip,
  TooltipTrigger,
} from "react-aria-components";
import type { ButtonProps } from "../button/Button.js";
import { Icon } from "../icon/Icon.js";
import type { IconName } from "../icon/icons.js";
import type { SpaceToken } from "../space-tokens.js";

/** An icon-only action with an explicit accessible name. */
export interface IconButtonProps
  extends Pick<
    ButtonProps,
    "variant" | "isDisabled" | "onPress" | "type" | "ref"
  > {
  /** Decorative icon from the shared catalogue. */
  icon: IconName;
  /** Required action name, used for aria-label and the tooltip. */
  label: string;
}
/** A 48px square action; label supplies its accessible name and tooltip. */
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
  return (
    <TooltipTrigger>
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
      {/* 12 px (space-12) clears the 8 px focus ring of the button. */}
      <Tooltip
        className="bd-tooltip bd-surface"
        data-tone="inverse"
        offset={12 satisfies SpaceToken}
      >
        {label}
      </Tooltip>
    </TooltipTrigger>
  );
}
