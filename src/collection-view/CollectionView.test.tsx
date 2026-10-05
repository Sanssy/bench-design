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
  expect(screen.getByRole("region", { name: "Resources" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Resources" })).toBeVisible();
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
