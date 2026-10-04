import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FilterChip } from "../filter-chip/FilterChip.js";
import { SearchField } from "../search-field/SearchField.js";
import { FilterBar } from "./FilterBar.js";
export default {
  title: "Form/FilterBar",
  component: FilterBar,
  parameters: { layout: "centered" },
} satisfies Meta<typeof FilterBar>;
type Story = StoryObj<typeof FilterBar>;
function LibraryFilters() {
  const [available, setAvailable] = useState(false);
  const [query, setQuery] = useState("");
  return (
    <FilterBar
      resultCount={available ? 12 : 42}
      activeCount={Number(available) + Number(query.length > 0)}
      onClearFilters={() => {
        setAvailable(false);
        setQuery("");
      }}
      search={
        <SearchField label="Search library" value={query} onChange={setQuery} />
      }
    >
      <FilterChip
        label="Available"
        isSelected={available}
        onChange={setAvailable}
      />
      <FilterChip label="Archived" isDisabled />
    </FilterBar>
  );
}
export const Default: Story = { render: () => <LibraryFilters /> };
export const Mobile: Story = {
  render: () => <LibraryFilters />,
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
