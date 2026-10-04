import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { SearchField } from "./SearchField.js";

test("SearchField names its control and connects help", () => {
  render(
    <SearchField
      label="Collection"
      description="Choose carefully"
      isRequired
    />,
  );
  const control = screen.getByRole("searchbox", { name: "Collection" });
  expect(control).toHaveAccessibleDescription("Choose carefully");
});
test("SearchField connects an explicit error", () => {
  render(
    <SearchField
      label="Collection"
      isRequired
      isInvalid
      errorMessage="Review this value"
    />,
  );
  expect(
    screen.getByRole("searchbox", { name: "Collection" }),
  ).toHaveAccessibleDescription("Review this value");
});
test("SearchField disables its controls", () => {
  render(<SearchField label="Collection" isRequired isDisabled />);
  const controls = screen.getAllByRole("searchbox");
  for (const control of controls) expect(control).toBeDisabled();
});

test("SearchField marks optional controls without an asterisk", () => {
  render(<SearchField label="Collection" />);
  expect(screen.getByText("(optional)")).toBeInTheDocument();
  expect(screen.queryByText("*")).not.toBeInTheDocument();
});
test("SearchField displays and connects required validation on submit", async () => {
  const user = userEvent.setup();
  render(
    <form>
      <SearchField label="Collection" isRequired />
      <button type="submit">Save</button>
    </form>,
  );
  await user.click(screen.getByRole("button", { name: "Save" }));
  const error = document.querySelector(".bd-field-error");
  expect(error).not.toBeNull();
  expect(error?.textContent?.length).toBeGreaterThan(0);
  const control = screen.getByRole("searchbox", { name: "Collection" });
  expect(control).toHaveAccessibleDescription(error?.textContent ?? "");
});
test("SearchField reports edits and accepts a controlled value", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  const { rerender } = render(
    <SearchField
      label="Collection"
      isRequired
      value="Notes"
      onChange={onChange}
    />,
  );
  const input = screen.getByRole("searchbox", { name: "Collection" });
  await user.type(input, "x");
  expect(onChange).toHaveBeenCalledWith("Notesx");
  rerender(<SearchField label="Collection" isRequired value="Updated" />);
  expect(input).toHaveValue("Updated");
});
test("SearchField displays custom validation after submit", async () => {
  const user = userEvent.setup();
  render(
    <form>
      <SearchField
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
    screen.getByRole("searchbox", { name: "Collection" }),
  ).toHaveAccessibleDescription("Choose another value");
});
test("SearchField submits and clears using React Aria actions", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  const onClear = vi.fn();
  render(
    <SearchField
      label="Collection"
      isRequired
      defaultValue="Notes"
      onSubmit={onSubmit}
      onClear={onClear}
    />,
  );
  const input = screen.getByRole("searchbox", { name: "Collection" });
  await user.click(input);
  await user.keyboard("{Enter}");
  expect(onSubmit).toHaveBeenCalledWith("Notes");
  await user.click(screen.getByRole("button"));
  expect(onClear).toHaveBeenCalledOnce();
  expect(input).toHaveValue("");
});
