import { useState } from "react";
import {
  ComboBox as AriaComboBox,
  Button,
  Collection,
  Input,
  ListBox,
  ListBoxItem,
  ListBoxLoadMoreItem,
  ListLayout,
  Popover,
  Text,
  useFilter,
  Virtualizer,
} from "react-aria-components";
import { Button as DesignButton } from "../button/Button.js";
import { FieldLabel, FieldMessages } from "../forms/FieldContent.js";
import type { FieldOption, FieldProps } from "../forms/FieldProps.js";
import { Icon } from "../icon/Icon.js";
import { useComboBoxItems } from "./useComboBoxItems.js";

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

function Highlight({ label, query }: { label: string; query: string }) {
  const { contains } = useFilter({ sensitivity: "base" });
  const fragments = [];
  let start = 0;
  if (query) {
    for (let index = 0; index <= label.length - query.length; index++) {
      const fragment = label.slice(index, index + query.length);
      if (contains(fragment, query)) {
        fragments.push(
          label.slice(start, index),
          <u key={index}>{fragment}</u>,
        );
        start = index + query.length;
        index = start - 1;
      }
    }
  }
  fragments.push(label.slice(start));
  return <>{fragments}</>;
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
  const [query, setQuery] = useState("");
  const { contains } = useFilter({ sensitivity: "base" });
  const remote = useComboBoxItems(loadItems);
  const items = loadItems
    ? remote.isLoading && remote.loadingState !== "loadingMore"
      ? []
      : remote.items
    : options.filter((option) => contains(option.label, query));
  const hasError = !!loadItems && remote.loadingState === "error";
  const loading = !!loadItems && remote.isLoading;
  const status = loading
    ? "Loading results…"
    : hasError
      ? "Could not load results."
      : `${items.length} ${loadItems && remote.hasMore ? "loaded" : "results"}`;
  const listBox = (
    <ListBox
      className={`bd-option-list bd-data-list${items.length >= 100 ? " bd-data-list-virtual" : ""}`}
      dependencies={[query]}
      renderEmptyState={() =>
        loading || hasError ? null : "No results. Try a different search."
      }
    >
      <Collection items={items} dependencies={[query]}>
        {(option) => (
          <ListBoxItem
            id={option.id}
            textValue={option.label}
            className="bd-option bd-data-option"
          >
            <span>
              <Text slot="label">
                <Highlight label={option.label} query={query} />
              </Text>
              {option.description && (
                <Text slot="description" className="bd-option-description">
                  {option.description}
                </Text>
              )}
            </span>
            <Icon name="check" size={16} />
          </ListBoxItem>
        )}
      </Collection>
      {loadItems && remote.hasMore && !hasError && (
        <ListBoxLoadMoreItem isLoading={loading} onLoadMore={remote.loadMore} />
      )}
    </ListBox>
  );
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
      onInputChange={(value) => {
        setQuery(value);
        if (loadItems) remote.setQuery(value);
      }}
      // Opening with the button or arrow shows every option, not the typed text.
      onOpenChange={(isOpen, trigger) => {
        if (!isOpen || trigger !== "manual" || query === "") return;
        setQuery("");
        if (loadItems) remote.setQuery("");
      }}
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
      <Popover
        className="bd-popover bd-choice-popover bd-data-popover"
        placement="bottom start"
      >
        <span className="bd-field-description" role="status" aria-live="polite">
          {status}
        </span>

        {loading && (
          <span className="bd-list-loading">
            <span className="bd-loading-indicator" aria-hidden="true" />
            Loading…
          </span>
        )}
        {hasError && (
          <div className="bd-list-message">
            Could not load results.{" "}
            <DesignButton variant="secondary" onPress={remote.retry}>
              Try again
            </DesignButton>
          </div>
        )}
        {items.length >= 100 ? (
          <Virtualizer
            layout={ListLayout}
            layoutOptions={{ rowSize: 44, loaderSize: 44 }}
          >
            {listBox}
          </Virtualizer>
        ) : (
          listBox
        )}
      </Popover>
      <FieldMessages
        {...(description === undefined ? {} : { description })}
        {...(errorMessage === undefined ? {} : { errorMessage })}
      />
    </AriaComboBox>
  );
}
