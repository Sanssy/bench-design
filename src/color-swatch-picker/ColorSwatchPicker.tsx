import { useId, useState } from "react";
import {
  ColorSwatchPicker as AriaColorSwatchPicker,
  ColorSwatch,
  ColorSwatchPickerItem,
  parseColor,
} from "react-aria-components";
import {
  ChoiceFieldLabel,
  ChoiceFieldMessages,
  choiceDescription,
} from "../forms/ChoiceFieldContent.js";
import type { FieldProps } from "../forms/FieldProps.js";
import { Icon } from "../icon/Icon.js";

/** ColorSwatchPicker public API. */
export interface ColorSwatchPickerProps extends FieldProps {
  /** Form submission name. */
  name?: string;
  /** Ordered colors with unique IDs and distinct color values. */
  colors: readonly { id: string; name: string; value: string }[];
  /** Controlled selected color ID. */
  value?: string;
  /** Initial uncontrolled color ID. */
  defaultValue?: string;
  /** Called with the selected color ID. */
  onChange?: (id: string) => void;
}
/** Accessible ColorSwatchPicker using React Aria interaction semantics. */
export function ColorSwatchPicker({
  label,
  description,
  errorMessage,
  isDisabled,
  isInvalid,
  colors,
  value,
  defaultValue,
  onChange,
  name,
}: ColorSwatchPickerProps) {
  const id = useId();
  const describedBy = choiceDescription(
    id,
    description,
    errorMessage,
    isInvalid,
  );
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  const selected = colors.find((color) => color.id === current)?.value;
  const initial = colors.find((color) => color.id === defaultValue)?.value;
  return (
    <div
      className="bd-field"
      data-disabled={isDisabled || undefined}
      data-invalid={isInvalid || undefined}
    >
      <ChoiceFieldLabel label={label} id={id} />
      <AriaColorSwatchPicker
        className="bd-swatches"
        aria-labelledby={id}
        {...(describedBy ? { "aria-describedby": describedBy } : {})}
        // React Aria filters aria-invalid from this listbox; set it directly.
        ref={(element) => {
          if (!element) return;
          if (isInvalid) element.setAttribute("aria-invalid", "true");
          else element.removeAttribute("aria-invalid");
        }}
        {...(selected === undefined ? {} : { value: selected })}
        {...(initial === undefined ? {} : { defaultValue: initial })}
        onChange={(color) => {
          const next = colors.find(
            (item) =>
              parseColor(item.value).toString("hex") === color.toString("hex"),
          );
          if (next) {
            setInternal(next.id);
            onChange?.(next.id);
          }
        }}
      >
        {colors.map((color) => (
          <ColorSwatchPickerItem
            key={color.id}
            color={color.value}
            aria-label={color.name}
            isDisabled={isDisabled ?? false}
            className="bd-swatch-option"
          >
            <ColorSwatch className="bd-swatch" />
            <span className="bd-swatch-check">
              <Icon name="check" size={16} />
            </span>
          </ColorSwatchPickerItem>
        ))}
      </AriaColorSwatchPicker>
      {name && (
        <input
          type="hidden"
          name={name}
          disabled={isDisabled}
          value={current ?? ""}
        />
      )}
      <ChoiceFieldMessages
        id={id}
        {...(description === undefined ? {} : { description })}
        {...(errorMessage === undefined ? {} : { errorMessage })}
        {...(isInvalid === undefined ? {} : { isInvalid })}
      />
    </div>
  );
}
