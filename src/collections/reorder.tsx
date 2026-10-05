import { Button, DropIndicator, useDragAndDrop } from "react-aria-components";
import { Icon } from "../icon/Icon.js";

import type { ReorderHandler } from "./reorder-types.js";

/** @internal React Aria hooks are implementation details, excluded from declarations. */
export function useCollectionReorder(
  entries: readonly { key: string; label: string }[],
  onReorder?: ReorderHandler,
) {
  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) =>
      [...keys].map((key) => ({
        "text/plain":
          entries.find((item) => item.key === String(key))?.label ??
          String(key),
      })),
    getAllowedDropOperations: () => ["move"],
    onReorder: (event) => {
      if (event.target.dropPosition !== "on") {
        onReorder?.([...event.keys].map(String), {
          key: String(event.target.key),
          position: event.target.dropPosition,
        });
      }
    },
    renderDropIndicator: (target) => (
      <DropIndicator target={target} className="bd-reorder-indicator" />
    ),
    renderDragPreview: (items) => (
      <div className="bd-reorder-preview">
        {items.map((item, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Drag preview payloads have no key; their order is fixed for one drag.
          <div key={index}>{item["text/plain"]}</div>
        ))}
      </div>
    ),
  });
  return onReorder ? dragAndDropHooks : undefined;
}

/** @internal Shared drag slot for collection wrappers. */
export function ReorderHandle() {
  return (
    <Button slot="drag" className="bd-reorder-handle">
      <Icon name="grip" size={16} />
    </Button>
  );
}
