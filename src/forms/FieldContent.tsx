import { FieldError, Label, Text } from "react-aria-components";
import { Icon } from "../icon/Icon.js";
import type { FieldProps } from "./FieldProps.js";

export function FieldLabel({
  label,
  isRequired,
}: Pick<FieldProps, "label" | "isRequired">) {
  return (
    <Label className="bd-field-label">
      {label}
      {!isRequired && <span className="bd-field-optional"> (optional)</span>}
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
