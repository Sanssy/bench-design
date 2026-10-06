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

test("requested maximum columns configures the grid", () => {
  render(
    <GridList
      label="Items"
      items={items}
      columns={4}
      renderItem={(item) => item.label}
    />,
  );
  expect(
    screen
      .getByRole("grid", { name: "Items" })
      .style.getPropertyValue("--bd-grid-list-columns"),
  ).toBe("4");
});

test("strong selection keeps item activation and selection", async () => {
  const action = vi.fn();
  render(
    <GridList
      label="Items"
      items={items}
      selectionVariant="strong"
      selectionMode="single"
      onAction={action}
      renderItem={(item) => item.label}
    />,
  );
  expect(screen.getByRole("grid", { name: "Items" })).toHaveAttribute(
    "data-variant",
    "strong",
  );
  await userEvent.tab();
  await userEvent.keyboard("{Enter}");
  expect(action).toHaveBeenLastCalledWith("a");
  await userEvent.keyboard(" ");
  expect(screen.getByRole("row", { name: "Alpha" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("explicit columns use the card minimum while defaults keep the panel minimum", () => {
  const { rerender } = render(
    <GridList
      label="Items"
      items={items}
      columns={4}
      renderItem={(item) => item.label}
    />,
  );
  const grid = screen.getByRole("grid", { name: "Items" });
  expect(grid.style.getPropertyValue("--bd-grid-list-min-column")).toBe(
    "var(--bd-card-min-width)",
  );
  rerender(
    <GridList label="Items" items={items} renderItem={(item) => item.label} />,
  );
  expect(grid.style.getPropertyValue("--bd-grid-list-min-column")).toBe(
    "var(--bd-panel-width)",
  );
});

test("item padding can be removed without changing the default", () => {
  const { rerender } = render(
    <GridList
      label="Items"
      items={items}
      itemPadding="none"
      renderItem={(item) => item.label}
    />,
  );
  expect(screen.getByRole("row", { name: "Alpha" })).toHaveAttribute(
    "data-padding",
    "none",
  );
  rerender(
    <GridList label="Items" items={items} renderItem={(item) => item.label} />,
  );
  expect(screen.getByRole("row", { name: "Alpha" })).toHaveAttribute(
    "data-padding",
    "default",
  );
});

test("ruled list rows retain activation", async () => {
  const action = vi.fn();
  render(
    <GridList
      label="Items"
      items={items}
      layout="list"
      itemVariant="ruled"
      onAction={action}
      renderItem={(item) => item.label}
    />,
  );
  expect(screen.getByRole("grid", { name: "Items" })).toHaveAttribute(
    "data-item-variant",
    "ruled",
  );
  await userEvent.click(screen.getByRole("row", { name: "Alpha" }));
  expect(action).toHaveBeenCalledWith("a");
});

test("preview and footer frame content without replacing activation", async () => {
  const action = vi.fn();
  render(
    <GridList
      label="Previews"
      items={items}
      onAction={action}
      renderItem={(item) => item.label}
      renderPreview={() => <span>Preview</span>}
      renderFooter={() => <span>Footer</span>}
    />,
  );
  const row = screen.getByRole("row", { name: /Alpha/ });
  expect(row.querySelector(".bd-grid-list-preview")).toHaveTextContent(
    "Preview",
  );
  expect(row.querySelector(".bd-grid-list-footer")).toHaveTextContent("Footer");
  await userEvent.click(row);
  expect(action).toHaveBeenCalledWith("a");
});
