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

test.each([400, -80])(
  "Controlled horizontal selection scrolls only the tab list (left=%i)",
  (tabLeft) => {
    const bounds = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect");
    bounds.mockImplementation(function (this: HTMLElement) {
      const left = this.getAttribute("role") === "tab" ? tabLeft : 0;
      const width = this.getAttribute("role") === "tab" ? 80 : 300;
      return {
        left,
        right: left + width,
        top: 0,
        bottom: 48,
        width,
        height: 48,
        x: left,
        y: 0,
        toJSON: () => ({}),
      };
    });
    try {
      const { rerender } = render(
        <Tabs label="Sections" items={items} selectedKey="assets" />,
      );
      const list = screen.getByRole("tablist");
      list.scrollLeft = 0;
      rerender(<Tabs label="Sections" items={items} selectedKey="saved" />);
      expect(list.scrollLeft).toBe(tabLeft === 400 ? 180 : -80);
      expect(document.documentElement.scrollLeft).toBe(0);
      list.scrollLeft = 0;
      rerender(
        <Tabs
          label="Sections"
          items={items}
          selectedKey="assets"
          orientation="vertical"
        />,
      );
      expect(list.scrollLeft).toBe(0);
    } finally {
      bounds.mockRestore();
    }
  },
);

test("Rich vertical tabs include descriptions in their name and keep icons decorative", async () => {
  const user = userEvent.setup();
  render(
    <Tabs
      label="Sections"
      orientation="vertical"
      items={[
        {
          id: "assets",
          title: "Assets",
          description: "Reusable files",
          icon: "file-text",
          content: "Files",
        },
        {
          id: "saved",
          title: "Saved",
          description: "Your bookmarks",
          content: "Bookmarks",
        },
      ]}
    />,
  );
  const first = screen.getByRole("tab", { name: "Assets — Reusable files" });
  expect(first.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  await user.tab();
  await user.keyboard("{ArrowDown}");
  expect(
    screen.getByRole("tab", { name: "Saved — Your bookmarks" }),
  ).toHaveFocus();
  expect(
    screen.getByRole("tabpanel", { name: "Saved — Your bookmarks" }),
  ).toHaveTextContent("Bookmarks");
});

test("framed navigation keeps guidance outside tabs and retains keyboard selection", async () => {
  const user = userEvent.setup();
  render(
    <Tabs
      label="Sections"
      items={items}
      orientation="vertical"
      variant="cards"
      listHeader={<p>Browse sections</p>}
      listFooter={<p>Supporting records</p>}
    />,
  );
  const list = screen.getByRole("tablist");
  expect(list).not.toContainElement(screen.getByText("Supporting records"));
  expect(screen.getByText("Browse sections")).toBeVisible();
  await user.tab();
  await user.keyboard("{ArrowDown}");
  expect(screen.getByRole("tabpanel", { name: "Saved" })).toHaveTextContent(
    "Saved collections",
  );
});
