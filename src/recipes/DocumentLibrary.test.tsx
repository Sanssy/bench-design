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
  await user.click(screen.getByRole("radio", { name: "All, 10" }));
  expect(screen.getAllByRole("row")).toHaveLength(10);
});

test("document previews highlight a short passage within readable context", () => {
  render(<DocumentLibrary />);
  const row = screen.getByRole("row", { name: "Energy invoice" });
  const passage = "Total payable: 64.80 EUR.";
  const preview = within(row).getByText(passage, { selector: "mark" });
  expect(preview.parentElement?.textContent).not.toBe(passage);
});

test("document page offers a footer and a route to questions", () => {
  render(<DocumentLibrary />);
  expect(screen.getByRole("contentinfo")).toHaveTextContent("Document space");
  expect(screen.getByRole("link", { name: "Ask a question" })).toHaveAttribute(
    "href",
    "#ask",
  );
});

test("list view retains search and document activation", async () => {
  const user = userEvent.setup();
  render(<DocumentLibrary />);
  await user.click(screen.getByRole("radio", { name: "List view" }));
  expect(screen.getByRole("grid", { name: "Documents" })).toHaveAttribute(
    "data-layout",
    "stack",
  );
  expect(screen.getByRole("radio", { name: "List view" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await user.type(
    screen.getByRole("searchbox", { name: /Search documents/ }),
    "Energy",
  );
  await user.click(screen.getByRole("row", { name: "Energy invoice" }));
  expect(screen.getByRole("dialog", { name: "Energy invoice" })).toBeVisible();
});
