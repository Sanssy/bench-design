import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { GridList } from "../grid-list/GridList.js";
import { Table } from "../table/Table.js";
import { Tree } from "../tree/Tree.js";

const items = [
  { id: "a", label: "Alpha" },
  { id: "b", label: "Beta" },
  { id: "c", label: "Gamma" },
];
for (const kind of ["GridList", "Table", "Tree"] as const) {
  const example = (
    onReorder?: (
      keys: string[],
      target: { key: string; position: "before" | "after" },
    ) => void,
  ) => {
    const props = {
      label: "Resources",
      ...(onReorder ? { onReorder } : {}),
      getItemLabel: (item: (typeof items)[number]) => item.label,
    };
    if (kind === "GridList")
      return (
        <GridList
          {...props}
          items={items}
          layout="list"
          renderItem={(item) => item.label}
        />
      );
    if (kind === "Table")
      return (
        <Table
          {...props}
          rows={items}
          columns={[{ id: "label", label: "Name" }]}
          renderCell={(item) => item.label}
        />
      );
    return <Tree {...props} items={items} />;
  };
  test(`${kind} only exposes named drag handles when reorder is enabled`, async () => {
    const { rerender } = render(example());
    await screen.findByRole(kind === "Tree" ? "treegrid" : "grid", {
      name: "Resources",
    });
    expect(
      screen.queryByRole("button", { name: /Alpha/ }),
    ).not.toBeInTheDocument();
    rerender(example(vi.fn()));
    expect(await screen.findByRole("button", { name: /Alpha/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /Beta/ })).toBeVisible();
    rerender(example());
    expect(
      screen.queryByRole("button", { name: /Alpha/ }),
    ).not.toBeInTheDocument();
  });
  test(`${kind} keyboard reorder reports keys and a public before/after target without mutating items`, async () => {
    const reorder = vi.fn();
    render(example(reorder));
    const handle = await screen.findByRole("button", { name: /Alpha/ });
    await userEvent.tab();
    handle.focus();
    await waitFor(() => expect(handle).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(
        document.querySelector(".bd-reorder-indicator[data-drop-target]"),
      ).not.toBeNull(),
    );
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await waitFor(() => expect(reorder).toHaveBeenCalled());
    expect(reorder).toHaveBeenCalledWith(["a"], {
      key: "c",
      position: "before",
    });
    expect(items.map((item) => item.id)).toEqual(["a", "b", "c"]);
  });
  test(`${kind} Escape cancels keyboard reorder`, async () => {
    const reorder = vi.fn();
    render(example(reorder));
    const handle = await screen.findByRole("button", { name: /Alpha/ });
    await userEvent.tab();
    handle.focus();
    await waitFor(() => expect(handle).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(
        document.querySelector(".bd-reorder-indicator[data-drop-target]"),
      ).not.toBeNull(),
    );
    await userEvent.keyboard("{ArrowDown}{Escape}");
    expect(reorder).not.toHaveBeenCalled();
  });
}

test("a selected group reports every key and an after target", async () => {
  const reorder = vi.fn();
  render(
    <GridList
      label="Resources"
      items={items}
      layout="list"
      selectionMode="multiple"
      selectedKeys={["a", "b"]}
      renderItem={(item) => item.label}
      onReorder={reorder}
      getItemLabel={(item) => item.label}
    />,
  );
  const handle = within(
    await screen.findByRole("row", { name: /Alpha/ }),
  ).getByRole("button");
  await userEvent.tab();
  handle.focus();
  await userEvent.keyboard("{Enter}");
  await waitFor(() =>
    expect(
      document.querySelector(".bd-reorder-indicator[data-drop-target]"),
    ).not.toBeNull(),
  );
  await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{Enter}");
  await waitFor(() =>
    expect(reorder).toHaveBeenCalledWith(["a", "b"], {
      key: "c",
      position: "after",
    }),
  );
});
test("an expanded child can request a relative move without changing the hierarchy", async () => {
  const reorder = vi.fn();
  const hierarchy = [
    { id: "parent", label: "Parent", children: [{ id: "a", label: "Alpha" }] },
    { id: "b", label: "Beta" },
  ];
  render(
    <Tree
      label="Resources"
      items={hierarchy}
      defaultExpandedKeys={["parent"]}
      onReorder={reorder}
    />,
  );
  const handle = await screen.findByRole("button", { name: /Alpha/ });
  await userEvent.tab();
  handle.focus();
  await userEvent.keyboard("{Enter}");
  await waitFor(() =>
    expect(
      document.querySelector(".bd-reorder-indicator[data-drop-target]"),
    ).not.toBeNull(),
  );
  await userEvent.keyboard("{ArrowDown}{Enter}");
  await waitFor(() => expect(reorder).toHaveBeenCalled());
  expect(reorder.mock.calls[0]?.[0]).toEqual(["a"]);
  expect(["before", "after"]).toContain(reorder.mock.calls[0]?.[1].position);
  expect(hierarchy[0]?.children?.[0]?.id).toBe("a");
});
