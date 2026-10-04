import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { Disclosure } from "./Disclosure.js";

test("keyboard expands and reports the new state", async () => {
  const change = vi.fn();
  render(
    <Disclosure title="Details" onExpandedChange={change}>
      Panel content
    </Disclosure>,
  );
  const button = screen.getByRole("button", { name: "Details" });
  expect(button).toHaveAttribute("aria-expanded", "false");
  await userEvent.tab();
  expect(button).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  expect(button).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByText("Panel content")).toBeVisible();
  expect(change).toHaveBeenCalledWith(true);
});
test("controlled disclosure keeps the owner state", async () => {
  render(
    <Disclosure title="Details" isExpanded={false}>
      Panel
    </Disclosure>,
  );
  await userEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
});
