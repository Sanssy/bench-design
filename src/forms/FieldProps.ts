/** Shared accessible metadata and validation state for form controls. */
export interface FieldProps {
  /** Visible accessible name of the control. */
  label: string;
  /** Supporting text connected to the control. */
  description?: string;
  /** Message displayed when validation fails; otherwise React Aria supplies it. */
  errorMessage?: string;
  /** Require a value using React Aria native form validation. */
  isRequired?: boolean;
  /** Prevent editing, activation and keyboard focus. */
  isDisabled?: boolean;
  /** Display an externally determined validation error. */
  isInvalid?: boolean;
}
/** Stable values and visible labels for choice controls. */
export interface FieldOption {
  /** Unique value used for selection and form submission. */
  id: string;
  /** Visible accessible name of the option. */
  label: string;
  /** Optional supporting text displayed on a second line in searchable lists. */
  description?: string;
  /** Supporting text included in the radio option accessible name. */
  detail?: string;
  /** Prevent this option from being selected. */
  isDisabled?: boolean;
}
