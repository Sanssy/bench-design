import {
  ColorField as AriaColorField,
  ColorSwatch,
  Group,
  Input,
} from "react-aria-components";
import { FieldLabel, FieldMessages } from "../forms/FieldContent.js";
import type { FieldProps } from "../forms/FieldProps.js";

/** ColorField public API. */
export interface ColorFieldProps extends FieldProps {
  /** Form submission name. */
  name?: string;
  /** Controlled HEX color. */
  value?: string;
  /** Initial uncontrolled HEX color. */
  defaultValue?: string;
  /** Called with the edited HEX color. */
  onChange?: (hex: string) => void;
  /** Return a validation message or null. */
  validate?: (hex: string) => string | null;
}
/** Accessible ColorField using React Aria interaction semantics. */
export function ColorField({
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
  validate,
}: ColorFieldProps) {
  return (
    <AriaColorField
      className="bd-field"
      {...(name === undefined ? {} : { name })}
      {...(value === undefined ? {} : { value })}
      {...(defaultValue === undefined ? {} : { defaultValue })}
      {...(isRequired === undefined ? {} : { isRequired })}
      {...(isDisabled === undefined ? {} : { isDisabled })}
      {...(isInvalid === undefined ? {} : { isInvalid })}
      {...(onChange === undefined
        ? {}
        : { onChange: (color) => onChange(color?.toString("hex") ?? "") })}
      {...(validate === undefined
        ? {}
        : { validate: (color) => validate(color?.toString("hex") ?? "") })}
    >
      {({ state }) => (
        <>
          <FieldLabel
            label={label}
            {...(isRequired === undefined ? {} : { isRequired })}
          />
          <Group className="bd-field-control bd-color-control">
            {state.colorValue ? (
              <ColorSwatch
                color={state.colorValue}
                className="bd-color-preview"
              />
            ) : (
              <span className="bd-color-preview" aria-hidden="true" />
            )}
            <Input className="bd-search-input bd-field-mono" />
          </Group>
          <FieldMessages
            {...(description === undefined ? {} : { description })}
            {...(errorMessage === undefined ? {} : { errorMessage })}
          />
        </>
      )}
    </AriaColorField>
  );
}
