import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { TextArea } from "./TextArea.js";

test("TextArea connects its name and help", () => {
  render(<TextArea label="Notes" description="Write freely" isRequired />);
  expect(
    screen.getByRole("textbox", { name: "Notes" }),
  ).toHaveAccessibleDescription("Write freely");
});
test("TextArea connects an external error", () => {
  render(
    <TextArea label="Notes" isRequired isInvalid errorMessage="Review notes" />,
  );
  expect(
    screen.getByRole("textbox", { name: "Notes" }),
  ).toHaveAccessibleDescription("Review notes");
});
test("TextArea edits uncontrolled text and counts only when limited", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  const { rerender } = render(
    <TextArea
      label="Notes"
      isRequired
      defaultValue="Hi"
      maxLength={4}
      onChange={onChange}
    />,
  );
  await user.type(screen.getByRole("textbox"), "abc");
  expect(screen.getByRole("textbox")).toHaveValue("Hiab");
  expect(screen.getByText("4 / 4")).toBeInTheDocument();
  expect(onChange).toHaveBeenLastCalledWith("Hiab");
  rerender(<TextArea label="Notes" isRequired />);
  expect(screen.queryByText("4 / 4")).not.toBeInTheDocument();
});
test("TextArea follows controlled values", () => {
  const { rerender } = render(
    <TextArea label="Notes" value="One" maxLength={10} />,
  );
  rerender(<TextArea label="Notes" value="Three" maxLength={10} />);
  expect(screen.getByRole("textbox")).toHaveValue("Three");
  expect(screen.getByText("5 / 10")).toBeInTheDocument();
});
test("TextArea validates on submit", async () => {
  const user = userEvent.setup();
  render(
    <form>
      <TextArea
        label="Notes"
        isRequired
        defaultValue="Bad"
        validate={() => "Revise notes"}
      />
      <button type="submit">Save</button>
    </form>,
  );
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
    "Revise notes",
  );
});
