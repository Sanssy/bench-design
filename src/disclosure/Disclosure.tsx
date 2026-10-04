import type { ReactNode } from "react";
import { useId } from "react";
import {
  Button as AriaButton,
  Disclosure as AriaDisclosure,
  DisclosurePanel,
} from "react-aria-components";
import { Icon } from "../icon/Icon.js";
/** A labeled expandable section; controlled and uncontrolled state are supported. */
export interface DisclosureProps {
  title: string;
  meta?: string;
  isExpanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
  children: ReactNode;
}
/** React Aria owns trigger keyboard behavior and panel relationships. */
export function Disclosure({
  title,
  meta,
  children,
  ...props
}: DisclosureProps) {
  const id = useId();
  return (
    <AriaDisclosure {...props} id={id} className="bd-disclosure">
      <AriaButton slot="trigger" className="bd-disclosure__trigger">
        <Icon name="chevron-down" size={20} />
        <span>{title}</span>
        {meta && <span className="bd-disclosure__meta">{meta}</span>}
      </AriaButton>
      <DisclosurePanel className="bd-disclosure__panel">
        {children}
      </DisclosurePanel>
    </AriaDisclosure>
  );
}
