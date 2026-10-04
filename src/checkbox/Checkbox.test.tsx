import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { Checkbox } from "./Checkbox.js";

test("Checkbox names its control and connects help", () => {
  render(
    <Checkbox label="Collection" description="Choose carefully" isRequired />,
  );
  const control = screen.getByRole("checkbox", { name: "Collection" });
  expect(control).toHaveAccessibleDescription("Choose carefully");
});
test("Checkbox connects an explicit error", () => {
  render(
    <Checkbox
      label="Collection"
      isRequired
      isInvalid
      errorMessage="Review this value"
    />,
  );
  expect(
    screen.getByRole("checkbox", { name: "Collection" }),
  ).toHaveAccessibleDescription("Review this value");
});
test("Checkbox disables its controls", () => {
  render(<Checkbox label="Collection" isRequired isDisabled />);
  const controls = screen.getAllByRole("checkbox");
  for (const control of controls) expect(control).toBeDisabled();
});

test("Checkbox marks optional controls without an asterisk", () => {
  render(<Checkbox label="Collection" />);
  expect(screen.getByText("(optional)")).toBeInTheDocument();
  expect(screen.queryByText("*")).not.toBeInTheDocument();
});
test("Checkbox displays and connects required validation on submit", async () => {
  const user = userEvent.setup();
  render(
    <form>
      <Checkbox label="Collection" isRequired />
      <button type="submit">Save</button>
    </form>,
  );
  await user.click(screen.getByRole("button", { name: "Save" }));
  const error = document.querySelector(".bd-field-error");
  expect(error).not.toBeNull();
  expect(error?.textContent?.length).toBeGreaterThan(0);
  const control = screen.getByRole("checkbox", { name: "Collection" });
  expect(control).toHaveAccessibleDescription(error?.textContent ?? "");
});
test("Checkbox reports selection and updates the checked state", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<Checkbox label="Collection" isRequired onChange={onChange} />);
  const choice = screen.getByRole("checkbox", { name: "Collection" });
  await user.click(choice);
  expect(choice).toBeChecked();
  expect(onChange).toHaveBeenCalledWith(true);
});
