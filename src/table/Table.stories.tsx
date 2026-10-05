import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Table, type TableColumn, type TableSortDescriptor } from "./Table.js";

const rows = [
  { id: "a", label: "Field notes", amount: 12 },
  { id: "b", label: "Reference images", amount: 8 },
  { id: "c", label: "Reading list", amount: 24 },
];
const columns: TableColumn[] = [
  {
    id: "label",
    label: "Name",
    allowsSorting: true,
    width: "var(--bd-panel-width)",
  },
  { id: "amount", label: "Count", align: "end", allowsSorting: true },
];
export default {
  title: "Collections/Table",
  component: Table,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Table>;
type Story = StoryObj<typeof Table>;
export const ResourceInventory: Story = {
  render: () => {
    const [sort, setSort] = useState<TableSortDescriptor>({
      column: "label",
      direction: "ascending",
    });
    const [keys, setKeys] = useState<string[]>([]);
    const sorted = [...rows].sort((a, b) => {
      const order =
        sort.column === "amount"
          ? a.amount - b.amount
          : a.label.localeCompare(b.label);
      return sort.direction === "ascending" ? order : -order;
    });
    return (
      <div style={{ width: "var(--bd-measure)", maxWidth: "100%" }}>
        <Table
          label="Resource inventory"
          rows={sorted}
          columns={columns}
          renderCell={(row, column) =>
            column === "label" ? row.label : row.amount
          }
          sortDescriptor={sort}
          onSortChange={setSort}
          selectionMode="multiple"
          selectedKeys={keys}
          onSelectionChange={setKeys}
        />
      </div>
    );
  },
};
export const CompactInventory: Story = {
  render: () => (
    <div style={{ width: "var(--bd-panel-width)", maxWidth: "100%" }}>
      <Table
        label="Compact inventory"
        columns={columns}
        rows={rows}
        renderCell={(row, column) =>
          column === "label" ? row.label : row.amount
        }
        selectionMode="single"
        stickyHeader={false}
      />
      <Table
        label="Archived inventory"
        columns={columns}
        rows={[]}
        renderCell={() => null}
        renderEmpty={() => <p>No archived resources.</p>}
      />
    </div>
  ),
};
