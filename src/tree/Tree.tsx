import {
  Tree as AriaTree,
  Button,
  Checkbox,
  Collection,
  TreeItem,
  TreeItemContent,
} from "react-aria-components";
import { selectionKeys } from "../collections/keys.js";
import { ReorderHandle, useCollectionReorder } from "../collections/reorder.js";
import type { ReorderHandler } from "../collections/reorder-types.js";
import { Icon } from "../icon/Icon.js";

/** A generic hierarchy node with a stable unique identifier. */
export interface TreeNode {
  /** Identifier unique across the entire tree. */
  id: string;
  /** Visible and accessible item text. */
  label: string;
  /** Optional consumer-provided count. */
  count?: number;
  /** Nested hierarchy nodes. */
  children?: readonly TreeNode[];
}
/** A hierarchy with expansion, selection and activation. */
export interface TreeProps {
  /** Request reordering; consumers apply the new order to their data. */
  onReorder?: ReorderHandler;
  /** Readable item name for dragging and announcements. */
  getItemLabel?: (item: TreeNode) => string;
  /** Accessible hierarchy name. */
  label: string;
  /** Root nodes in display order. */
  items: readonly TreeNode[];
  /** Controlled expanded identifiers. */
  expandedKeys?: readonly string[];
  /** Initially expanded identifiers. */
  defaultExpandedKeys?: readonly string[];
  /** Called with the complete expanded key list. */
  onExpandedChange?: (keys: string[]) => void;
  /** Allowed selection cardinality. */
  selectionMode?: "none" | "single" | "multiple";
  /** Controlled selected identifiers. */
  selectedKeys?: readonly string[];
  /** Called with the complete selected key list. */
  onSelectionChange?: (keys: string[]) => void;
  /** Called when a node is activated. */
  onAction?: (id: string) => void;
}
function allKeys(items: readonly TreeNode[]): string[] {
  return items.flatMap((item) => [item.id, ...allKeys(item.children ?? [])]);
}
/** A React Aria tree; hierarchy state and keyboard behavior stay with React Aria. */
export function Tree({
  label,
  onReorder,
  getItemLabel,
  items,
  expandedKeys,
  defaultExpandedKeys,
  onExpandedChange,
  selectionMode = "none",
  selectedKeys,
  onSelectionChange,
  onAction,
}: TreeProps) {
  const flatten = (nodes: readonly TreeNode[]): TreeNode[] =>
    nodes.flatMap((node) => [node, ...flatten(node.children ?? [])]);
  const dragAndDropHooks = useCollectionReorder(
    flatten(items).map((item) => ({
      key: item.id,
      label: getItemLabel?.(item) ?? item.label,
    })),
    onReorder,
  );
  const renderNode = (item: TreeNode) => (
    <TreeItem
      id={item.id}
      textValue={getItemLabel?.(item) ?? item.label}
      className="bd-tree-item"
      {...(onAction ? { onAction: () => onAction(item.id) } : {})}
    >
      <TreeItemContent>
        {({ hasChildItems, level }) => (
          <div
            className="bd-tree-content"
            style={{
              paddingInlineStart: `calc((${level} - 1) * var(--bd-space-24))`,
            }}
          >
            {onReorder && <ReorderHandle />}
            {hasChildItems ? (
              <Button slot="chevron" className="bd-tree-chevron">
                <Icon name="chevron-down" size={16} />
              </Button>
            ) : (
              <span
                className="bd-tree-chevron-placeholder"
                aria-hidden="true"
              />
            )}
            {selectionMode === "multiple" && (
              <Checkbox slot="selection" className="bd-checkbox">
                <span className="bd-choice-box">
                  <Icon name="check" size={16} />
                </span>
              </Checkbox>
            )}
            <span className="bd-tree-label">{item.label}</span>
            {item.count !== undefined && (
              <span className="bd-tree-count">{item.count}</span>
            )}
          </div>
        )}
      </TreeItemContent>
      {item.children?.length ? (
        <Collection items={item.children}>{renderNode}</Collection>
      ) : null}
    </TreeItem>
  );
  return (
    <AriaTree
      key={onReorder ? "reorder" : "static"}
      {...(dragAndDropHooks ? { dragAndDropHooks } : {})}
      aria-label={label}
      className="bd-tree"
      items={items}
      selectionMode={selectionMode}
      {...(selectedKeys === undefined ? {} : { selectedKeys })}
      {...(expandedKeys === undefined ? {} : { expandedKeys })}
      {...(defaultExpandedKeys === undefined ? {} : { defaultExpandedKeys })}
      onExpandedChange={(keys) => onExpandedChange?.([...keys].map(String))}
      onSelectionChange={(selection) =>
        onSelectionChange?.(selectionKeys(selection, allKeys(items)))
      }
    >
      {renderNode}
    </AriaTree>
  );
}
