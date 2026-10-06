import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { Composer, type ComposerProps } from "./Composer.js";

const mount = (props: Omit<ComposerProps, "label">) =>
  render(<Composer label="Message" {...props} />);
const input = () => screen.getByRole("textbox", { name: "Message" });
const send = () => screen.getByRole("button", { name: "Send" });
test("Composer keeps a hidden label linked and connects errors", () => {
  mount({ hideLabel: true, errorMessage: "Try again", onSubmit: vi.fn() });
  expect(input()).toHaveAccessibleDescription("Try again");
  expect(input()).toHaveAttribute("aria-invalid", "true");
});
test("Composer submits the edited uncontrolled value by pointer without clearing it", async () => {
  const submit = vi.fn();
  const user = userEvent.setup();
  render(<Composer label="Message" onSubmit={submit} />);
  await user.type(input(), "Hello");
  await user.click(send());
  expect(submit).toHaveBeenCalledExactlyOnceWith("Hello");
  expect(input()).toHaveValue("Hello");
});
test("Composer follows controlled values and reports edits", async () => {
  const change = vi.fn();
  const { rerender } = mount({
    value: "Draft",
    onChange: change,
    onSubmit: vi.fn(),
  });
  await userEvent.setup().type(input(), "!");
  expect(change).toHaveBeenLastCalledWith("Draft!");
  rerender(<Composer label="Message" value="Updated" onSubmit={vi.fn()} />);
  expect(input()).toHaveValue("Updated");
});
test("Composer sends with Enter and keeps Shift+Enter as a newline", async () => {
  const submit = vi.fn();
  render(<Composer label="Message" defaultValue="Hello" onSubmit={submit} />);
  const user = userEvent.setup();
  await user.click(input());
  await user.keyboard("{End}{Shift>}{Enter}{/Shift}world{Enter}");
  expect(submit).toHaveBeenCalledExactlyOnceWith("Hello\nworld");
  expect(input()).toHaveFocus();
});
test("Composer never sends an IME confirmation", () => {
  const submit = vi.fn();
  render(<Composer label="Message" defaultValue="文字" onSubmit={submit} />);
  fireEvent.compositionStart(input());
  fireEvent.keyDown(input(), { key: "Enter" });
  fireEvent.compositionEnd(input());
  fireEvent.keyDown(input(), { key: "Enter", isComposing: true });
  fireEvent.keyDown(input(), { key: "Enter", keyCode: 229 });
  expect(submit).not.toHaveBeenCalled();
  fireEvent.keyDown(input(), { key: "Enter" });
  expect(submit).toHaveBeenCalledExactlyOnceWith("文字");
});
test.each([
  { defaultValue: "  \n" },
  { defaultValue: "Draft", isDisabled: true },
  { defaultValue: "Draft", isPending: true },
])("Composer blocks unavailable submissions: %j", async (props) => {
  const submit = vi.fn();
  render(<Composer label="Message" {...props} onSubmit={submit} />);
  fireEvent.keyDown(input(), { key: "Enter" });
  await userEvent.setup().click(send());
  expect(submit).not.toHaveBeenCalled();
});
test("Composer announces pending and restores availability", () => {
  const submit = vi.fn();
  const { rerender } = mount({
    defaultValue: "Draft",
    isPending: true,
    onSubmit: submit,
  });
  expect(screen.getByRole("status")).toHaveTextContent("Sending…");
  expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  expect(send()).toHaveAttribute("aria-disabled", "true");
  rerender(<Composer label="Message" defaultValue="Draft" onSubmit={submit} />);
  expect(screen.getByRole("status")).toBeEmptyDOMElement();
  expect(send()).not.toHaveAttribute("aria-disabled", "true");
});

test("Composer card uses a named icon action and preserves its hidden field label", async () => {
  const submit = vi.fn();
  const { container } = mount({
    variant: "card",
    hideLabel: true,
    defaultValue: "Hello",
    onSubmit: submit,
  });
  expect(container.querySelector(".bd-composer")).toHaveAttribute(
    "data-variant",
    "card",
  );
  expect(send()).toHaveClass("bd-icon-button");
  expect(send().querySelector("svg")).toBeInTheDocument();
  await userEvent.setup().click(send());
  expect(submit).toHaveBeenCalledExactlyOnceWith("Hello");
  expect(input()).toHaveValue("Hello");
});
test("Composer card announces pending and blocks pointer and keyboard submission", async () => {
  const submit = vi.fn();
  mount({
    variant: "card",
    isPending: true,
    defaultValue: "Hello",
    onSubmit: submit,
  });
  expect(send()).toBeDisabled();
  expect(screen.getByRole("status")).toHaveTextContent("Sending…");
  fireEvent.keyDown(input(), { key: "Enter" });
  await userEvent.setup().click(send());
  expect(submit).not.toHaveBeenCalled();
});
