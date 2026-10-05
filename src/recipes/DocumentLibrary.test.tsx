import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { DocumentLibrary } from "./DocumentLibrary.js";

beforeEach(() =>
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  })),
);
afterEach(() => vi.unstubAllGlobals());

test("search and facet combine, then recover from no matching documents", async () => {
  const user = userEvent.setup();
  render(<DocumentLibrary />);
  const search = screen.getByRole("searchbox", { name: /Search documents/ });
  await user.type(search, "contract");
  expect(screen.getByRole("row", { name: "Service contract" })).toBeVisible();
  expect(screen.queryByRole("row", { name: "Energy invoice" })).toBeNull();
  await user.click(screen.getByRole("radio", { name: "Invoices, 2" }));
  expect(
    screen.getByRole("heading", { name: "No matching documents" }),
  ).toBeVisible();
  await user.clear(search);
  expect(screen.getAllByRole("row")).toHaveLength(2);
  await user.click(screen.getByRole("radio", { name: "All, 4" }));
  expect(screen.getAllByRole("row")).toHaveLength(4);
});

test("document previews highlight a short passage within readable context", () => {
  render(<DocumentLibrary />);
  const row = screen.getByRole("row", { name: "Energy invoice" });
  const passage = "Total payable: 64.80 EUR.";
  const preview = within(row).getByText(passage, { selector: "mark" });
  expect(preview.parentElement?.textContent).not.toBe(passage);
});
