import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { FilterChip } from "./FilterChip.js";

test("toggles immediately and respects disabled state", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  const { rerender } = render(
    <FilterChip label="Available" onChange={onChange} />,
  );
  const chip = screen.getByRole("button", { name: "Available" });
  await user.click(chip);
  expect(chip).toHaveAttribute("aria-pressed", "true");
  expect(onChange).toHaveBeenLastCalledWith(true);
  rerender(<FilterChip label="Available" isDisabled onChange={onChange} />);
  await user.click(chip);
  expect(onChange).toHaveBeenCalledTimes(1);
});
test("controlled selection waits for the owner; default selection initializes", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  const { rerender } = render(
    <FilterChip label="Available" isSelected={false} onChange={onChange} />,
  );
  await user.click(screen.getByRole("button"));
  expect(onChange).toHaveBeenCalledWith(true);
  expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  rerender(<FilterChip label="Available" isSelected />);
  expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
});
test("starts with the uncontrolled default", () => {
  render(<FilterChip label="Available" defaultSelected />);
  expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
});
