import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { Tree } from "./Tree.js";

const items = [
  {
    id: "a",
    label: "Alpha",
    count: 2,
    children: [
      { id: "b", label: "Beta" },
      { id: "c", label: "Gamma" },
    ],
  },
];
test("arrows expand, enter a child and collapse to parent", async () => {
  const change = vi.fn();
  render(
    <Tree
      label="Items"
      items={items}
      onExpandedChange={change}
      selectionMode="single"
    />,
  );
  const parent = await screen.findByRole("row", { name: /Alpha/ });
  expect(parent).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByText("2")).toBeVisible();
  await userEvent.tab();
  await userEvent.keyboard("{ArrowRight}");
  expect(change).toHaveBeenLastCalledWith(["a"]);
  expect(screen.getByRole("row", { name: /Beta/ })).toBeVisible();
  await userEvent.keyboard("{ArrowDown}");
  expect(screen.getByRole("row", { name: /Beta/ })).toHaveFocus();
  await userEvent.keyboard("{ArrowLeft}");
  expect(parent).toHaveFocus();
  await userEvent.keyboard("{ArrowLeft}");
  expect(parent).toHaveAttribute("aria-expanded", "false");
});
test("controlled expansion remains with the owner", async () => {
  const change = vi.fn();
  render(
    <Tree
      label="Items"
      items={items}
      expandedKeys={[]}
      onExpandedChange={change}
    />,
  );
  await userEvent.click(screen.getByRole("button"));
  expect(change).toHaveBeenLastCalledWith(["a"]);
  expect(screen.queryByRole("row", { name: /Beta/ })).not.toBeInTheDocument();
});
test("Enter activates and Space reports selection", async () => {
  const action = vi.fn();
  const change = vi.fn();
  render(
    <Tree
      label="Items"
      items={items}
      selectionMode="multiple"
      onAction={action}
      onSelectionChange={change}
    />,
  );
  await screen.findByRole("row", { name: /Alpha/ });
  await userEvent.tab();
  await userEvent.keyboard("{Enter}");
  expect(action).toHaveBeenLastCalledWith("a");
  await userEvent.keyboard(" ");
  expect(change).toHaveBeenLastCalledWith(["a"]);
});
test("default expansion and controlled selection", () => {
  render(
    <Tree
      label="Items"
      items={items}
      defaultExpandedKeys={["a"]}
      selectedKeys={["b"]}
      selectionMode="single"
    />,
  );
  expect(screen.getByRole("row", { name: /Beta/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});
test("empty tree keeps its accessible name", () => {
  render(<Tree label="Items" items={[]} />);
  expect(screen.getByRole("treegrid", { name: "Items" })).toBeInTheDocument();
});
