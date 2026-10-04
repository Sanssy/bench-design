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
  /** Controlled selected identifier; null clears selection. */
  selectedKey?: string | null;
  /** Initial uncontrolled selected identifier. */
  defaultSelectedKey?: string;
  /** Called with the selected identifier, or null when cleared. */
  onSelectionChange?: (key: string | null) => void;
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
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  placeholder,
  validate,
}: ComboBoxProps) {
  const search = useComboBoxSearch(options, loadItems);
  const { items } = search;
  return (
    <AriaComboBox
      className="bd-field"
      items={items}
      allowsEmptyCollection
      {...(name === undefined ? {} : { name })}
      {...(selectedKey === undefined ? {} : { selectedKey })}
      {...(defaultSelectedKey === undefined ? {} : { defaultSelectedKey })}
      {...(isRequired === undefined ? {} : { isRequired })}
      {...(isDisabled === undefined ? {} : { isDisabled })}
      {...(isInvalid === undefined ? {} : { isInvalid })}
      onInputChange={search.onInputChange}
      onOpenChange={search.onOpenChange}
      onSelectionChange={(key) =>
        onSelectionChange?.(key == null ? null : String(key))
      }
      validate={(key) => validate?.(key == null ? null : String(key)) ?? null}
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
