/** Consumer-owned destination for a reorder request. */
export interface ReorderTarget {
  /** Stable destination item identifier. */
  key: string;
  /** Insert relative to the destination; nesting is not requested. */
  position: "before" | "after";
}
/** A request to move keys; consumers apply it to their own collection. */
export type ReorderHandler = (keys: string[], target: ReorderTarget) => void;
