import { FieldError, Label, Text } from "react-aria-components";
import { useBenchMessages } from "../bench-provider/BenchProvider.js";
import { Icon } from "../icon/Icon.js";
import type { FieldProps } from "./FieldProps.js";

export function FieldLabel({
  label,
  isRequired,
  hideLabel = false,
}: Pick<FieldProps, "label" | "isRequired"> & { hideLabel?: boolean }) {
  return (
    <Label
      className={
        hideLabel ? "bd-field-label bd-field-hidden-label" : "bd-field-label"
      }
    >
      {label}
      {!isRequired && <FieldOptional />}
    </Label>
  );
}
export function FieldMessages({
  description,
  errorMessage,
}: Pick<FieldProps, "description" | "errorMessage">) {
  return (
    <>
      {description && (
        <Text slot="description" className="bd-field-description">
          {description}
        </Text>
      )}
      <FieldError className="bd-field-error">
        {({ validationErrors }) => (
          <>
            <Icon name="x" size={16} />
            <span>{errorMessage ?? validationErrors.join(" ")}</span>
          </>
        )}
      </FieldError>
    </>
  );
}

export function FieldOptional() {
  const { messages: m } = useBenchMessages();
  return <span className="bd-field-optional"> {m.optional}</span>;
}
