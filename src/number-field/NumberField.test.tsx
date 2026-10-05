import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { NumberField } from "./NumberField.js";

test("NumberField connects its name and help", () => {
  render(
    <NumberField
      label="Setting"
      description="Choose carefully"
      isRequired
      defaultValue={2}
    />,
  );
  expect(
    screen.getByRole("textbox", { name: "Setting" }),
  ).toHaveAccessibleDescription("Choose carefully");
});
test("NumberField connects an external error", () => {
  render(
    <NumberField
      label="Setting"
      isRequired
      isInvalid
      errorMessage="Review setting"
      defaultValue={2}
    />,
  );
  expect(
    screen.getByRole("textbox", { name: "Setting" }),
  ).toHaveAccessibleDescription("Review setting");
});
test("NumberField steps within bounds and reports edits", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <NumberField
      label="Quantity"
      defaultValue={2}
      minValue={0}
      maxValue={4}
      step={2}
      onChange={onChange}
      unit="items"
    />,
  );
  const input = screen.getByRole("textbox");
  await user.click(input);
  await user.keyboard("{ArrowUp}");
  expect(input).toHaveValue("4");
  expect(onChange).toHaveBeenLastCalledWith(4);
  await user.keyboard("{ArrowUp}");
  expect(input).toHaveValue("4");
  await user.keyboard("{ArrowDown}");
  expect(input).toHaveValue("2");
  expect(screen.getByText("items")).toBeInTheDocument();
});
test("NumberField follows controlled values and disables buttons", () => {
  const { rerender } = render(<NumberField label="Quantity" value={2} />);
  rerender(<NumberField label="Quantity" value={6} isDisabled />);
  expect(screen.getByRole("textbox")).toHaveValue("6");
  for (const button of screen.getAllByRole("button"))
    expect(button).toBeDisabled();
});
test("NumberField connects required submit validation", async () => {
  const user = userEvent.setup();
  render(
    <form>
      <NumberField label="Quantity" isRequired />
      <button type="submit">Save</button>
    </form>,
  );
  await user.click(screen.getByRole("button", { name: "Save" }));
  const error = document.querySelector(".bd-field-error");
  expect(error?.textContent?.length).toBeGreaterThan(0);
  expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
    error?.textContent ?? "",
  );
});

test("NumberField announces its unit alongside help and errors", () => {
  render(
    <NumberField
      label="Quantity"
      unit="items"
      description="Choose carefully"
      isInvalid
      errorMessage="Review setting"
    />,
  );
  const input = screen.getByRole("textbox");
  expect(input).toHaveAccessibleDescription(/items/);
  expect(input).toHaveAccessibleDescription(/Choose carefully/);
  expect(input).toHaveAccessibleDescription(/Review setting/);
});
