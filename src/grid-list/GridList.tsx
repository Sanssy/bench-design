import {
  Children,
  type CSSProperties,
  isValidElement,
  type ReactNode,
  useState,
} from "react";
import {
  GridList as AriaGridList,
  Checkbox,
  GridListItem,
} from "react-aria-components";
import { collectionKey, selectionKeys } from "../collections/keys.js";
import { ReorderHandle, useCollectionReorder } from "../collections/reorder.js";
import type { ReorderHandler } from "../collections/reorder-types.js";
import { Icon } from "../icon/Icon.js";

/** A consumer-rendered collection with stable string keys. */
export interface GridListProps<T> {
  /** Request reordering; consumers apply the new order to their data. */
  onReorder?: ReorderHandler;
  /** Readable item name for dragging and announcements. */
  getItemLabel?: (item: T) => string;
  /** Accessible collection name. */
  label: string;
  /** Ordered collection items. */
  items: readonly T[];
  /** Stable key extractor; defaults to each item's string id. */
  getKey?: (item: T) => string;
  /** Grid uses two-dimensional arrow navigation; list uses vertical arrows. */
  layout?: "grid" | "list";
  /** Maximum grid columns; explicit values use the card minimum, omission keeps two with the panel minimum. */
  columns?: number;
  /** Item inset; none lets consumer media reach the item edges. */
  itemPadding?: "default" | "none";
  /** Allowed selection cardinality. */
  selectionMode?: "none" | "single" | "multiple";
  /** Selected item treatment; accent is the default. */
  selectionVariant?: "accent" | "strong";
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
  onReorder,
  getItemLabel,
  items,
  getKey,
  layout = "grid",
  columns,
  itemPadding = "default",
  selectionMode = "none",
  selectionVariant = "accent",
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
  const renderedItems = items.map((item) => {
    const content = renderItem(item);
    return {
      key: collectionKey(item, getKey),
      content,
      label: getItemLabel?.(item) ?? itemText(content),
    };
  });
  const dragAndDropHooks = useCollectionReorder(renderedItems, onReorder);
  return (
    <div className="bd-grid-list-frame">
      {selectionMode === "multiple" && keys.length > 0 && selectionBar && (
        <div className="bd-selection-bar">{selectionBar([...keys])}</div>
      )}
      <AriaGridList
        key={onReorder ? "reorder" : "static"}
        {...(dragAndDropHooks ? { dragAndDropHooks } : {})}
        aria-label={label}
        className="bd-grid-list"
        data-variant={selectionVariant}
        style={
          {
            "--bd-grid-list-columns": Math.max(1, Math.floor(columns ?? 2)),
            "--bd-grid-list-min-column":
              columns === undefined
                ? "var(--bd-panel-width)"
                : "var(--bd-card-min-width)",
          } as CSSProperties
        }
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
        {renderedItems.map(({ key, content, label: itemLabel }) => {
          return (
            <GridListItem
              textValue={itemLabel}
              {...(onAction ? { onAction: () => onAction(key) } : {})}
              key={key}
              id={key}
              className="bd-grid-list-item"
              data-padding={itemPadding}
            >
              {onReorder && <ReorderHandle />}
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
