import {
  Select as AriaSelect,
  Button,
  ListBox,
  ListBoxItem,
  Popover,
  SelectValue,
} from "react-aria-components";
import { FieldLabel, FieldMessages } from "../forms/FieldContent.js";
import type { FieldOption, FieldProps } from "../forms/FieldProps.js";
import { Icon } from "../icon/Icon.js";

/** A single choice from an anchored accessible list. */
export interface SelectProps extends FieldProps {
  /** Ordered choices with unique stable identifiers. */
  options: readonly FieldOption[];
  /** Form submission name. */
  name?: string;
  /** Controlled selected identifier; null clears selection. */
  value?: string | null;
  /** Initial uncontrolled selected identifier. */
  defaultValue?: string | null;
  /** Called with the selected identifier, or null when cleared. */
  onChange?: (key: string | null) => void;
  /** Hint shown until an option is selected. */
  placeholder?: string;
  /** Custom validation message; return null for a valid selection. */
  validate?: (key: string | null) => string | null;
}
/** A React Aria select using the shared Popover surface and list primitives. */
export function Select({
  label,
  description,
  errorMessage,
  isRequired,
  isDisabled,
  isInvalid,
  options,
  name,
  value,
  defaultValue,
  onChange,
  placeholder,
  validate,
}: SelectProps) {
  return (
    <AriaSelect
      className="bd-field"
      {...(name === undefined ? {} : { name })}
      {...(value === undefined ? {} : { value })}
      {...(defaultValue === undefined ? {} : { defaultValue })}
      onChange={(key) => onChange?.(key == null ? null : String(key))}
      {...(placeholder === undefined ? {} : { placeholder })}
      validate={(key) => validate?.(key == null ? null : String(key)) ?? null}
      {...(isRequired === undefined ? {} : { isRequired })}
      {...(isDisabled === undefined ? {} : { isDisabled })}
      {...(isInvalid === undefined ? {} : { isInvalid })}
      disabledKeys={options
        .filter((option) => option.isDisabled)
        .map((option) => option.id)}
    >
      <FieldLabel
        label={label}
        {...(isRequired === undefined ? {} : { isRequired })}
      />
      <Button className="bd-field-control bd-select-trigger">
        {/* Text only: the option's check icon belongs to the list. */}
        <SelectValue>
          {({ defaultChildren, isPlaceholder, selectedText }) =>
            isPlaceholder ? defaultChildren : selectedText
          }
        </SelectValue>
        <Icon name="chevron-down" size={20} />
      </Button>
      <Popover
        className="bd-popover bd-choice-popover"
        placement="bottom start"
      >
        <ListBox className="bd-option-list" items={options}>
          {(option) => (
            <ListBoxItem
              id={option.id}
              textValue={option.label}
              className="bd-option"
            >
              <span>{option.label}</span>
              <Icon name="check" size={16} />
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
      <FieldMessages
        {...(description === undefined ? {} : { description })}
        {...(errorMessage === undefined ? {} : { errorMessage })}
      />
    </AriaSelect>
  );
}
