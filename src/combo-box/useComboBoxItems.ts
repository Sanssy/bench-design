import { useRef, useState } from "react";
import { type AsyncListData, useAsyncList } from "react-aria-components";
import type { FieldOption } from "../forms/FieldProps.js";
import type { ComboBoxProps } from "./ComboBox.js";

function waitForSearch(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException("Search cancelled", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, 250);
    if (signal.aborted) abort();
    else signal.addEventListener("abort", abort, { once: true });
  });
}

interface ComboBoxItems extends AsyncListData<FieldOption> {
  hasMore: boolean;
  setQuery(query: string): void;
  retry(): void;
}

export function useComboBoxItems(
  loadItems: ComboBoxProps["loadItems"],
): ComboBoxItems {
  const [hasMore, setHasMore] = useState(false);
  const [completedQuery, setCompletedQuery] = useState("");
  const failedCursor = useRef<string | undefined>(undefined);
  const list = useAsyncList<FieldOption>({
    getKey: (item) => item.id,
    load: async ({ filterText = "", signal, cursor }) => {
      if (!loadItems) return { items: [] };
      if (cursor === undefined) await waitForSearch(signal);
      try {
        const response = await loadItems({
          query: filterText,
          signal,
          ...(cursor === undefined ? {} : { cursor }),
        });
        if (signal.aborted)
          throw new DOMException("Search cancelled", "AbortError");
        setHasMore(response.cursor !== undefined);
        setCompletedQuery(filterText);
        failedCursor.current = undefined;
        return response;
      } catch (error) {
        if (!signal.aborted) failedCursor.current = cursor;
        throw error;
      }
    },
  });
  return {
    ...list,
    items: list.filterText === completedQuery ? list.items : [],
    hasMore,
    setQuery(query: string) {
      setHasMore(false);
      list.setFilterText(query);
    },
    retry() {
      if (failedCursor.current === undefined) list.reload();
      else list.loadMore();
    },
  };
}
