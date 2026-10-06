import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { CollectionView } from "./CollectionView.js";

test("names the collection and keeps consumer tools, zero count and footer", () => {
  render(
    <CollectionView
      label="Resources"
      count={0}
      toolbar={<button type="button">Search</button>}
      footer="0 of 8 shown"
    >
      <p>Consumer content</p>
    </CollectionView>,
  );
  expect(screen.getByRole("region", { name: "Resources 0" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Resources 0" })).toBeVisible();
  expect(screen.getByText("0")).toBeVisible();
  expect(screen.getByRole("button", { name: "Search" })).toBeVisible();
  expect(screen.getByText("Consumer content")).toBeVisible();
  expect(screen.getByText("0 of 8 shown")).toBeVisible();
});
test("empty results replace children and preserve tools and footer", () => {
  render(
    <CollectionView
      label="Resources"
      isEmpty
      emptyState={<p>No matching resources</p>}
      toolbar={<button type="button">Clear filters</button>}
      footer="0 of 8 shown"
    >
      <p>Consumer content</p>
    </CollectionView>,
  );
  expect(screen.getByText("No matching resources")).toBeVisible();
  expect(screen.queryByText("Consumer content")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Clear filters" })).toBeVisible();
  expect(screen.getByText("0 of 8 shown")).toBeVisible();
});
test("heading level defaults to 2 and follows headingLevel", () => {
  const { rerender } = render(
    <CollectionView label="Resources">
      <p>Content</p>
    </CollectionView>,
  );
  expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
    "Resources",
  );
  rerender(
    <CollectionView label="Resources" headingLevel={3}>
      <p>Content</p>
    </CollectionView>,
  );
  expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
    "Resources",
  );
});

test("outlined count is announced with the chosen heading level", () => {
  render(
    <CollectionView
      label="Resources"
      count={12}
      countVariant="outlined"
      headingLevel={3}
    >
      Content
    </CollectionView>,
  );
  expect(
    screen.getByRole("heading", { name: "Resources 12", level: 3 }),
  ).toBeVisible();
  expect(screen.getByRole("region", { name: "Resources 12" })).toBeVisible();
});

test("title actions remain interactive outside the region name", async () => {
  const activate = vi.fn();
  render(
    <CollectionView
      label="Resources"
      actions={
        <button type="button" onClick={activate}>
          Add resource
        </button>
      }
    >
      Content
    </CollectionView>,
  );
  expect(screen.getByRole("region", { name: "Resources" })).toBeVisible();
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Add resource" }));
  expect(activate).toHaveBeenCalledOnce();
});

test("toolbar stickiness is optional and defaults to sticky", () => {
  const { container, rerender } = render(
    <CollectionView label="Resources" toolbar="Tools">
      Content
    </CollectionView>,
  );
  expect(
    container.querySelector(".bd-collection-view-toolbar"),
  ).toHaveAttribute("data-sticky", "true");
  rerender(
    <CollectionView label="Resources" toolbar="Tools" stickyToolbar={false}>
      Content
    </CollectionView>,
  );
  expect(
    container.querySelector(".bd-collection-view-toolbar"),
  ).toHaveAttribute("data-sticky", "false");
});
