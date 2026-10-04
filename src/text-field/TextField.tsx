import { TextField as AriaTextField, Input } from "react-aria-components";
import { FieldLabel, FieldMessages } from "../forms/FieldContent.js";
import type { FieldProps } from "../forms/FieldProps.js";

/** Accessible text input with integrated label and validation. */
export interface TextFieldProps extends FieldProps {
  /** Form submission name. */
  name?: string;
  /** Current controlled value. */
  value?: string;
  /** Initial uncontrolled value. */
  defaultValue?: string;
  /** Called with the edited value. */
  onChange?: (value: string) => void;
  /** Short input hint; never replaces the label. */
  placeholder?: string;
  /** Custom validation message; return null for a valid value. */
  validate?: (value: string) => string | null;
  /** Native input kind. */
  type?: "text" | "email" | "url" | "tel" | "password";
  /** Browser autofill hint. */
  autoComplete?: string;
}
/** A React Aria input retaining native form validation. */
export function TextField({
  label,
  description,
  errorMessage,
  isRequired,
  isDisabled,
  isInvalid,
  name,
  value,
  defaultValue,
  onChange,
  placeholder,
  validate,
  type = "text",
  autoComplete,
}: TextFieldProps) {
  return (
    <AriaTextField
      className="bd-field"
      {...(name === undefined ? {} : { name })}
      {...(value === undefined ? {} : { value })}
      {...(defaultValue === undefined ? {} : { defaultValue })}
      {...(onChange === undefined ? {} : { onChange })}
      {...(isRequired === undefined ? {} : { isRequired })}
      {...(isDisabled === undefined ? {} : { isDisabled })}
      {...(isInvalid === undefined ? {} : { isInvalid })}
      {...(validate === undefined ? {} : { validate })}
      type={type}
      {...(autoComplete === undefined ? {} : { autoComplete })}
    >
      <FieldLabel
        label={label}
        {...(isRequired === undefined ? {} : { isRequired })}
      />
      <Input
        className="bd-field-control"
        {...(placeholder === undefined ? {} : { placeholder })}
      />
      <FieldMessages
        {...(description === undefined ? {} : { description })}
        {...(errorMessage === undefined ? {} : { errorMessage })}
      />
    </AriaTextField>
  );
}
