import type { ReactNode } from "react";
import { DisclosureGroup as AriaDisclosureGroup } from "react-aria-components";
/** Coordinate expansion across child Disclosures. */
export interface DisclosureGroupProps {
  allowsMultipleExpanded?: boolean;
  children: ReactNode;
}
/** An accordion with exclusive expansion by default. */
export function DisclosureGroup({
  children,
  allowsMultipleExpanded = false,
}: DisclosureGroupProps) {
  return (
    <AriaDisclosureGroup
      className="bd-disclosure-group"
      allowsMultipleExpanded={allowsMultipleExpanded}
    >
      {children}
    </AriaDisclosureGroup>
  );
}
