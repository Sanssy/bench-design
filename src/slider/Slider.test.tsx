import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { Slider } from "./Slider.js";

test("Slider connects its name and help", () => {
  render(
    <Slider
      label="Setting"
      description="Choose carefully"
      isRequired
      defaultValue={25}
    />,
  );
  expect(
    screen.getByRole("slider", { name: "Setting" }),
  ).toHaveAccessibleDescription("Choose carefully");
});
test("Slider connects an external error", () => {
  render(
    <Slider
      label="Setting"
      isRequired
      isInvalid
      errorMessage="Review setting"
      defaultValue={25}
    />,
  );
  expect(
    screen.getByRole("slider", { name: "Setting" }),
  ).toHaveAccessibleDescription("Review setting");
});
test("Slider supports keyboard steps and bounds", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <Slider
      label="Zoom"
      defaultValue={20}
      minValue={0}
      maxValue={40}
      step={10}
      onChange={onChange}
    />,
  );
  const slider = screen.getByRole("slider");
  slider.focus();
  await user.keyboard("{ArrowRight}");
  expect(slider).toHaveValue("30");
  expect(onChange).toHaveBeenLastCalledWith(30);
  await user.keyboard("{End}");
  expect(slider).toHaveValue("40");
  await user.keyboard("{Home}");
  expect(slider).toHaveValue("0");
});
test("Slider follows controlled values and disables editing", () => {
  const { rerender } = render(<Slider label="Zoom" value={20} />);
  rerender(<Slider label="Zoom" value={30} isDisabled />);
  expect(screen.getByRole("slider")).toHaveValue("30");
  expect(screen.getByRole("slider")).toBeDisabled();
});

test("submits its value under name", () => {
  const { container } = render(
    <form>
      <Slider label="Zoom" name="zoom" defaultValue={40} />
    </form>,
  );
  const form = container.querySelector("form") as HTMLFormElement;
  expect(new FormData(form).get("zoom")).toBe("40");
});
