import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { Tabs } from "./Tabs.js";

const items = [
  { id: "assets", title: "Assets", content: "Reusable assets" },
  { id: "saved", title: "Saved", content: "Saved collections" },
];
test("Tabs names the tablist and connects the selected tab to its panel", () => {
  render(<Tabs label="Library sections" items={items} />);
  expect(
    screen.getByRole("tablist", { name: "Library sections" }),
  ).toBeInTheDocument();
  const tab = screen.getByRole("tab", { name: "Assets" });
  const panel = screen.getByRole("tabpanel", { name: "Assets" });
  expect(panel).toHaveTextContent("Reusable assets");
  expect(tab).toHaveAttribute("aria-controls", panel.id);
  expect(panel).toHaveAttribute("aria-labelledby", tab.id);
});
test("Tabs selects the first item by default", () => {
  render(<Tabs label="Library sections" items={items} />);
  expect(screen.getByRole("tab", { name: "Assets" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});
test("Tabs respects the initial selected key", () => {
  render(
    <Tabs label="Library sections" items={items} defaultSelectedKey="saved" />,
  );
  expect(screen.getByRole("tab", { name: "Saved" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getByRole("tabpanel", { name: "Saved" })).toHaveTextContent(
    "Saved collections",
  );
});

test("Tabs accepts controlled selection and reports string keys", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const { rerender } = render(
    <Tabs
      label="Sections"
      items={items}
      selectedKey="saved"
      onSelectionChange={change}
    />,
  );
  expect(screen.getByRole("tab", { name: "Saved" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await user.click(screen.getByRole("tab", { name: "Assets" }));
  expect(change).toHaveBeenCalledWith("assets");
  expect(screen.getByRole("tab", { name: "Saved" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  rerender(<Tabs label="Sections" items={items} selectedKey="assets" />);
  expect(screen.getByRole("tabpanel", { name: "Assets" })).toBeInTheDocument();
});
test("Vertical Tabs delegates up/down navigation", async () => {
  const user = userEvent.setup();
  render(<Tabs label="Sections" items={items} orientation="vertical" />);
  expect(screen.getByRole("tablist")).toHaveAttribute(
    "aria-orientation",
    "vertical",
  );
  await user.tab();
  await user.keyboard("{ArrowDown}");
  expect(screen.getByRole("tab", { name: "Saved" })).toHaveFocus();
  await user.keyboard("{ArrowUp}");
  expect(screen.getByRole("tab", { name: "Assets" })).toHaveFocus();
});
