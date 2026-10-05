import { RadioGroup as AriaRadioGroup, Radio } from "react-aria-components";
import { FieldLabel, FieldMessages } from "../forms/FieldContent.js";
import type { FieldOption, FieldProps } from "../forms/FieldProps.js";

/** A named set of exclusive choices. */
export interface RadioGroupProps extends FieldProps {
  /** Ordered choices with unique stable values. */
  options: readonly FieldOption[];
  /** Presentation of the choices; list is the default. */
  variant?: "list" | "cards";
  /** Form submission name. */
  name?: string;
  /** Controlled selection. */
  value?: string;
  /** Initial uncontrolled selection. */
  defaultValue?: string;
  /** Called with the new selection. */
  onChange?: (value: string) => void;
  /** Custom validation message; return null for a valid selection. */
  validate?: (value: string) => string | null;
}
/** React Aria owns selection, keyboard navigation and group validation. */
export function RadioGroup({
  label,
  description,
  errorMessage,
  isRequired,
  isDisabled,
  isInvalid,
  options,
  variant = "list",
  name,
  value,
  defaultValue,
  onChange,
  validate,
}: RadioGroupProps) {
  return (
    <AriaRadioGroup
      className="bd-field"
      data-variant={variant}
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
          <Radio
            key={option.id}
            className="bd-radio"
            value={option.id}
            aria-label={
              option.detail === undefined
                ? option.label
                : `${option.label} ${option.detail}`
            }
            isDisabled={option.isDisabled ?? false}
          >
            <span className="bd-choice-box">
              <span className="bd-radio-dot" />
            </span>
            <span className="bd-radio-content">
              <span className="bd-radio-label">{option.label}</span>
              {option.detail !== undefined && (
                <span className="bd-radio-detail"> {option.detail}</span>
              )}
            </span>
          </Radio>
        ))}
      </div>
      <FieldMessages
        {...(description === undefined ? {} : { description })}
        {...(errorMessage === undefined ? {} : { errorMessage })}
      />
    </AriaRadioGroup>
  );
}
