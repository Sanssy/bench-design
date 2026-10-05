import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { Badge } from "../badge/Badge.js";
import { Link } from "../link/Link.js";
import { ConnectedList } from "./ConnectedList.js";

test("names an ordered list and preserves caller order", () => {
  render(
    <ConnectedList
      label="Related resources"
      items={[
        { id: "z", title: "First supplied" },
        { id: "a", title: "Second supplied" },
      ]}
    />,
  );
  const list = screen.getByRole("list", { name: "Related resources" });
  expect(list.tagName).toBe("OL");
  expect(
    within(list)
      .getAllByRole("listitem")
      .map((item) => item.textContent),
  ).toEqual(["First supplied", "Second supplied"]);
});
test("renders rich titles and metadata with link keyboard interaction", async () => {
  const user = userEvent.setup();
  render(
    <ConnectedList
      label="Related resources"
      items={[
        {
          id: "one",
          title: <Badge>Reference</Badge>,
          meta: <Link href="/source">Read source</Link>,
        },
      ]}
    />,
  );
  expect(screen.getByText("Reference")).toBeVisible();
  const link = screen.getByRole("link", { name: "Read source" });
  expect(link).toHaveAttribute("href", "/source");
  await user.tab();
  expect(link).toHaveFocus();
});
test("keeps an empty named list without invented entries", () => {
  render(<ConnectedList label="Related resources" items={[]} />);
  expect(
    screen.getByRole("list", { name: "Related resources" }),
  ).toBeEmptyDOMElement();
});
