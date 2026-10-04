import { useId } from "react";
import {
  Slider as AriaSlider,
  Label,
  SliderOutput,
  SliderThumb,
  SliderTrack,
} from "react-aria-components";
import { ChoiceFieldMessages } from "../forms/ChoiceFieldContent.js";
import type { FieldProps } from "../forms/FieldProps.js";

/** Slider public API. */
export interface SliderProps extends FieldProps {
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
}
/** Accessible Slider using React Aria interaction semantics. */
export function Slider({
  label,
  description,
  errorMessage,
  isDisabled,
  isInvalid,
  name,
  value,
  defaultValue,
  onChange,
  minValue = 0,
  maxValue = 100,
  step = 1,
  formatOptions,
}: SliderProps) {
  const id = useId();
  const help = description ? `${id}-help` : undefined;
  const error = isInvalid && errorMessage ? `${id}-error` : undefined;
  const describedBy = [help, error].filter(Boolean).join(" ");
  return (
    <AriaSlider
      className="bd-field bd-slider"
      {...(value === undefined ? {} : { value })}
      {...(defaultValue === undefined ? {} : { defaultValue })}
      {...(onChange === undefined ? {} : { onChange })}
      {...(formatOptions === undefined ? {} : { formatOptions })}
      {...(isDisabled === undefined ? {} : { isDisabled })}
      minValue={minValue}
      maxValue={maxValue}
      step={step}
    >
      <div className="bd-slider-heading">
        <Label className="bd-field-label">{label}</Label>
        <SliderOutput className="bd-field-mono" />
      </div>
      <SliderTrack className="bd-slider-track">
        {({ state }) => (
          <>
            <span className="bd-slider-rail" />
            <span
              className="bd-slider-fill"
              style={{ width: `${state.getThumbPercent(0) * 100}%` }}
            />
            {/* React Aria's Slider renders no form input; submit the value. */}
            {name !== undefined && (
              <input type="hidden" name={name} value={state.values[0]} />
            )}
            <SliderThumb
              className="bd-slider-thumb"
              {...(describedBy ? { "aria-describedby": describedBy } : {})}
              {...(isInvalid ? { "aria-invalid": true } : {})}
            />
          </>
        )}
      </SliderTrack>
      <ChoiceFieldMessages
        id={id}
        {...(description === undefined ? {} : { description })}
        {...(errorMessage === undefined ? {} : { errorMessage })}
        {...(isInvalid === undefined ? {} : { isInvalid })}
      />
    </AriaSlider>
  );
}
