import { Icon } from "../icon/Icon.js";
import type { FieldProps } from "./FieldProps.js";
export function ChoiceFieldLabel({
  label,
  hideLabel = false,
  id,
}: Pick<FieldProps, "label"> & { hideLabel?: boolean; id: string }) {
  return (
    <span
      id={id}
      className={hideLabel ? "bd-field-hidden-label" : "bd-field-label"}
    >
      {label}
    </span>
  );
}
export function ChoiceFieldMessages({
  description,
  errorMessage,
  isInvalid,
  id,
}: Pick<FieldProps, "description" | "errorMessage" | "isInvalid"> & {
  id: string;
}) {
  return (
    <>
      {description && (
        <span id={`${id}-help`} className="bd-field-description">
          {description}
        </span>
      )}
      {isInvalid && errorMessage && (
        <span id={`${id}-error`} className="bd-field-error">
          <Icon name="x" size={16} />
          <span>{errorMessage}</span>
        </span>
      )}
    </>
  );
}
export function choiceDescription(
  id: string,
  description: string | undefined,
  errorMessage: string | undefined,
  isInvalid: boolean | undefined,
) {
  return (
    [
      description ? `${id}-help` : undefined,
      isInvalid && errorMessage ? `${id}-error` : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined
  );
}
