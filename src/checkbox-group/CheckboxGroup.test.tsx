import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { CheckboxGroup } from "./CheckboxGroup.js";

test("CheckboxGroup names its control and connects help", () => {
  render(
    <CheckboxGroup
      label="Collection"
      description="Choose carefully"
      isRequired
      options={[
        { id: "one", label: "One" },
        { id: "two", label: "Two" },
      ]}
    />,
  );
  const control = screen.getByRole("group", { name: "Collection" });
  expect(control).toHaveAccessibleDescription("Choose carefully");
});
test("CheckboxGroup connects an explicit error", () => {
  render(
    <CheckboxGroup
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
    screen.getByRole("group", { name: "Collection" }),
  ).toHaveAccessibleDescription("Review this value");
});
test("CheckboxGroup disables its controls", () => {
  render(
    <CheckboxGroup
      label="Collection"
      isRequired
      isDisabled
      options={[
        { id: "one", label: "One" },
        { id: "two", label: "Two" },
      ]}
    />,
  );
  const controls = screen.getAllByRole("checkbox");
  for (const control of controls) expect(control).toBeDisabled();
});

test("CheckboxGroup marks optional controls without an asterisk", () => {
  render(
    <CheckboxGroup
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
test("CheckboxGroup displays and connects required validation on submit", async () => {
  const user = userEvent.setup();
  render(
    <form>
      <CheckboxGroup
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
  const control = screen.getByRole("group", { name: "Collection" });
  expect(control).toHaveAccessibleDescription(error?.textContent ?? "");
});
test("CheckboxGroup reports selection and updates the checked state", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <CheckboxGroup
      label="Collection"
      isRequired
      options={[
        { id: "one", label: "One" },
        { id: "two", label: "Two" },
      ]}
      onChange={onChange}
    />,
  );
  const choice = screen.getByRole("checkbox", { name: "One" });
  await user.click(choice);
  expect(choice).toBeChecked();
  expect(onChange).toHaveBeenCalledWith(["one"]);
});

test("CheckboxGroup displays custom selection validation", async () => {
  const user = userEvent.setup();
  render(
    <form>
      <CheckboxGroup
        label="Collection"
        isRequired
        options={[{ id: "one", label: "One" }]}
        defaultValue={["one"]}
        validate={() => "Choose another value"}
      />
      <button type="submit">Save</button>
    </form>,
  );
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(
    screen.getByRole("group", { name: "Collection" }),
  ).toHaveAccessibleDescription("Choose another value");
});
