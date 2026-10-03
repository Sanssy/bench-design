import type { ReactNode, Ref } from "react";
import { Link as AriaLink } from "react-aria-components";

/** Explicit navigation API; interaction is delegated to React Aria. */
export interface LinkProps {
  href: string;
  children: ReactNode;
  external?: boolean;
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
  ref,
  "aria-label": ariaLabel,
}: LinkProps) {
  return (
    <AriaLink
      className="bd-link"
      href={href}
      ref={ref}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...(ariaLabel === undefined
        ? {}
        : {
            "aria-label": external
              ? `${ariaLabel} (opens in a new tab)`
              : ariaLabel,
          })}
    >
      {children}
      {external && (
        <>
          {" "}
          <span className="bd-link-announcement">(opens in a new tab)</span>
        </>
      )}
    </AriaLink>
  );
}
