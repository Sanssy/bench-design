import { useEffect, useState } from "react";
import { ComboBox as AriaComboBox, Button, Input } from "react-aria-components";
import { FieldLabel, FieldMessages } from "../forms/FieldContent.js";
import type { FieldOption, FieldProps } from "../forms/FieldProps.js";
import { Icon } from "../icon/Icon.js";
import { ComboBoxList } from "./ComboBoxList.js";
import { useComboBoxSearch } from "./useComboBoxSearch.js";

/** A searchable single choice with local or server supplied options. */
export interface ComboBoxProps extends FieldProps {
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
  /** Controlled selected option, including its saved label; null clears selection. */
  selectedOption?: FieldOption | null;
  /** Initial uncontrolled selected option, including its saved label. */
  defaultSelectedOption?: FieldOption;
  /** Called with the selected option, or null when cleared. */
  onSelectionChange?: (option: FieldOption | null) => void;
  /** Hint displayed until the user types or chooses an option. */
  placeholder?: string;
  /** Custom validation message; return null for a valid selection. */
  validate?: (key: string | null) => string | null;
}

/** A React Aria combo box with shared field and option primitives. */
export function ComboBox({
  label,
  description,
  errorMessage,
  isRequired,
  isDisabled,
  isInvalid,
  options = [],
  loadItems,
  name,
  selectedOption,
  defaultSelectedOption,
  onSelectionChange,
  placeholder,
  validate,
}: ComboBoxProps) {
  const [uncontrolledOption, setUncontrolledOption] =
    useState<FieldOption | null>(defaultSelectedOption ?? null);
  const selected =
    selectedOption === undefined ? uncontrolledOption : selectedOption;
  const [inputValue, setInputValue] = useState(selected?.label ?? "");
  // Keyed on content: an equal inline option must not reset typed text.
  const selectedLabel = selected?.label ?? "";
  useEffect(() => {
    setInputValue(selectedLabel);
  }, [selectedLabel]);
  const search = useComboBoxSearch(options, loadItems);
  const { items } = search;
  return (
    <AriaComboBox
      className="bd-field"
      items={items}
      allowsEmptyCollection
      {...(name === undefined ? {} : { name })}
      value={selected?.id ?? null}
      inputValue={inputValue}
      {...(isRequired === undefined ? {} : { isRequired })}
      {...(isDisabled === undefined ? {} : { isDisabled })}
      {...(isInvalid === undefined ? {} : { isInvalid })}
      onInputChange={(value) => {
        setInputValue(value);
        search.onInputChange(value);
        if (value === "" && selected) {
          setUncontrolledOption(null);
          onSelectionChange?.(null);
        }
      }}
      onOpenChange={(isOpen, trigger) => {
        search.onOpenChange(isOpen, trigger);
        if (!isOpen) setInputValue(selected?.label ?? "");
      }}
      onChange={(key) => {
        const next =
          key == null
            ? null
            : (items.find((item) => item.id === String(key)) ?? selected);
        setUncontrolledOption(next);
        setInputValue(
          (selectedOption === undefined ? next : selectedOption)?.label ?? "",
        );
        onSelectionChange?.(next);
      }}
      validate={({ value }) =>
        validate?.(value == null ? null : String(value)) ?? null
      }
      disabledKeys={items
        .filter((option) => option.isDisabled)
        .map((option) => option.id)}
    >
      <FieldLabel
        label={label}
        {...(isRequired === undefined ? {} : { isRequired })}
      />
      <div className="bd-field-control bd-search-control">
        <Input
          className="bd-search-input"
          {...(placeholder === undefined ? {} : { placeholder })}
        />
        <Button className="bd-search-clear">
          <Icon name="chevron-down" size={20} />
        </Button>
      </div>
      <ComboBoxList search={search} />
      <FieldMessages
        {...(description === undefined ? {} : { description })}
        {...(errorMessage === undefined ? {} : { errorMessage })}
      />
    </AriaComboBox>
  );
}
