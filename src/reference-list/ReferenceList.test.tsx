import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { ReferenceList } from "./ReferenceList.js";

test("names an ordered reference list and preserves caller order", () => {
  render(
    <ReferenceList
      label="References"
      items={[
        { id: "b", title: "Second publication" },
        { id: "a", title: "First publication" },
      ]}
    />,
  );
  const list = screen.getByRole("list", { name: "References" });
  expect(list.tagName).toBe("OL");
  expect(
    within(list)
      .getAllByRole("listitem")
      .map((item) => item.textContent),
  ).toEqual(["Second publication", "First publication"]);
  expect(within(list).queryByRole("link")).toBeNull();
});

test("linked references retain keyboard access and optional descriptions", async () => {
  const user = userEvent.setup();
  const { rerender } = render(
    <ReferenceList
      label="References"
      items={[
        {
          id: "one",
          title: "Guide",
          href: "/guide",
          description: "Updated edition",
        },
      ]}
    />,
  );
  const link = screen.getByRole("link", { name: "Guide" });
  expect(link).toHaveAttribute("href", "/guide");
  expect(screen.getByText("Updated edition")).toBeVisible();
  await user.tab();
  expect(link).toHaveFocus();
  rerender(<ReferenceList label="References" items={[]} />);
  expect(
    screen.getByRole("list", { name: "References" }),
  ).toBeEmptyDOMElement();
});

test("renders caller-owned end metadata", () => {
  render(
    <ReferenceList
      label="References"
      items={[{ id: "one", title: "Guide", meta: "p. 3" }]}
    />,
  );
  expect(screen.getByText("p. 3")).toBeVisible();
});

test("accent references show decorative numbers in caller order", () => {
  render(
    <ReferenceList
      label="References"
      marker="accent"
      items={[
        { id: "a", title: "Guide" },
        { id: "b", title: "Archive" },
      ]}
    />,
  );
  expect(screen.getByText("1")).toHaveAttribute("aria-hidden", "true");
  expect(screen.getByText("2")).toHaveAttribute("aria-hidden", "true");
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
});

test("an item action renders the title as a link-styled button", async () => {
  const user = userEvent.setup();
  const open = vi.fn();
  render(
    <ReferenceList
      label="Sources"
      items={[
        { id: "a", title: "Workshop guide", onAction: open, meta: "p. 1" },
      ]}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Workshop guide" }));
  expect(open).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole("link")).toBeNull();
});
