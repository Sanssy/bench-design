import type { ReactNode } from "react";
import {
  Collection,
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
import { Icon } from "../icon/Icon.js";
import type { useComboBoxSearch } from "./useComboBoxSearch.js";

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

export function ComboBoxList({
  search,
  footer,
}: {
  search: ReturnType<typeof useComboBoxSearch>;
  footer?: ReactNode;
}) {
  const { items, query, loading, hasError, status, remote, loadItems } = search;
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
      {footer}
    </Popover>
  );
}
