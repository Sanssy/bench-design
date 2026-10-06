import { render, screen } from "@testing-library/react";
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
    screen.getByRole("link", { name: "Garden apartment" }),
  ).toHaveAttribute("href", "#housing-record");
  expect(screen.getByRole("link", { name: /Energy statement/ })).toBeVisible();
  const housing = screen.getByRole("tab", { name: "Housing — Home and cover" });
  housing.focus();
  await user.keyboard("{ArrowDown}");
  expect(
    screen.getByRole("tab", { name: "Vehicle — Purchase and service" }),
  ).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("link", { name: "City bicycle" })).toBeVisible();
  expect(
    screen.queryByRole("link", { name: "Garden apartment" }),
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
  expect(screen.getByRole("link", { name: "Lease starts" })).toHaveAttribute(
    "href",
    "#first-source",
  );
});
