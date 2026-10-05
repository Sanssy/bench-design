import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
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
