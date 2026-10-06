import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { CollectionView } from "../collection-view/CollectionView.js";
import { EmptyState } from "../empty-state/EmptyState.js";
import { FilterChip } from "../filter-chip/FilterChip.js";
import { GridList } from "../grid-list/GridList.js";
import { Inspector } from "../inspector/Inspector.js";
import { MetaList } from "../meta-list/MetaList.js";
import { SearchField } from "../search-field/SearchField.js";
import { Stack } from "../stack/Stack.js";

export default {
  title: "Recipes/Library",
  parameters: { fullWidth: true, layout: "padded" },
} satisfies Meta;
const resources = [
  { id: "notes", label: "Field notes", format: "Text" },
  { id: "images", label: "Reference images", format: "Image" },
  { id: "reading", label: "Reading list", format: "Text" },
];
export const BrowseAndInspect: StoryObj = {
  render: () => {
    const [query, setQuery] = useState("");
    const [textOnly, setTextOnly] = useState(false);
    const [keys, setKeys] = useState<string[]>([]);
    const shown = resources.filter(
      (item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) &&
        (!textOnly || item.format === "Text"),
    );
    const selected = shown.find((item) => keys.includes(item.id));
    return (
      <Stack gap={24}>
        <CollectionView
          label="Resource library"
          count={resources.length}
          isEmpty={!shown.length}
          toolbar={
            <>
              <SearchField
                label="Search resources"
                value={query}
                onChange={setQuery}
              />
              <FilterChip
                label="Text only"
                isSelected={textOnly}
                onChange={setTextOnly}
              />
            </>
          }
          footer={`${shown.length} of ${resources.length} shown`}
          emptyState={
            <EmptyState title="No matching resources">
              Change your search or turn off the filter.
            </EmptyState>
          }
        >
          <GridList
            label="Resources"
            items={shown}
            selectionMode="single"
            selectedKeys={selected ? [selected.id] : []}
            onSelectionChange={setKeys}
            renderItem={(item) => item.label}
          />
        </CollectionView>
        <Inspector
          title={selected ? selected.label : "Resource details"}
          eyebrow="Selection"
          sections={
            selected
              ? [
                  {
                    id: "details",
                    title: "Details",
                    defaultExpanded: true,
                    content: (
                      <MetaList
                        items={[
                          { term: "Format", details: selected.format },
                          { term: "Source", details: "Sample archive" },
                        ]}
                      />
                    ),
                  },
                ]
              : []
          }
          emptyState={
            <EmptyState title="No resource selected">
              Select a resource to inspect its details.
            </EmptyState>
          }
        />
      </Stack>
    );
  },
};
