import {
  CheckboxGroup as AriaCheckboxGroup,
  Checkbox,
} from "react-aria-components";
import { FieldLabel, FieldMessages } from "../forms/FieldContent.js";
import type { FieldOption, FieldProps } from "../forms/FieldProps.js";
import { Icon } from "../icon/Icon.js";

/** A named set of multiple choices. */
export interface CheckboxGroupProps extends FieldProps {
  /** Ordered choices with unique stable values. */
  options: readonly FieldOption[];
  /** Form submission name. */
  name?: string;
  /** Controlled selection. */
  value?: string[];
  /** Initial uncontrolled selection. */
  defaultValue?: string[];
  /** Called with the new selection. */
  onChange?: (value: string[]) => void;
  /** Custom validation message; return null for a valid selection. */
  validate?: (value: string[]) => string | null;
}
/** React Aria owns selection, keyboard navigation and group validation. */
export function CheckboxGroup({
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
  validate,
}: CheckboxGroupProps) {
  return (
    <AriaCheckboxGroup
      className="bd-field"
      {...(name === undefined ? {} : { name })}
      {...(value === undefined ? {} : { value })}
      {...(defaultValue === undefined ? {} : { defaultValue })}
      {...(onChange === undefined ? {} : { onChange })}
      {...(validate === undefined ? {} : { validate })}
      {...(isRequired === undefined ? {} : { isRequired })}
      {...(isDisabled === undefined ? {} : { isDisabled })}
      {...(isInvalid === undefined ? {} : { isInvalid })}
    >
      <FieldLabel
        label={label}
        {...(isRequired === undefined ? {} : { isRequired })}
      />
      <div className="bd-choice-list">
        {options.map((option) => (
          <Checkbox
            key={option.id}
            className="bd-checkbox"
            value={option.id}
            isDisabled={option.isDisabled ?? false}
          >
            <span className="bd-choice-box">
              <Icon name="check" size={16} />
            </span>
            <span>{option.label}</span>
          </Checkbox>
        ))}
      </div>
      <FieldMessages
        {...(description === undefined ? {} : { description })}
        {...(errorMessage === undefined ? {} : { errorMessage })}
      />
    </AriaCheckboxGroup>
  );
}
