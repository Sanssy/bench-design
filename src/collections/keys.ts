/** Resolve the consumer's identifier without exposing collection-library types. */
export function collectionKey<T>(
  item: T,
  getKey?: (item: T) => string,
): string {
  if (getKey) return getKey(item);
  if (
    typeof item === "object" &&
    item !== null &&
    "id" in item &&
    typeof item.id === "string"
  )
    return item.id;
  throw new Error("Collection items need a string id or a getKey function.");
}
/** Expand select-all at the wrapper boundary. */
export function selectionKeys(
  selection: "all" | Set<string | number>,
  allKeys: readonly string[],
): string[] {
  return selection === "all" ? [...allKeys] : [...selection].map(String);
}
