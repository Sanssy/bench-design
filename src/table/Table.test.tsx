import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { Table } from "./Table.js";

const columns = [
  { id: "label", label: "Name", allowsSorting: true },
  { id: "amount", label: "Amount", align: "end" as const },
];
const rows = [
  { id: "a", label: "Alpha", amount: 12 },
  { id: "b", label: "Beta", amount: 8 },
];
const cell = (row: (typeof rows)[number], column: string) =>
  column === "label" ? row.label : row.amount;
test("header requests sorting and reflects the controlled direction", async () => {
  const sort = vi.fn();
  render(
    <Table
      label="Items"
      columns={columns}
      rows={rows}
      renderCell={cell}
      sortDescriptor={{ column: "label", direction: "ascending" }}
      onSortChange={sort}
    />,
  );
  const header = screen.getByRole("columnheader", { name: /Name/ });
  expect(header).toHaveAttribute("aria-sort", "ascending");
  await userEvent.click(header);
  expect(sort).toHaveBeenLastCalledWith({
    column: "label",
    direction: "descending",
  });
});
test("selection reports keys while controlled state stays unchanged", async () => {
  const change = vi.fn();
  render(
    <Table
      label="Items"
      columns={columns}
      rows={rows}
      renderCell={cell}
      selectionMode="multiple"
      selectedKeys={["b"]}
      onSelectionChange={change}
    />,
  );
  await userEvent.click(screen.getByRole("checkbox", { name: /Alpha/ }));
  expect(change).toHaveBeenLastCalledWith(["b", "a"]);
  expect(screen.getByRole("row", { name: /Alpha/ })).toHaveAttribute(
    "aria-selected",
    "false",
  );
});
test("arrows move between cells", async () => {
  render(
    <Table
      label="Items"
      columns={columns}
      rows={rows}
      renderCell={cell}
      selectionMode="single"
    />,
  );
  await screen.findByRole("grid");
  await userEvent.tab();
  await userEvent.keyboard("{ArrowRight}");
  await userEvent.keyboard("{ArrowRight}");
  expect(screen.getByRole("gridcell", { name: "12" })).toHaveFocus();
  await userEvent.keyboard("{ArrowDown}");
  expect(screen.getByRole("gridcell", { name: "8" })).toHaveFocus();
});
test("empty content is supplied by the consumer", () => {
  render(
    <Table
      label="Items"
      columns={columns}
      rows={rows.slice(0, 0)}
      renderCell={cell}
      renderEmpty={() => "No rows"}
    />,
  );
  expect(screen.getByText("No rows")).toBeVisible();
});
