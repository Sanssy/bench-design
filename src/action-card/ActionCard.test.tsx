import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { ActionCard } from "./ActionCard.js";

test("link uses title as its name and description separately", () => {
  render(
    <ActionCard
      href="#notes"
      title="Field notes"
      description="Read the archive"
      eyebrow="Archive"
      media={<span>Preview</span>}
    />,
  );
  const link = screen.getByRole("link", { name: "Field notes" });
  expect(link).toHaveAttribute("href", "#notes");
  expect(link).toHaveAccessibleDescription("Read the archive");
  expect(screen.getByText("Preview")).toBeVisible();
  expect(screen.getByText("Archive")).toBeVisible();
  expect(link.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
});
test("action responds once to click, Enter and Space", async () => {
  const user = userEvent.setup();
  const onPress = vi.fn();
  render(<ActionCard title="Create a note" onPress={onPress} />);
  const button = screen.getByRole("button", { name: "Create a note" });
  expect(button).toHaveAttribute("type", "button");
  expect(button.querySelector("svg")).toBeNull();
  await user.click(button);
  await user.keyboard("{Enter} ");
  expect(onPress).toHaveBeenCalledTimes(3);
});
test("disabled action cannot activate or receive tab focus", async () => {
  const user = userEvent.setup();
  const onPress = vi.fn();
  render(<ActionCard title="Create a note" onPress={onPress} isDisabled />);
  const button = screen.getByRole("button", { name: "Create a note" });
  expect(button).toBeDisabled();
  await user.click(button);
  await user.tab();
  expect(button).not.toHaveFocus();
  expect(onPress).not.toHaveBeenCalled();
});
test("custom trailing content is decorative and description IDs are unique", () => {
  render(
    <>
      <ActionCard
        href="#one"
        title="One"
        description="First"
        trailingIcon={<span>Go</span>}
      />
      <ActionCard
        href="#two"
        title="Two"
        description="Second"
        trailingIcon={null}
      />
    </>,
  );
  expect(screen.getByRole("link", { name: "One" })).toHaveAccessibleDescription(
    "First",
  );
  expect(screen.getByRole("link", { name: "Two" })).toHaveAccessibleDescription(
    "Second",
  );
  expect(screen.getByText("Go").parentElement).toHaveAttribute(
    "aria-hidden",
    "true",
  );
  expect(
    screen.getByRole("link", { name: "Two" }).querySelector("svg"),
  ).toBeNull();
});
