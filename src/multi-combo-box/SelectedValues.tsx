import { useEffect, useMemo, useRef } from "react";
import type { FieldOption } from "../forms/FieldProps.js";
import { SelectedTags } from "./SelectedTags.js";

export function SelectedValues({
  keys,
  options,
  isDisabled,
  onRemove,
}: {
  keys: readonly (string | number)[];
  options: readonly FieldOption[];
  isDisabled: boolean;
  onRemove(keys: Set<string | number>): void;
}) {
  const cache = useRef(new Map<string, FieldOption>());
  const current = useMemo(
    () => new Map(options.map((option) => [option.id, option])),
    [options],
  );
  const items = keys.map(
    (key) =>
      current.get(String(key)) ??
      cache.current.get(String(key)) ?? { id: String(key), label: String(key) },
  );
  useEffect(() => {
    cache.current = new Map(items.map((item) => [item.id, item]));
  }, [items]);
  if (!items.length) return null;
  return (
    <SelectedTags items={items} isDisabled={isDisabled} onRemove={onRemove} />
  );
}
