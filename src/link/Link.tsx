import type { ReactNode, Ref } from "react";
import { Link as AriaLink } from "react-aria-components";
import { useBenchMessages } from "../bench-provider/BenchProvider.js";
import { Icon } from "../icon/Icon.js";
import type { IconName } from "../icon/icons.js";

/** Explicit navigation API; interaction is delegated to React Aria. */
export interface LinkProps {
  href: string;
  children: ReactNode;
  external?: boolean;
  /** Decorative icon before the visible text. */
  icon?: IconName;
  /** Decorative icon after the visible text; does not replace it. */
  trailingIcon?: IconName;
  /** Metadata typography; default inherits the surrounding typography. */
  variant?: "default" | "meta";
  ref?: Ref<HTMLAnchorElement>;
  "aria-label"?: string;
}

/**
 * An inline link inheriting the surrounding text color.
 * External links announce their new tab, including with an explicit name.
 * Accessible names should include the visible label; prefer children alone.
 */
export function Link({
  href,
  children,
  external = false,
  icon,
  trailingIcon,
  variant = "default",
  ref,
  "aria-label": ariaLabel,
}: LinkProps) {
  const { messages: m } = useBenchMessages();
  return (
    <AriaLink
      className="bd-link"
      data-variant={variant}
      href={href}
      ref={ref}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...(ariaLabel === undefined
        ? {}
        : {
            "aria-label": external
              ? `${ariaLabel} ${m.externalLink}`
              : ariaLabel,
          })}
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
      {external && (
        <>
          {" "}
          <span className="bd-link-announcement">{m.externalLink}</span>
        </>
      )}
    </AriaLink>
  );
}
