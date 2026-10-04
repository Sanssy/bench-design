import { useState } from "react";
import {
  ComboBox as AriaComboBox,
  Button,
  ComboBoxValue,
  ComboBoxValueContext,
  Input,
} from "react-aria-components";
import { ComboBoxList } from "../combo-box/ComboBoxList.js";
import { useComboBoxSearch } from "../combo-box/useComboBoxSearch.js";
import { FieldLabel, FieldMessages } from "../forms/FieldContent.js";
import type { FieldOption, FieldProps } from "../forms/FieldProps.js";
import { Icon } from "../icon/Icon.js";
import { ClearChoices } from "./ClearChoices.js";
import { SelectedValues } from "./SelectedValues.js";

/** Searchable multiple choices with local or server supplied options. */
export interface MultiComboBoxProps extends FieldProps {
  /** Ordered local choices with unique stable identifiers. */
  options?: readonly FieldOption[];
  /** Server search; absent input cursor starts a page, absent output cursor ends it. */
  loadItems?: (request: {
    query: string;
    signal: AbortSignal;
    cursor?: string;
  }) => Promise<{ items: readonly FieldOption[]; cursor?: string }>;
  /** Form submission name. */
  name?: string;
  /** Controlled selected options, including saved labels; an empty array clears selection. */
  selectedOptions?: readonly FieldOption[];
  /** Initial uncontrolled selected options, including saved labels. */
  defaultSelectedOptions?: readonly FieldOption[];
  /** Called with every selected option, or an empty array when cleared. */
  onSelectionChange?: (options: FieldOption[]) => void;
  /** Hint displayed until the user types or chooses an option. */
  placeholder?: string;
  /** Custom validation message; return null for a valid selection. */
  validate?: (keys: string[]) => string | null;
}

/** Multiple searchable choices with removable tags and shared list primitives. */
export function MultiComboBox({
  label,
  description,
  errorMessage,
  isRequired,
  isDisabled,
  isInvalid,
  options = [],
  loadItems,
  name,
  selectedOptions,
  defaultSelectedOptions,
  onSelectionChange,
  placeholder,
  validate,
}: MultiComboBoxProps) {
  const [uncontrolledOptions, setUncontrolledOptions] = useState<
    readonly FieldOption[]
  >(defaultSelectedOptions ?? []);
  const selected = selectedOptions ?? uncontrolledOptions;
  const search = useComboBoxSearch(options, loadItems);
  const { items } = search;
  return (
    <AriaComboBox
      className="bd-field"
      selectionMode="multiple"
      items={items}
      allowsEmptyCollection
      {...(name === undefined ? {} : { name })}
      value={selected.map((option) => option.id)}
      inputValue={search.query}
      {...(isRequired === undefined ? {} : { isRequired })}
      {...(isDisabled === undefined ? {} : { isDisabled })}
      {...(isInvalid === undefined ? {} : { isInvalid })}
      onInputChange={search.onInputChange}
      onOpenChange={(isOpen, trigger) => {
        search.onOpenChange(isOpen, trigger);
        if (!isOpen && search.query) search.onInputChange("");
      }}
      onChange={(keys) => {
        const next = keys.flatMap((key) => {
          const option =
            selected.find((option) => option.id === String(key)) ??
            items.find((option) => option.id === String(key));
          return option ? [option] : [];
        });
        setUncontrolledOptions(next);
        onSelectionChange?.(next);
      }}
      validate={({ value }) => validate?.(value.map(String)) ?? null}
      disabledKeys={items
        .filter((option) => option.isDisabled)
        .map((option) => option.id)}
    >
      <FieldLabel
        label={label}
        {...(isRequired === undefined ? {} : { isRequired })}
      />
      <div className="bd-field-control bd-search-control bd-multi-control">
        {/* Tags have their own accessible group, rather than describing the input. */}
        <ComboBoxValueContext.Provider value={null}>
          <ComboBoxValue<FieldOption> className="bd-multi-value">
            {({ state }) =>
              Array.isArray(state.value) && state.value.length > 0 ? (
                <div inert={state.isOpen}>
                  <SelectedValues
                    keys={Array.isArray(state.value) ? state.value : []}
                    options={selected}
                    isDisabled={isDisabled ?? false}
                    onRemove={(keys) =>
                      state.setValue(
                        (Array.isArray(state.value) ? state.value : []).filter(
                          (key) => !keys.has(key),
                        ),
                      )
                    }
                  />
                </div>
              ) : null
            }
          </ComboBoxValue>
        </ComboBoxValueContext.Provider>
        <Input
          className="bd-search-input"
          {...(placeholder === undefined ? {} : { placeholder })}
        />
        <Button className="bd-search-clear">
          <Icon name="chevron-down" size={20} />
        </Button>
      </div>
      <ComboBoxList search={search} footer={<ClearChoices />} />
      <FieldMessages
        {...(description === undefined ? {} : { description })}
        {...(errorMessage === undefined ? {} : { errorMessage })}
      />
    </AriaComboBox>
  );
}
