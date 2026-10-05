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
  const housing = screen.getByRole("radio", { name: "Housing, 4" });
  housing.focus();
  await user.keyboard("{ArrowRight} ");
  expect(screen.getByRole("radio", { name: "Vehicle, 2" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  expect(screen.getByRole("link", { name: "City bicycle" })).toBeVisible();
  expect(
    screen.queryByRole("link", { name: "Garden apartment" }),
  ).not.toBeInTheDocument();
  await user.keyboard("{ArrowRight} ");
  expect(screen.getByRole("heading", { name: "No records yet" })).toBeVisible();
  expect(
    screen.queryByRole("list", { name: "Related records" }),
  ).not.toBeInTheDocument();
});
