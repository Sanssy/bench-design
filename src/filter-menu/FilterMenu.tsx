import { useState } from "react";
import {
  Button as AriaButton,
  Dialog,
  DialogTrigger,
  Popover,
} from "react-aria-components";
import { Button } from "../button/Button.js";
import type { FieldOption } from "../forms/FieldProps.js";
import {
  MultiComboBox,
  type MultiComboBoxProps,
} from "../multi-combo-box/MultiComboBox.js";
/** A value filter with an explicitly applied selection. */
export interface FilterMenuProps {
  /** Visible label for the chip and selection dialog. */
  label: string;
  /** Local choices. */
  options?: readonly FieldOption[];
  /** Server search using the shared abortable, paginated search contract. */
  loadItems?: MultiComboBoxProps["loadItems"];
  /** Controlled applied choices, including saved labels. */
  value?: readonly FieldOption[];
  /** Initial uncontrolled applied choices. */
  defaultValue?: readonly FieldOption[];
  /** Called only by Apply or Clear, never by dismissal or draft edits. */
  onApply?: (options: FieldOption[]) => void;
}
/** Opens a searchable draft; dismissal leaves the applied filter unchanged. */
export function FilterMenu({
  label,
  options,
  loadItems,
  value,
  defaultValue,
  onApply,
}: FilterMenuProps) {
  const [uncontrolled, setUncontrolled] = useState<readonly FieldOption[]>(
    defaultValue ?? [],
  );
  const applied = value ?? uncontrolled;
  const [draft, setDraft] = useState<readonly FieldOption[]>(applied);
  const [isOpen, setOpen] = useState(false);
  function apply(next: readonly FieldOption[]) {
    if (value === undefined) setUncontrolled([...next]);
    onApply?.([...next]);
    setOpen(false);
  }
  return (
    <DialogTrigger
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (open) setDraft([...applied]);
        setOpen(open);
      }}
    >
      <AriaButton
        className="bd-filter-chip"
        data-selected={applied.length > 0 || undefined}
      >
        {label}
        {applied.length > 0 && (
          <>
            :{" "}
            {applied
              .slice(0, 2)
              .map((option) => option.label)
              .join(", ")}
            {applied.length > 2 && (
              <span className="bd-filter-count">+{applied.length - 2}</span>
            )}
          </>
        )}
      </AriaButton>
      <Popover className="bd-popover" placement="bottom start">
        <Dialog className="bd-popover-dialog bd-filter-menu" aria-label={label}>
          <MultiComboBox
            label={label}
            selectedOptions={draft}
            onSelectionChange={setDraft}
            {...(options === undefined ? {} : { options })}
            {...(loadItems === undefined ? {} : { loadItems })}
          />
          <div className="bd-filter-actions">
            <Button onPress={() => apply([])}>Clear</Button>
            <Button variant="primary" onPress={() => apply(draft)}>
              Apply
            </Button>
          </div>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
