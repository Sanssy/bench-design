import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { RadioGroup } from "./RadioGroup.js";

test("RadioGroup names its control and connects help", () => {
  render(
    <RadioGroup
      label="Collection"
      description="Choose carefully"
      isRequired
      options={[
        { id: "one", label: "One" },
        { id: "two", label: "Two" },
      ]}
    />,
  );
  const control = screen.getByRole("radiogroup", { name: "Collection" });
  expect(control).toHaveAccessibleDescription("Choose carefully");
});
test("RadioGroup connects an explicit error", () => {
  render(
    <RadioGroup
      label="Collection"
      isRequired
      isInvalid
      errorMessage="Review this value"
      options={[
        { id: "one", label: "One" },
        { id: "two", label: "Two" },
      ]}
    />,
  );
  expect(
    screen.getByRole("radiogroup", { name: "Collection" }),
  ).toHaveAccessibleDescription("Review this value");
});
test("RadioGroup disables its controls", () => {
  render(
    <RadioGroup
      label="Collection"
      isRequired
      isDisabled
      options={[
        { id: "one", label: "One" },
        { id: "two", label: "Two" },
      ]}
    />,
  );
  const controls = screen.getAllByRole("radio");
  for (const control of controls) expect(control).toBeDisabled();
});

test("RadioGroup marks optional controls without an asterisk", () => {
  render(
    <RadioGroup
      label="Collection"
      options={[
        { id: "one", label: "One" },
        { id: "two", label: "Two" },
      ]}
    />,
  );
  expect(screen.getByText("(optional)")).toBeInTheDocument();
  expect(screen.queryByText("*")).not.toBeInTheDocument();
});
test("RadioGroup displays and connects required validation on submit", async () => {
  const user = userEvent.setup();
  render(
    <form>
      <RadioGroup
        label="Collection"
        isRequired
        options={[
          { id: "one", label: "One" },
          { id: "two", label: "Two" },
        ]}
      />
      <button type="submit">Save</button>
    </form>,
  );
  await user.click(screen.getByRole("button", { name: "Save" }));
  const error = document.querySelector(".bd-field-error");
  expect(error).not.toBeNull();
  expect(error?.textContent?.length).toBeGreaterThan(0);
  const control = screen.getByRole("radiogroup", { name: "Collection" });
  expect(control).toHaveAccessibleDescription(error?.textContent ?? "");
});
test("RadioGroup reports selection and updates the checked state", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <RadioGroup
      label="Collection"
      isRequired
      options={[
        { id: "one", label: "One" },
        { id: "two", label: "Two" },
      ]}
      onChange={onChange}
    />,
  );
  const choice = screen.getByRole("radio", { name: "One" });
  await user.click(choice);
  expect(choice).toBeChecked();
  expect(onChange).toHaveBeenCalledWith("one");
});

test("RadioGroup displays custom selection validation", async () => {
  const user = userEvent.setup();
  render(
    <form>
      <RadioGroup
        label="Collection"
        isRequired
        options={[{ id: "one", label: "One" }]}
        defaultValue={"one"}
        validate={() => "Choose another value"}
      />
      <button type="submit">Save</button>
    </form>,
  );
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(
    screen.getByRole("radiogroup", { name: "Collection" }),
  ).toHaveAccessibleDescription("Choose another value");
});
