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
      <div style={{ width: "min(var(--bd-measure), calc(100vw - 2rem))" }}>
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

export const ReorderableResources: Story = {
  render: () => {
    const [ordered, setOrdered] = useState([
      { id: "notes", label: "Field notes" },
      { id: "images", label: "Reference images" },
      { id: "reading", label: "Reading list" },
    ]);
    return (
      <div style={{ width: "var(--bd-panel-width)", maxWidth: "100%" }}>
        <Table
          label="Ordered resources"
          rows={ordered}
          columns={[{ id: "label", label: "Name" }]}
          renderCell={(item) => item.label}
          getItemLabel={(item) => item.label}
          onReorder={(keys, target) => {
            setOrdered((current) => {
              if (keys.includes(target.key)) return current;
              const moving = current.filter((item) => keys.includes(item.id));
              const remaining = current.filter(
                (item) => !keys.includes(item.id),
              );
              const index = remaining.findIndex(
                (item) => item.id === target.key,
              );
              if (index < 0) return current;
              remaining.splice(
                index + (target.position === "after" ? 1 : 0),
                0,
                ...moving,
              );
              return remaining;
            });
          }}
        />
      </div>
    );
  },
};
