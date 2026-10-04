import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { Select } from "./Select.js";

test("Select names its control and connects help", () => {
  render(
    <Select
      label="Collection"
      description="Choose carefully"
      isRequired
      options={[
        { id: "one", label: "One" },
        { id: "two", label: "Two" },
      ]}
    />,
  );
  const control = screen.getByRole("button", { name: /Collection/ });
  expect(control).toHaveAccessibleDescription("Choose carefully");
});
test("Select connects an explicit error", () => {
  render(
    <Select
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
    screen.getByRole("button", { name: /Collection/ }),
  ).toHaveAccessibleDescription("Review this value");
});
test("Select disables its controls", () => {
  render(
    <Select
      label="Collection"
      isRequired
      isDisabled
      options={[
        { id: "one", label: "One" },
        { id: "two", label: "Two" },
      ]}
    />,
  );
  const controls = screen.getAllByRole("button");
  for (const control of controls) expect(control).toBeDisabled();
});

test("Select marks optional controls without an asterisk", () => {
  render(
    <Select
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
test("Select displays and connects required validation on submit", async () => {
  const user = userEvent.setup();
  render(
    <form>
      <Select
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
  const control = screen.getByRole("button", { name: /Collection/ });
  expect(control).toHaveAccessibleDescription(error?.textContent ?? "");
});
test("Select opens, selects and reports a choice", async () => {
  const user = userEvent.setup();
  const onSelectionChange = vi.fn();
  render(
    <Select
      label="Collection"
      isRequired
      options={[
        { id: "one", label: "One" },
        { id: "two", label: "Two", isDisabled: true },
      ]}
      onSelectionChange={onSelectionChange}
    />,
  );
  await user.click(screen.getByRole("button", { name: /Collection/ }));
  expect(screen.getByRole("option", { name: "Two" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await user.click(screen.getByRole("option", { name: "One" }));
  expect(onSelectionChange).toHaveBeenCalledWith("one");
  const trigger = screen.getByRole("button", { name: /Collection/ });
  expect(trigger).toHaveTextContent("One");
  // The trigger shows the option text only, never its check icon.
  expect(trigger.querySelectorAll("svg")).toHaveLength(1);
});

test("Select displays custom selection validation", async () => {
  const user = userEvent.setup();
  render(
    <form>
      <Select
        label="Collection"
        isRequired
        options={[{ id: "one", label: "One" }]}
        defaultSelectedKey={"one"}
        validate={() => "Choose another value"}
      />
      <button type="submit">Save</button>
    </form>,
  );
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(
    screen.getByRole("button", { name: /Collection/ }),
  ).toHaveAccessibleDescription("Choose another value");
});
