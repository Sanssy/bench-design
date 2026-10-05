import { useId } from "react";
import { ToggleButton, ToggleButtonGroup } from "react-aria-components";
import {
  ChoiceFieldLabel,
  ChoiceFieldMessages,
  choiceDescription,
} from "../forms/ChoiceFieldContent.js";
import type { FieldProps } from "../forms/FieldProps.js";
import { Icon } from "../icon/Icon.js";
import type { IconName } from "../icon/icons.js";

/** SegmentedControl public API. */
export interface SegmentedControlProps extends FieldProps {
  /** Form submission name. */
  name?: string;
  /** Ordered segments; label is mandatory even when displaying an icon. */
  options: readonly {
    id: string;
    label: string;
    icon?: IconName;
    /** Visible count included in the accessible name, including zero. */
    count?: number;
    isDisabled?: boolean;
  }[];
  /** Wrap up to six single-choice options; use FilterBar for larger sets. @default "inline" */
  layout?: "inline" | "wrap";
  /** Controlled selection ID. */
  value?: string;
  /** Initial uncontrolled selection ID; defaults to the first enabled option. */
  defaultValue?: string;
  /** Called with the selected ID. */
  onChange?: (id: string) => void;
  /** Visually hide the group label while preserving its accessible name. */
  hideLabel?: boolean;
}
/** Accessible SegmentedControl using React Aria interaction semantics. */
export function SegmentedControl({
  label,
  description,
  errorMessage,
  isDisabled,
  isInvalid,
  name,
  options,
  value,
  defaultValue,
  onChange,
  hideLabel = false,
  layout = "inline",
}: SegmentedControlProps) {
  const id = useId();
  if (layout === "wrap" && options.length > 6) {
    throw new RangeError(
      "SegmentedControl wrap supports at most six options; use FilterBar for larger sets.",
    );
  }
  const describedBy = choiceDescription(
    id,
    description,
    errorMessage,
    isInvalid,
  );
  const initial =
    defaultValue ?? options.find((option) => !option.isDisabled)?.id;
  return (
    <div
      className="bd-field"
      data-disabled={isDisabled || undefined}
      data-invalid={isInvalid || undefined}
    >
      <ChoiceFieldLabel label={label} id={id} hideLabel={hideLabel} />
      <ToggleButtonGroup
        className="bd-segmented"
        data-layout={layout}
        aria-labelledby={id}
        {...(describedBy ? { "aria-describedby": describedBy } : {})}
        selectionMode="single"
        disallowEmptySelection
        {...(isDisabled === undefined ? {} : { isDisabled })}
        {...(value === undefined
          ? { defaultSelectedKeys: initial === undefined ? [] : [initial] }
          : { selectedKeys: [value] })}
        onSelectionChange={(keys) => {
          const next = keys.values().next().value;
          if (typeof next === "string") onChange?.(next);
        }}
      >
        {({ state }) => (
          <>
            {name && (
              <input
                type="hidden"
                name={name}
                disabled={isDisabled}
                value={Array.from(state.selectedKeys)[0] ?? ""}
              />
            )}
            {options.map((option) => (
              <ToggleButton
                key={option.id}
                id={option.id}
                className="bd-segment"
                // The visible count is part of the name, e.g. "Housing, 5".
                aria-label={
                  option.count === undefined
                    ? option.label
                    : `${option.label}, ${option.count}`
                }
                isDisabled={option.isDisabled ?? false}
              >
                {option.icon ? (
                  <Icon name={option.icon} size={16} />
                ) : (
                  option.label
                )}
                {option.count !== undefined && (
                  <span className="bd-field-mono" aria-hidden="true">
                    {option.count}
                  </span>
                )}
              </ToggleButton>
            ))}
          </>
        )}
      </ToggleButtonGroup>
      <ChoiceFieldMessages
        id={id}
        {...(description === undefined ? {} : { description })}
        {...(errorMessage === undefined ? {} : { errorMessage })}
        {...(isInvalid === undefined ? {} : { isInvalid })}
      />
    </div>
  );
}
