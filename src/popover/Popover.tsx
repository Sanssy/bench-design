import type { ReactNode } from "react";
import {
  Dialog as AriaDialog,
  Popover as AriaPopover,
  DialogTrigger,
} from "react-aria-components";

/** Contextual content anchored to an accessible action. */
export interface PopoverProps {
  /** A React Aria compatible action, usually a DS Button. */
  trigger: ReactNode;
  /** Required accessible name for the content dialog. */
  label: string;
  children: ReactNode;
  /** Preferred anchor placement; React Aria repositions near viewport edges. */
  placement?:
    | "top"
    | "top start"
    | "top end"
    | "bottom"
    | "bottom start"
    | "bottom end"
    | "left"
    | "left top"
    | "left bottom"
    | "right"
    | "right top"
    | "right bottom"
    | "start"
    | "start top"
    | "start bottom"
    | "end"
    | "end top"
    | "end bottom";
}
/** An anchored dialog without a veil; Escape and outside interaction dismiss it. */
export function Popover({
  trigger,
  label,
  children,
  placement = "bottom start",
}: PopoverProps) {
  return (
    <DialogTrigger>
      {trigger}
      <AriaPopover className="bd-popover" placement={placement}>
        <AriaDialog className="bd-popover-dialog" aria-label={label}>
          {children}
        </AriaDialog>
      </AriaPopover>
    </DialogTrigger>
  );
}
