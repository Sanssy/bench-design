import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
});
afterEach(() => vi.unstubAllGlobals());

import { Overview } from "./Overview.js";

test("domain selection changes the overview and exposes an empty domain", async () => {
  const user = userEvent.setup();
  render(<Overview />);
  expect(screen.getByRole("link", { name: /^Overview$/ })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(
    screen.getByRole("button", { name: "Garden apartment" }),
  ).toBeVisible();
  expect(
    screen.getByRole("button", { name: /Energy statement/ }),
  ).toBeVisible();
  const housing = screen.getByRole("tab", { name: "Housing — Home and cover" });
  housing.focus();
  await user.keyboard("{ArrowDown}");
  expect(
    screen.getByRole("tab", { name: "Vehicle — Purchase and service" }),
  ).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("button", { name: "City bicycle" })).toBeVisible();
  expect(
    screen.queryByRole("button", { name: "Garden apartment" }),
  ).not.toBeInTheDocument();
  await user.keyboard("{ArrowDown}");
  expect(screen.getByRole("heading", { name: "No records yet" })).toBeVisible();
  expect(
    screen.queryByRole("list", { name: "Related records" }),
  ).not.toBeInTheDocument();
});

test("overview supplies sidebar guidance, entity sources and linked milestones", () => {
  render(<Overview />);
  expect(screen.getByText("In your life")).toBeVisible();
  expect(
    screen.getByText("Each connection leads back to its supporting records."),
  ).toBeVisible();
  expect(screen.getByText("4 source records")).toBeVisible();
  expect(screen.getByRole("button", { name: "Lease starts" })).toBeVisible();
});

test("person evidence opens a passage and returns to the same sources", async () => {
  const user = userEvent.setup();
  render(<Overview />);
  await user.click(screen.getByRole("button", { name: "Read person sources" }));
  const dialog = screen.getByRole("dialog", { name: "Alex Morgan" });
  expect(within(dialog).getByText("Connected", { exact: true })).toBeVisible();
  expect(
    within(dialog).getByText("Why these records are connected"),
  ).toBeVisible();
  await user.click(
    within(
      within(dialog).getByRole("region", { name: "Rental agreement" }),
    ).getByRole("button", { name: "Read this passage in the record" }),
  );
  const record = screen.getByRole("dialog", { name: "Rental agreement" });
  expect(record.querySelector("mark")).toHaveTextContent("Alex Morgan");
  await user.click(
    within(record).getByRole("button", {
      name: "Back to the information and its sources",
    }),
  );
  expect(screen.getByRole("dialog", { name: "Alex Morgan" })).toBeVisible();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Read person sources" }),
    ).toHaveFocus(),
  );
});

test("each housing fact opens contextual evidence", async () => {
  const user = userEvent.setup();
  render(<Overview />);
  for (const [name, title] of [
    ["Garden apartment", "Garden apartment"],
    ["1 source record — Rental agreement", "Rental agreement"],
    ["1 source record — Home cover", "Home cover"],
    ["2 source records — Energy statement", "Energy statement"],
    ["1 source record — Rent and charges", "Rent and charges"],
    ["1 source record — Cover", "Cover"],
    [
      "2 source records — Energy · latest known period",
      "Energy · latest known period",
    ],
    ["Understand the change", "New cover takes over."],
    ["Lease starts", "Lease starts"],
    ["Previous cover begins", "Previous cover begins"],
    ["New cover begins", "New cover begins"],
    ["Recorded cover ends", "Recorded cover ends"],
  ] as const) {
    await user.click(screen.getByRole("button", { name }));
    expect(screen.getByRole("dialog", { name: title })).toBeVisible();
    await user.keyboard("{Escape}");
  }
});
