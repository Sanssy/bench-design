import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { ColorSwatchPicker } from "./ColorSwatchPicker.js";

test("ColorSwatchPicker connects its name and help", () => {
  render(
    <ColorSwatchPicker
      label="Setting"
      description="Choose carefully"
      isRequired
      colors={[
        { id: "lime", name: "Lime", value: "#d8ed69" },
        { id: "ink", name: "Ink", value: "#18201c" },
      ]}
    />,
  );
  expect(
    screen.getByRole("listbox", { name: "Setting" }),
  ).toHaveAccessibleDescription("Choose carefully");
});
test("ColorSwatchPicker connects an external error", () => {
  render(
    <ColorSwatchPicker
      label="Setting"
      isRequired
      isInvalid
      errorMessage="Review setting"
      colors={[
        { id: "lime", name: "Lime", value: "#d8ed69" },
        { id: "ink", name: "Ink", value: "#18201c" },
      ]}
    />,
  );
  expect(
    screen.getByRole("listbox", { name: "Setting" }),
  ).toHaveAccessibleDescription("Review setting");
});
const colors = [
  { id: "lime", name: "Lime", value: "#d8ed69" },
  { id: "ink", name: "Ink", value: "#18201c" },
];
test("ColorSwatchPicker reports IDs and retains uncontrolled selection", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <ColorSwatchPicker
      label="Palette"
      colors={colors}
      defaultValue="lime"
      onChange={onChange}
      name="palette"
    />,
  );
  expect(screen.getByRole("option", { name: "Lime" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await user.click(screen.getByRole("option", { name: "Ink" }));
  expect(onChange).toHaveBeenLastCalledWith("ink");
  expect(screen.getByRole("option", { name: "Ink" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(document.querySelector('input[name="palette"]')).toHaveValue("ink");
});
test("ColorSwatchPicker follows controlled IDs and disables every color", () => {
  const { rerender } = render(
    <ColorSwatchPicker label="Palette" colors={colors} value="lime" />,
  );
  rerender(
    <ColorSwatchPicker
      label="Palette"
      colors={colors}
      value="ink"
      isDisabled
    />,
  );
  expect(screen.getByRole("option", { name: "Ink" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  for (const option of screen.getAllByRole("option"))
    expect(option).toHaveAttribute("aria-disabled", "true");
});

test("ColorSwatchPicker maps shorthand HEX colors to their IDs", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <ColorSwatchPicker
      label="Palette"
      colors={[{ id: "white", name: "White", value: "#fff" }]}
      onChange={onChange}
    />,
  );
  await user.click(screen.getByRole("option", { name: "White" }));
  expect(onChange).toHaveBeenCalledWith("white");
});

test("an invalid picker exposes its invalidity, not only its message", () => {
  render(
    <ColorSwatchPicker
      label="Fabric"
      colors={[{ id: "sand", name: "Sand", value: "#c9b79c" }]}
      isInvalid
      errorMessage="Choose a fabric"
    />,
  );
  expect(screen.getByRole("listbox", { name: "Fabric" })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
});
