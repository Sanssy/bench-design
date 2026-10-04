import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
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
