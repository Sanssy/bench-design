import type { ReactNode, Ref } from "react";
import { Button as AriaButton } from "react-aria-components";
import { Icon } from "../icon/Icon.js";
import type { IconName } from "../icon/icons.js";

/** An in-page action styled as inline link text; interaction is delegated to React Aria. */
export interface TextButtonProps {
  children: ReactNode;
  onPress: () => void;
  /** Decorative icon before the visible text. */
  icon?: IconName;
  /** Decorative icon after the visible text; does not replace it. */
  trailingIcon?: IconName;
  /** Metadata typography; default inherits the surrounding typography. */
  variant?: "default" | "meta";
  ref?: Ref<HTMLButtonElement>;
  "aria-label"?: string;
}

/**
 * A native button that reads as a link, for actions inside running text or
 * metadata, such as opening the sources of a fact. Use Link for navigation.
 * Accessible names should include the visible label; prefer children alone.
 */
export function TextButton({
  children,
  onPress,
  icon,
  trailingIcon,
  variant = "default",
  ref,
  "aria-label": ariaLabel,
}: TextButtonProps) {
  return (
    <AriaButton
      className="bd-link bd-text-button"
      data-variant={variant}
      onPress={onPress}
      {...(ref === undefined ? {} : { ref })}
      {...(ariaLabel === undefined ? {} : { "aria-label": ariaLabel })}
    >
      {icon && (
        <span className="bd-link-icon-leading">
          <Icon name={icon} size={16} />
        </span>
      )}
      {children}
      {trailingIcon && (
        <span className="bd-link-icon-trailing">
          <Icon name={trailingIcon} size={16} />
        </span>
      )}
    </AriaButton>
  );
}
