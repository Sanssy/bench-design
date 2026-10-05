import {
  SearchField as AriaSearchField,
  Button,
  Input,
} from "react-aria-components";
import { FieldLabel, FieldMessages } from "../forms/FieldContent.js";
import type { FieldProps } from "../forms/FieldProps.js";
import { Icon } from "../icon/Icon.js";

/** Accessible search input with integrated label and validation. */
export interface SearchFieldProps extends FieldProps {
  /** Visual treatment; boxed by default. */
  variant?: "boxed" | "underlined";
  /** Visually hide the associated label without removing its accessible name. */
  hideLabel?: boolean;
  /** Browser autocomplete hint. */
  autoComplete?: string;
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
  /** Called when the user submits a search. */
  onSubmit?: (value: string) => void;
  /** Called when the user clears the search. */
  onClear?: () => void;
}
/** A React Aria input retaining native form validation. */
export function SearchField({
  label,
  variant = "boxed",
  hideLabel = false,
  autoComplete,
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
  onSubmit,
  onClear,
}: SearchFieldProps) {
  return (
    <AriaSearchField
      className="bd-field bd-search-field"
      data-variant={variant}
      {...(name === undefined ? {} : { name })}
      {...(value === undefined ? {} : { value })}
      {...(defaultValue === undefined ? {} : { defaultValue })}
      {...(onChange === undefined ? {} : { onChange })}
      {...(isRequired === undefined ? {} : { isRequired })}
      {...(isDisabled === undefined ? {} : { isDisabled })}
      {...(isInvalid === undefined ? {} : { isInvalid })}
      {...(validate === undefined ? {} : { validate })}
      {...(onSubmit === undefined ? {} : { onSubmit })}
      {...(onClear === undefined ? {} : { onClear })}
    >
      <FieldLabel
        label={label}
        hideLabel={hideLabel}
        {...(isRequired === undefined ? {} : { isRequired })}
      />
      <div className="bd-field-control bd-search-control">
        <Icon name="search" size={20} />
        <Input
          className="bd-search-input"
          {...(autoComplete === undefined ? {} : { autoComplete })}
          {...(placeholder === undefined ? {} : { placeholder })}
        />
        <Button className="bd-search-clear">
          <Icon name="x" size={20} />
        </Button>
      </div>
      <FieldMessages
        {...(description === undefined ? {} : { description })}
        {...(errorMessage === undefined ? {} : { errorMessage })}
      />
    </AriaSearchField>
  );
}
