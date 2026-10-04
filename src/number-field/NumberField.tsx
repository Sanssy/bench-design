import {
  NumberField as AriaNumberField,
  Button,
  Group,
  Input,
} from "react-aria-components";
import { FieldLabel, FieldMessages } from "../forms/FieldContent.js";
import type { FieldProps } from "../forms/FieldProps.js";

/** NumberField public API. */
export interface NumberFieldProps extends FieldProps {
  /** Form submission name. */
  name?: string;
  /** Controlled value. */
  value?: number;
  /** Initial uncontrolled value. */
  defaultValue?: number;
  /** Called with the edited value. */
  onChange?: (value: number) => void;
  /** Lower bound. */
  minValue?: number;
  /** Upper bound. */
  maxValue?: number;
  /** Increment size. */
  step?: number;
  /** Locale-aware display format. */
  formatOptions?: Intl.NumberFormatOptions;
  /** Optional unit displayed after the input. */
  unit?: string;
}
/** Accessible NumberField using React Aria interaction semantics. */
export function NumberField({
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
  minValue,
  maxValue,
  step,
  unit,
  formatOptions,
}: NumberFieldProps) {
  return (
    <AriaNumberField
      className="bd-field"
      {...(name === undefined ? {} : { name })}
      {...(value === undefined ? {} : { value })}
      {...(defaultValue === undefined ? {} : { defaultValue })}
      {...(onChange === undefined ? {} : { onChange })}
      {...(minValue === undefined ? {} : { minValue })}
      {...(maxValue === undefined ? {} : { maxValue })}
      {...(step === undefined ? {} : { step })}
      {...(formatOptions === undefined ? {} : { formatOptions })}
      {...(isRequired === undefined ? {} : { isRequired })}
      {...(isDisabled === undefined ? {} : { isDisabled })}
      {...(isInvalid === undefined ? {} : { isInvalid })}
    >
      <FieldLabel
        label={label}
        {...(isRequired === undefined ? {} : { isRequired })}
      />
      <Group className="bd-field-control bd-number-control">
        <Input className="bd-search-input" />
        {unit && <span className="bd-field-mono">{unit}</span>}
        <Button slot="decrement" className="bd-number-step">
          −
        </Button>
        <Button slot="increment" className="bd-number-step">
          +
        </Button>
      </Group>
      <FieldMessages
        {...(description === undefined ? {} : { description })}
        {...(errorMessage === undefined ? {} : { errorMessage })}
      />
    </AriaNumberField>
  );
}
