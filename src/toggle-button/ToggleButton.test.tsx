import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { ToggleButton } from "./ToggleButton.js";

test("ToggleButton follows controlled selection and reports changes", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const { rerender } = render(
    <ToggleButton label="Guides" isSelected onChange={change} />,
  );
  const button = screen.getByRole("button", { name: "Guides" });
  expect(button).toHaveAttribute("aria-pressed", "true");
  await user.click(button);
  expect(change).toHaveBeenCalledWith(false);
  expect(button).toHaveAttribute("aria-pressed", "true");
  rerender(
    <ToggleButton label="Guides" isSelected={false} onChange={change} />,
  );
  expect(button).toHaveAttribute("aria-pressed", "false");
});
test("ToggleButton toggles with Enter and Space from its initial selection", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(<ToggleButton label="Guides" defaultSelected onChange={change} />);
  const button = screen.getByRole("button", { name: "Guides" });
  expect(button).toHaveAttribute("aria-pressed", "true");
  await user.tab();
  await user.keyboard("{Enter}");
  expect(button).toHaveAttribute("aria-pressed", "false");
  await user.keyboard(" ");
  expect(button).toHaveAttribute("aria-pressed", "true");
  expect(change.mock.calls).toEqual([[false], [true]]);
});
test("Disabled icon ToggleButton keeps its name and selection", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <ToggleButton
      label="Guides"
      icon="check"
      defaultSelected
      isDisabled
      onChange={change}
    />,
  );
  const button = screen.getByRole("button", { name: "Guides" });
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute("aria-pressed", "true");
  expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  await user.click(button);
  await user.tab();
  await user.keyboard("{Enter} ");
  expect(change).not.toHaveBeenCalled();
  expect(button).not.toHaveFocus();
});
