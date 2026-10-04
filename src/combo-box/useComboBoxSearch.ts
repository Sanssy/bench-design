import { useState } from "react";
import { useFilter } from "react-aria-components";
import type { FieldOption } from "../forms/FieldProps.js";
import type { ComboBoxProps } from "./ComboBox.js";
import { useComboBoxItems } from "./useComboBoxItems.js";

export function useComboBoxSearch(
  options: readonly FieldOption[],
  loadItems: ComboBoxProps["loadItems"],
) {
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
      : `${items.length} ${loadItems && remote.hasMore ? "loaded" : items.length === 1 ? "result" : "results"}`;
  return {
    items,
    query,
    loading,
    hasError,
    status,
    remote,
    loadItems,
    onInputChange(value: string) {
      setQuery(value);
      if (loadItems) remote.setQuery(value);
    },
    onOpenChange(isOpen: boolean, trigger?: string) {
      if (!isOpen || trigger !== "manual" || query === "") return;
      setQuery("");
      if (loadItems) remote.setQuery("");
    },
  };
}
