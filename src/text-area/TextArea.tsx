import { useLayoutEffect, useRef, useState } from "react";
import { TextArea as AriaTextArea, TextField } from "react-aria-components";
import { FieldLabel, FieldMessages } from "../forms/FieldContent.js";
import type { FieldProps } from "../forms/FieldProps.js";

/** Multiline input with bounded automatic growth. */
export interface TextAreaProps extends FieldProps {
  /** Form submission name. */
  name?: string;
  /** Controlled text. */
  value?: string;
  /** Initial uncontrolled text. */
  defaultValue?: string;
  /** Called with the edited text. */
  onChange?: (value: string) => void;
  /** Short hint, never a replacement for the label. */
  placeholder?: string;
  /** Maximum character count; enables the visible counter. */
  maxLength?: number;
  /** Initial number of visible lines. */
  rows?: number;
  /** Maximum number of visible lines before scrolling. */
  maxRows?: number;
  /** Return a validation message or null. */
  validate?: (value: string) => string | null;
}
/** React Aria owns editing and validation; measurement only controls geometry. */
export function TextArea({
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
  maxLength,
  rows = 3,
  maxRows = 8,
  validate,
}: TextAreaProps) {
  const [text, setText] = useState(defaultValue ?? "");
  const current = value ?? text;
  const input = useRef<HTMLTextAreaElement>(null);
  const minimum = Math.max(1, rows);
  const maximum = Math.max(minimum, maxRows);
  // biome-ignore lint/correctness/useExhaustiveDependencies: text changes update DOM scrollHeight before this measurement.
  useLayoutEffect(() => {
    const element = input.current;
    if (!element) return;
    const resize = () => {
      const css = getComputedStyle(element);
      const line = Number.parseFloat(css.lineHeight);
      if (!Number.isFinite(line)) return;
      const padding =
        Number.parseFloat(css.paddingTop) +
        Number.parseFloat(css.paddingBottom);
      const border =
        Number.parseFloat(css.borderTopWidth) +
        Number.parseFloat(css.borderBottomWidth);
      element.style.height = "auto";
      element.style.height = `${Math.min(maximum * line + padding + border, Math.max(minimum * line + padding + border, element.scrollHeight + border))}px`;
    };
    resize();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, [current, minimum, maximum]);
  return (
    <TextField
      className="bd-field"
      {...(name === undefined ? {} : { name })}
      {...(isRequired === undefined ? {} : { isRequired })}
      {...(isDisabled === undefined ? {} : { isDisabled })}
      {...(isInvalid === undefined ? {} : { isInvalid })}
      {...(validate === undefined ? {} : { validate })}
      value={current}
      onChange={(next) => {
        setText(next);
        onChange?.(next);
      }}
    >
      <FieldLabel
        label={label}
        {...(isRequired === undefined ? {} : { isRequired })}
      />
      <AriaTextArea
        ref={input}
        className="bd-field-control bd-textarea"
        rows={minimum}
        {...(placeholder === undefined ? {} : { placeholder })}
        {...(maxLength === undefined ? {} : { maxLength })}
      />
      {maxLength !== undefined && (
        <span className="bd-field-counter">
          {current.length} / {maxLength}
        </span>
      )}
      <FieldMessages
        {...(description === undefined ? {} : { description })}
        {...(errorMessage === undefined ? {} : { errorMessage })}
      />
    </TextField>
  );
}
