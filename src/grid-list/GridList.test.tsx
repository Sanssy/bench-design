import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { GridList } from "./GridList.js";

const items = [
  { id: "a", label: "Alpha" },
  { id: "b", label: "Beta" },
];
test("multiple selection reports keys and shows the supplied bar", async () => {
  const change = vi.fn();
  render(
    <GridList
      label="Items"
      items={items}
      selectionMode="multiple"
      onSelectionChange={change}
      renderItem={(item) => item.label}
      selectionBar={(keys) => `${keys.length} selected`}
    />,
  );
  await userEvent.click(screen.getByRole("checkbox", { name: /Alpha/ }));
  expect(change).toHaveBeenLastCalledWith(["a"]);
  expect(screen.getByText("1 selected")).toBeVisible();
});
test("Enter acts before selection, Space selects and arrows move focus", async () => {
  const action = vi.fn();
  const change = vi.fn();
  render(
    <GridList
      label="Items"
      items={items}
      layout="list"
      selectionMode="multiple"
      onAction={action}
      onSelectionChange={change}
      renderItem={(item) => item.label}
    />,
  );
  await screen.findByRole("row", { name: /Alpha/ });
  await userEvent.tab();
  await userEvent.keyboard("{Enter}");
  expect(action).toHaveBeenLastCalledWith("a");
  await userEvent.keyboard(" ");
  expect(change).toHaveBeenLastCalledWith(["a"]);
  await userEvent.keyboard("{ArrowDown}");
  expect(screen.getByRole("row", { name: /Beta/ })).toHaveFocus();
});
test("controlled selection stays with the owner", async () => {
  render(
    <GridList
      label="Items"
      items={items}
      selectedKeys={["b"]}
      selectionMode="multiple"
      renderItem={(item) => item.label}
    />,
  );
  await userEvent.click(screen.getByRole("checkbox", { name: /Alpha/ }));
  expect(screen.getByRole("row", { name: /Alpha/ })).toHaveAttribute(
    "aria-selected",
    "false",
  );
  expect(screen.getByRole("row", { name: /Beta/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});
test("custom keys and default selection", () => {
  render(
    <GridList
      label="Items"
      items={[{ code: "x", label: "Custom" }]}
      getKey={(item) => item.code}
      defaultSelectedKeys={["x"]}
      selectionMode="single"
      renderItem={(item) => item.label}
    />,
  );
  expect(screen.getByRole("row", { name: "Custom" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});
test("empty collection renders the consumer content", () => {
  render(
    <GridList
      label="Items"
      items={items.slice(0, 0)}
      renderItem={(item) => item.label}
      renderEmpty={() => "Nothing here"}
    />,
  );
  expect(screen.getByText("Nothing here")).toBeVisible();
});

test("React Aria toggle selection suppresses actions while selection is nonempty", async () => {
  const action = vi.fn();
  render(
    <GridList
      label="Items"
      items={items}
      layout="list"
      selectionMode="multiple"
      defaultSelectedKeys={["a"]}
      onAction={action}
      renderItem={(item) => item.label}
    />,
  );
  await screen.findByRole("row", { name: /Alpha/ });
  await userEvent.tab();
  await userEvent.keyboard("{Enter}");
  expect(action).not.toHaveBeenCalled();
});
