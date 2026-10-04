import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { ColorField } from "./ColorField.js";

test("ColorField connects its name and help", () => {
  render(
    <ColorField
      label="Setting"
      description="Choose carefully"
      isRequired
      defaultValue="#d8ed69"
    />,
  );
  expect(
    screen.getByRole("textbox", { name: "Setting" }),
  ).toHaveAccessibleDescription("Choose carefully");
});
test("ColorField connects an external error", () => {
  render(
    <ColorField
      label="Setting"
      isRequired
      isInvalid
      errorMessage="Review setting"
      defaultValue="#d8ed69"
    />,
  );
  expect(
    screen.getByRole("textbox", { name: "Setting" }),
  ).toHaveAccessibleDescription("Review setting");
});
test("ColorField reports HEX edits and updates the preview", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <ColorField label="Color" defaultValue="#d8ed69" onChange={onChange} />,
  );
  const input = screen.getByRole("textbox");
  await user.clear(input);
  await user.type(input, "#18201c");
  await user.tab();
  expect(input).toHaveValue("#18201C");
  expect(onChange).toHaveBeenLastCalledWith("#18201C");
  expect(document.querySelector(".bd-color-preview")).toHaveStyle({
    backgroundColor: "rgb(24, 32, 28)",
  });
});
test("ColorField follows controlled colors and disables editing", () => {
  const { rerender } = render(<ColorField label="Color" value="#d8ed69" />);
  rerender(<ColorField label="Color" value="#18201c" isDisabled />);
  expect(screen.getByRole("textbox")).toHaveValue("#18201C");
  expect(screen.getByRole("textbox")).toBeDisabled();
});
test("ColorField connects custom submit validation", async () => {
  const user = userEvent.setup();
  render(
    <form>
      <ColorField
        label="Color"
        isRequired
        defaultValue="#18201c"
        validate={() => "Choose another color"}
      />
      <button type="submit">Save</button>
    </form>,
  );
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
    "Choose another color",
  );
});
