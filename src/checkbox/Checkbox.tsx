import { CheckboxButton, CheckboxField } from "react-aria-components";
import { FieldMessages, FieldOptional } from "../forms/FieldContent.js";
import type { FieldProps } from "../forms/FieldProps.js";
import { Icon } from "../icon/Icon.js";

/** A single accessible boolean choice. */
export interface CheckboxProps extends FieldProps {
  /** Form submission name. */
  name?: string;
  /** Submitted value when selected. */
  value?: string;
  /** Controlled selected state. */
  isSelected?: boolean;
  /** Initial uncontrolled selected state. */
  defaultSelected?: boolean;
  /** Called with the new selected state. */
  onChange?: (selected: boolean) => void;
}
/** A boolean control with an integrated description and error. */
export function Checkbox({
  label,
  description,
  errorMessage,
  isRequired,
  isDisabled,
  isInvalid,
  name,
  value,
  isSelected,
  defaultSelected,
  onChange,
}: CheckboxProps) {
  return (
    <CheckboxField
      className="bd-field"
      {...(name === undefined ? {} : { name })}
      {...(value === undefined ? {} : { value })}
      {...(isRequired === undefined ? {} : { isRequired })}
      {...(isDisabled === undefined ? {} : { isDisabled })}
      {...(isInvalid === undefined ? {} : { isInvalid })}
      {...(isSelected === undefined ? {} : { isSelected })}
      {...(defaultSelected === undefined ? {} : { defaultSelected })}
      {...(onChange === undefined ? {} : { onChange })}
    >
      <CheckboxButton className="bd-checkbox">
        <span className="bd-choice-box">
          <Icon name="check" size={16} />
        </span>
        <span className="bd-field-label">
          {label}
          {!isRequired && <FieldOptional />}
        </span>
      </CheckboxButton>
      <FieldMessages
        {...(description === undefined ? {} : { description })}
        {...(errorMessage === undefined ? {} : { errorMessage })}
      />
    </CheckboxField>
  );
}
