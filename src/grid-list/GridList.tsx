import { Children, isValidElement, type ReactNode, useState } from "react";
import {
  GridList as AriaGridList,
  Checkbox,
  GridListItem,
} from "react-aria-components";
import { collectionKey, selectionKeys } from "../collections/keys.js";
import { Icon } from "../icon/Icon.js";

/** A consumer-rendered collection with stable string keys. */
export interface GridListProps<T> {
  /** Accessible collection name. */
  label: string;
  /** Ordered collection items. */
  items: readonly T[];
  /** Stable key extractor; defaults to each item's string id. */
  getKey?: (item: T) => string;
  /** Grid uses two-dimensional arrow navigation; list uses vertical arrows. */
  layout?: "grid" | "list";
  /** Allowed selection cardinality. */
  selectionMode?: "none" | "single" | "multiple";
  /** Controlled selected keys. */
  selectedKeys?: readonly string[];
  /** Initial uncontrolled selected keys. */
  defaultSelectedKeys?: readonly string[];
  /** Called with the complete selected key list. */
  onSelectionChange?: (keys: string[]) => void;
  /** Called when an item is activated. */
  onAction?: (key: string) => void;
  /** Consumer-owned item content; include readable text for typeahead. */
  renderItem: (item: T) => ReactNode;
  /** Content for an empty collection. */
  renderEmpty?: () => ReactNode;
  /** Actions shown when one or more items are selected. */
  selectionBar?: (keys: string[]) => ReactNode;
}
function itemText(content: ReactNode): string {
  return Children.toArray(content)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number")
        return String(child);
      return isValidElement<{ children?: ReactNode }>(child)
        ? itemText(child.props.children)
        : "";
    })
    .join(" ");
}
/** An accessible grid or list with React Aria navigation and selection. */
export function GridList<T>({
  label,
  items,
  getKey,
  layout = "grid",
  selectionMode = "none",
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  onAction,
  renderItem,
  renderEmpty,
  selectionBar,
}: GridListProps<T>) {
  const [uncontrolledKeys, setUncontrolledKeys] = useState<string[]>(() => [
    ...(defaultSelectedKeys ?? []),
  ]);
  const keys = selectedKeys ?? uncontrolledKeys;
  return (
    <div className="bd-grid-list-frame">
      {selectionMode === "multiple" && keys.length > 0 && selectionBar && (
        <div className="bd-selection-bar">{selectionBar([...keys])}</div>
      )}
      <AriaGridList
        aria-label={label}
        className="bd-grid-list"
        layout={layout === "grid" ? "grid" : "stack"}
        orientation="vertical"
        selectionMode={selectionMode}
        selectedKeys={keys}
        onSelectionChange={(selection) => {
          const next = selectionKeys(
            selection,
            items.map((item) => collectionKey(item, getKey)),
          );
          setUncontrolledKeys(next);
          onSelectionChange?.(next);
        }}
        {...(renderEmpty ? { renderEmptyState: renderEmpty } : {})}
      >
        {items.map((item) => {
          const content = renderItem(item);
          return (
            <GridListItem
              textValue={itemText(content)}
              {...(onAction
                ? { onAction: () => onAction(collectionKey(item, getKey)) }
                : {})}
              key={collectionKey(item, getKey)}
              id={collectionKey(item, getKey)}
              className="bd-grid-list-item"
            >
              {selectionMode === "multiple" && (
                <Checkbox slot="selection" className="bd-checkbox">
                  <span className="bd-choice-box">
                    <Icon name="check" size={16} />
                  </span>
                </Checkbox>
              )}
              <div className="bd-grid-list-content">{content}</div>
            </GridListItem>
          );
        })}
      </AriaGridList>
    </div>
  );
}
