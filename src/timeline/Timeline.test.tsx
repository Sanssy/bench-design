import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { Link } from "../link/Link.js";
import { Timeline } from "./Timeline.js";

test("names an ordered list and preserves arbitrary markers and caller order", () => {
  render(
    <Timeline
      label="History"
      items={[
        {
          id: "later",
          marker: "Unknown period",
          title: <strong>Later</strong>,
        },
        { id: "earlier", marker: "Step 1", title: "Earlier" },
      ]}
    />,
  );
  const list = screen.getByRole("list", { name: "History" });
  expect(list.tagName).toBe("OL");
  const items = within(list).getAllByRole("listitem");
  expect(items.map((item) => item.textContent)).toEqual([
    "Unknown periodLater",
    "Step 1Earlier",
  ]);
  expect(within(items[0] as HTMLElement).getByText("Later").tagName).toBe(
    "STRONG",
  );
});
test("rich content retains link keyboard interaction", async () => {
  const user = userEvent.setup();
  render(
    <Timeline
      label="History"
      items={[
        {
          id: "one",
          marker: "Today",
          title: "Published",
          children: <Link href="/source">Read source</Link>,
        },
      ]}
    />,
  );
  const link = screen.getByRole("link", { name: "Read source" });
  expect(link).toHaveAttribute("href", "/source");
  await user.tab();
  expect(link).toHaveFocus();
});
test("an empty timeline retains its named list without invented entries", () => {
  render(<Timeline label="History" items={[]} />);
  expect(screen.getByRole("list", { name: "History" })).toBeEmptyDOMElement();
});
