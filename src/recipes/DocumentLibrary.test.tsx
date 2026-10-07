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
  await user.click(screen.getByRole("button", { name: "Show all documents" }));
  expect(search).toHaveValue("");
  expect(screen.getByRole("radio", { name: "All, 6" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  expect(screen.getAllByRole("row")).toHaveLength(6);
  await user.click(screen.getByRole("radio", { name: "Invoices, 2" }));
  expect(screen.getAllByRole("row")).toHaveLength(2);
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

test("import dialog presents a titled drop zone and supported formats", async () => {
  const user = userEvent.setup();
  render(<DocumentLibrary />);
  await user.click(
    screen.getAllByRole("button", { name: "Add documents" })[0] as HTMLElement,
  );
  const dialog = screen.getByRole("dialog", { name: "Add your documents" });
  expect(
    within(dialog).getByRole("heading", { name: "Drop your files here" }),
  ).toBeVisible();
  expect(within(dialog).getByText("PDF, TXT · 20 MB max.")).toBeVisible();
});

test("accepted files open the import dialog and become readable documents", async () => {
  vi.stubGlobal("matchMedia", () => ({
    matches: true,
    addEventListener() {},
    removeEventListener() {},
  }));
  const user = userEvent.setup();
  render(<DocumentLibrary />);
  await user.click(
    screen.getAllByRole("button", { name: "Add documents" })[0] as HTMLElement,
  );
  const dialog = screen.getByRole("dialog", { name: "Add your documents" });
  await user.upload(
    dialog.querySelector('input[type="file"]') as HTMLInputElement,
    new File(["sample"], "water.pdf", { type: "application/pdf" }),
  );
  expect(within(dialog).getByText("Bill recognised · Housing")).toBeVisible();
  await user.click(
    within(dialog).getByRole("button", { name: "View document" }),
  );
  expect(screen.getByRole("dialog", { name: "water.pdf" })).toBeVisible();
  await user.keyboard("{Escape}");
  expect(screen.getByRole("row", { name: "water.pdf" })).toBeVisible();
  expect(screen.getByText("7 documents", { exact: true })).toBeVisible();
});

test("imports progress to completion and release their timer", async () => {
  const user = userEvent.setup();
  const { unmount } = render(<DocumentLibrary />);
  await user.click(
    screen.getAllByRole("button", { name: "Add documents" })[0] as HTMLElement,
  );
  const dialog = screen.getByRole("dialog", { name: "Add your documents" });
  await user.upload(
    dialog.querySelector('input[type="file"]') as HTMLInputElement,
    new File(["sample"], "water.pdf", { type: "application/pdf" }),
  );
  const queue = within(dialog).getByRole("list", { name: "Document imports" });
  expect(within(queue).getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "0",
  );
  expect(
    within(queue).queryByRole("button", { name: "View document" }),
  ).toBeNull();
  expect(
    await within(queue).findByRole(
      "button",
      { name: "View document" },
      { timeout: 3500 },
    ),
  ).toBeVisible();
  expect(within(queue).getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "100",
  );
  const clear = vi.spyOn(window, "clearInterval");
  await user.click(
    within(dialog).getByRole("button", {
      name: "Try with a sample water bill",
    }),
  );
  unmount();
  expect(clear).toHaveBeenCalled();
  clear.mockRestore();
});

test("import dialog reports type and size refusals once without adding them", async () => {
  const user = userEvent.setup({ applyAccept: false });
  render(<DocumentLibrary />);
  await user.click(
    screen.getAllByRole("button", { name: "Add documents" })[0] as HTMLElement,
  );
  const dialog = screen.getByRole("dialog", { name: "Add your documents" });
  await user.upload(
    dialog.querySelector('input[type="file"]') as HTMLInputElement,
    new File(["sample"], "water.pdf", { type: "application/pdf" }),
  );
  const large = new File(["sample"], "large.pdf", { type: "application/pdf" });
  Object.defineProperty(large, "size", { value: 20_000_001 });
  await user.upload(
    dialog.querySelector('input[type="file"]') as HTMLInputElement,
    [
      new File(["image"], "photo.png", { type: "image/png" }),
      large,
      new File(["sample"], "accepted.txt", { type: "text/plain" }),
    ],
  );
  const alert = within(dialog).getByRole("alert");
  expect(alert).toHaveTextContent("photo.png");
  expect(alert).toHaveTextContent("large.pdf");
  expect(
    within(dialog).queryByText("Some files could not be added"),
  ).toBeNull();
  expect(
    within(dialog).getByRole("list", { name: "Document imports" }).children,
  ).toHaveLength(2);
});

test("record fields reveal their source and related documents reset selection", async () => {
  const user = userEvent.setup();
  render(<DocumentLibrary />);
  await user.click(screen.getByRole("row", { name: "Energy invoice" }));
  let dialog = screen.getByRole("dialog", { name: "Energy invoice" });
  expect(within(dialog).getByText("Source passage")).toBeVisible();
  expect(
    within(dialog).getByRole("row", { name: "Amount due" }),
  ).toHaveAttribute("aria-selected", "true");
  expect(
    within(dialog).getByText("Total payable: 64.80 EUR.", { selector: "mark" }),
  ).toBeVisible();
  await user.click(within(dialog).getByRole("row", { name: "Payment date" }));
  expect(within(dialog).getByText("Page 2 / 2")).toBeVisible();
  expect(
    within(dialog).getByText("Payment due by 15 September 2026.", {
      selector: "mark",
    }),
  ).toBeVisible();
  await user.click(
    within(dialog).getByRole("button", { name: "Equipment invoice" }),
  );
  dialog = screen.getByRole("dialog", { name: "Equipment invoice" });
  expect(within(dialog).getByText("Page 1 / 1")).toBeVisible();
  expect(
    within(dialog).getByText("Item: office equipment. Total: 120.00 EUR.", {
      selector: "mark",
    }),
  ).toBeVisible();
  await user.click(within(dialog).getByRole("button", { name: "Invoices" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByRole("radio", { name: "Invoices, 2" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  expect(screen.getAllByRole("row")).toHaveLength(2);
});
