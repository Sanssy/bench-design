import type { ReactNode } from "react";
import {
  Table as AriaTable,
  Cell,
  Checkbox,
  Column,
  Row,
  TableBody,
  TableHeader,
} from "react-aria-components";
import { collectionKey, selectionKeys } from "../collections/keys.js";
import { ReorderHandle, useCollectionReorder } from "../collections/reorder.js";
import type { ReorderHandler } from "../collections/reorder-types.js";
import { Icon } from "../icon/Icon.js";

/** A column's presentation and sorting capability. */
export interface TableColumn {
  /** Unique column identifier. */
  id: string;
  /** Visible column heading. */
  label: string;
  /** Text alignment; use end for numeric columns. */
  align?: "start" | "end";
  /** Allow consumers to request sorting from this column. */
  allowsSorting?: boolean;
  /** CSS column width in pixels or a CSS length. */
  width?: number | string;
}
/** Consumer-owned sorting state; the wrapper does not reorder rows. */
export interface TableSortDescriptor {
  /** Identifier of the sorted column. */
  column: string;
  /** Current sort direction. */
  direction: "ascending" | "descending";
}
/** An accessible table with consumer-rendered cells. */
export interface TableProps<T> {
  /** Request reordering; consumers apply the new order to their data. */
  onReorder?: ReorderHandler;
  /** Readable item name for dragging and announcements. */
  getItemLabel?: (item: T) => string;
  /** Accessible table name. */
  label: string;
  /** Ordered visible columns. */
  columns: readonly TableColumn[];
  /** Ordered rows; consumers apply requested sorting. */
  rows: readonly T[];
  /** Stable key extractor; defaults to a string id. */
  getKey?: (row: T) => string;
  /** Cell content for a row and column identifier. */
  renderCell: (row: T, columnId: string) => ReactNode;
  /** Controlled sorting state. */
  sortDescriptor?: TableSortDescriptor;
  /** Called when a column requests sorting. */
  onSortChange?: (descriptor: TableSortDescriptor) => void;
  /** Allowed selection cardinality. */
  selectionMode?: "none" | "single" | "multiple";
  /** Controlled selected row identifiers. */
  selectedKeys?: readonly string[];
  /** Called with all selected identifiers. */
  onSelectionChange?: (keys: string[]) => void;
  /** Keep column headings visible within the table's scrolling frame. */
  stickyHeader?: boolean;
  /** Content for an empty table body. */
  renderEmpty?: () => ReactNode;
}
/** A React Aria table that contains horizontal overflow within its own frame. */
export function Table<T>({
  label,
  onReorder,
  getItemLabel,
  columns,
  rows,
  getKey,
  renderCell,
  sortDescriptor,
  onSortChange,
  selectionMode = "none",
  selectedKeys,
  onSelectionChange,
  stickyHeader = true,
  renderEmpty,
}: TableProps<T>) {
  const dragAndDropHooks = useCollectionReorder(
    rows.map((row) => ({
      key: collectionKey(row, getKey),
      label: getItemLabel?.(row) ?? collectionKey(row, getKey),
    })),
    onReorder,
  );
  return (
    <div className="bd-table-frame" data-sticky={stickyHeader || undefined}>
      <AriaTable
        key={onReorder ? "reorder" : "static"}
        {...(dragAndDropHooks ? { dragAndDropHooks } : {})}
        aria-label={label}
        className="bd-table"
        selectionMode={selectionMode}
        {...(selectedKeys === undefined ? {} : { selectedKeys })}
        onSelectionChange={(selection) =>
          onSelectionChange?.(
            selectionKeys(
              selection,
              rows.map((row) => collectionKey(row, getKey)),
            ),
          )
        }
        {...(sortDescriptor === undefined ? {} : { sortDescriptor })}
        onSortChange={(descriptor) =>
          onSortChange?.({
            column: String(descriptor.column),
            direction: descriptor.direction,
          })
        }
      >
        <TableHeader>
          {onReorder && <Column className="bd-table-drag" />}
          {selectionMode === "multiple" && (
            <Column className="bd-table-selection">
              <Checkbox slot="selection" className="bd-checkbox">
                <span className="bd-choice-box">
                  <Icon name="check" size={16} />
                </span>
              </Checkbox>
            </Column>
          )}
          {columns.map((column, index) => (
            <Column
              key={column.id}
              id={column.id}
              className="bd-table-heading"
              isRowHeader={index === 0}
              allowsSorting={column.allowsSorting ?? false}
              style={{
                textAlign: column.align ?? "start",
                ...(column.width === undefined ? {} : { width: column.width }),
              }}
            >
              {({ sortDirection }) => (
                <>
                  <span>{column.label}</span>
                  {column.allowsSorting && (
                    <span
                      className="bd-table-sort"
                      data-direction={sortDirection}
                    >
                      <Icon name="arrow-right" size={16} />
                    </span>
                  )}
                </>
              )}
            </Column>
          ))}
        </TableHeader>
        <TableBody {...(renderEmpty ? { renderEmptyState: renderEmpty } : {})}>
          {rows.map((row) => (
            <Row
              key={collectionKey(row, getKey)}
              id={collectionKey(row, getKey)}
              className="bd-table-row"
              textValue={getItemLabel?.(row) ?? collectionKey(row, getKey)}
            >
              {onReorder && (
                <Cell className="bd-table-drag" focusMode="child">
                  <ReorderHandle />
                </Cell>
              )}
              {selectionMode === "multiple" && (
                <Cell className="bd-table-selection">
                  <Checkbox slot="selection" className="bd-checkbox">
                    <span className="bd-choice-box">
                      <Icon name="check" size={16} />
                    </span>
                  </Checkbox>
                </Cell>
              )}
              {columns.map((column) => (
                <Cell
                  key={column.id}
                  className="bd-table-cell"
                  data-align={column.align ?? "start"}
                  focusMode="cell"
                >
                  {renderCell(row, column.id)}
                </Cell>
              ))}
            </Row>
          ))}
        </TableBody>
      </AriaTable>
    </div>
  );
}
