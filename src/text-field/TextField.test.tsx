import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { TextField } from "./TextField.js";

test("TextField names its control and connects help", () => {
  render(
    <TextField label="Collection" description="Choose carefully" isRequired />,
  );
  const control = screen.getByRole("textbox", { name: "Collection" });
  expect(control).toHaveAccessibleDescription("Choose carefully");
});
test("TextField connects an explicit error", () => {
  render(
    <TextField
      label="Collection"
      isRequired
      isInvalid
      errorMessage="Review this value"
    />,
  );
  expect(
    screen.getByRole("textbox", { name: "Collection" }),
  ).toHaveAccessibleDescription("Review this value");
});
test("TextField disables its controls", () => {
  render(<TextField label="Collection" isRequired isDisabled />);
  const controls = screen.getAllByRole("textbox");
  for (const control of controls) expect(control).toBeDisabled();
});

test("TextField marks optional controls without an asterisk", () => {
  render(<TextField label="Collection" />);
  expect(screen.getByText("(optional)")).toBeInTheDocument();
  expect(screen.queryByText("*")).not.toBeInTheDocument();
});
test("TextField displays and connects required validation on submit", async () => {
  const user = userEvent.setup();
  render(
    <form>
      <TextField label="Collection" isRequired />
      <button type="submit">Save</button>
    </form>,
  );
  await user.click(screen.getByRole("button", { name: "Save" }));
  const error = document.querySelector(".bd-field-error");
  expect(error).not.toBeNull();
  expect(error?.textContent?.length).toBeGreaterThan(0);
  const control = screen.getByRole("textbox", { name: "Collection" });
  expect(control).toHaveAccessibleDescription(error?.textContent ?? "");
});
test("TextField reports edits and accepts a controlled value", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  const { rerender } = render(
    <TextField
      label="Collection"
      isRequired
      value="Notes"
      onChange={onChange}
    />,
  );
  const input = screen.getByRole("textbox", { name: "Collection" });
  await user.type(input, "x");
  expect(onChange).toHaveBeenCalledWith("Notesx");
  rerender(<TextField label="Collection" isRequired value="Updated" />);
  expect(input).toHaveValue("Updated");
});
test("TextField displays custom validation after submit", async () => {
  const user = userEvent.setup();
  render(
    <form>
      <TextField
        label="Collection"
        isRequired
        defaultValue="Rejected"
        validate={() => "Choose another value"}
      />
      <button type="submit">Save</button>
    </form>,
  );
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(
    screen.getByRole("textbox", { name: "Collection" }),
  ).toHaveAccessibleDescription("Choose another value");
});

test("TextField limits native editing to maxLength", async () => {
  const user = userEvent.setup();
  render(<TextField label="Name" isRequired maxLength={5} />);
  const input = screen.getByRole("textbox", { name: "Name" });
  await user.type(input, "1234567");
  expect(input).toHaveValue("12345");
  expect(input).toHaveAttribute("maxlength", "5");
});
