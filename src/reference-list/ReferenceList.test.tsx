import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
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
