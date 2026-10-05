import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { MetaList } from "../meta-list/MetaList.js";
import { Inspector } from "./Inspector.js";

test("composes header, expandable metadata and consumer actions", async () => {
  render(
    <Inspector
      title="Field notes"
      eyebrow="Selected resource"
      sections={[
        {
          id: "details",
          title: "Details",
          meta: "2 fields",
          content: <MetaList items={[{ term: "Format", details: "Text" }]} />,
        },
        {
          id: "notes",
          title: "Notes",
          content: "Read carefully",
          defaultExpanded: true,
        },
      ]}
      actions={<button type="button">Edit resource</button>}
    />,
  );
  expect(screen.getByRole("heading", { name: "Field notes" })).toBeVisible();
  expect(screen.getByText("Selected resource")).toBeVisible();
  const trigger = screen.getByRole("button", { name: /Details/ });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByText("2 fields")).toBeVisible();
  await userEvent.click(trigger);
  expect(screen.getByText("Format")).toBeVisible();
  expect(screen.getByText("Text")).toBeVisible();
  expect(screen.getByText("Read carefully")).toBeVisible();
  expect(screen.getByRole("button", { name: "Edit resource" })).toBeVisible();
});
test("shows the supplied empty state when there are no sections", () => {
  const { rerender } = render(<Inspector emptyState="Select a resource" />);
  expect(screen.getByText("Select a resource")).toBeVisible();
  rerender(<Inspector sections={[]} emptyState="Select a resource" />);
  expect(screen.getByText("Select a resource")).toBeVisible();
});
