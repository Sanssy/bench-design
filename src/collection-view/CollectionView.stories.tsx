import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../button/Button.js";
import { EmptyState } from "../empty-state/EmptyState.js";
import { FilterChip } from "../filter-chip/FilterChip.js";
import { GridList } from "../grid-list/GridList.js";
import { SearchField } from "../search-field/SearchField.js";
import { SegmentedControl } from "../segmented-control/SegmentedControl.js";
import { CollectionView } from "./CollectionView.js";

export default {
  title: "Collections/CollectionView",
  component: CollectionView,
  parameters: { fullWidth: true, layout: "centered" },
} satisfies Meta<typeof CollectionView>;
type Story = StoryObj<typeof CollectionView>;
const resources = [
  { id: "notes", label: "Field notes", format: "Text" },
  { id: "images", label: "Reference images", format: "Image" },
  { id: "reading", label: "Reading list", format: "Text" },
];
export const ResourceLibrary = {
  render: (args) => {
    const [query, setQuery] = useState("");
    const [textOnly, setTextOnly] = useState(false);
    const [layout, setLayout] = useState<"grid" | "list">("grid");
    const [reversed, setReversed] = useState(false);
    const matches = resources.filter(
      (item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) &&
        (!textOnly || item.format === "Text"),
    );
    const shown = reversed ? [...matches].reverse() : matches;
    const search = (
      <SearchField label="Search resources" value={query} onChange={setQuery} />
    );
    return (
      <div style={{ width: "min(var(--bd-measure), calc(100vw - 2rem))" }}>
        <CollectionView
          stickyToolbar={args.stickyToolbar ?? true}
          actions={args.stickyToolbar === false ? search : undefined}
          label="Resource library"
          count={resources.length}
          isEmpty={shown.length === 0}
          toolbar={
            <>
              {args.stickyToolbar !== false && search}
              <FilterChip
                label="Text only"
                isSelected={textOnly}
                onChange={setTextOnly}
              />
              <SegmentedControl
                label="View"
                value={layout}
                options={[
                  { id: "grid", label: "Grid" },
                  { id: "list", label: "List" },
                ]}
                onChange={(value) =>
                  setLayout(value === "list" ? "list" : "grid")
                }
              />
            </>
          }
          footer={
            <>
              <span>
                {shown.length} of {resources.length} shown
              </span>
              <Button onPress={() => setReversed(!reversed)}>
                Reverse order
              </Button>
            </>
          }
          emptyState={
            <EmptyState
              title="No matching resources"
              action={
                <Button
                  onPress={() => {
                    setQuery("");
                    setTextOnly(false);
                  }}
                >
                  Clear filters
                </Button>
              }
            >
              Try a different search or clear your filters.
            </EmptyState>
          }
        >
          <GridList
            label="Resources"
            items={shown}
            layout={layout}
            renderItem={(item) => item.label}
          />
        </CollectionView>
      </div>
    );
  },
} satisfies Story;
export const EmptyLibrary: Story = {
  render: () => (
    <CollectionView
      label="Resource library"
      count={0}
      countVariant="outlined"
      isEmpty
      footer="0 of 0 shown"
      emptyState={
        <EmptyState
          title="No resources yet"
          variant="editorial"
          icon="file-text"
        >
          Add a resource to start your library.
        </EmptyState>
      }
    >
      <GridList label="Resources" items={[]} renderItem={String} />
    </CollectionView>
  ),
};

export const TitleSearch: Story = {
  render: ResourceLibrary.render,
  args: { stickyToolbar: false },
};
