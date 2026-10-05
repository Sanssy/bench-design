import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { Button } from "../button/Button.js";
import { Avatar } from "./Avatar.js";

test("initials keep the full accessible name", () => {
  render(<Avatar name="Ada Lovelace" />);
  expect(screen.getByRole("img", { name: "Ada Lovelace" })).toHaveTextContent(
    "AL",
  );
});
test("decorative avatar is hidden", () => {
  render(<Avatar name="Ada Lovelace" isDecorative />);
  expect(screen.queryByRole("img")).toBeNull();
});
test("failed photo falls back to initials", () => {
  const { container } = render(
    <Avatar name="Ada Lovelace" src="/missing.png" />,
  );
  const image = container.querySelector("img");
  expect(image).not.toBeNull();
  if (!image) throw new Error("Missing image");
  fireEvent.error(image);
  expect(screen.getByRole("img", { name: "Ada Lovelace" })).toHaveTextContent(
    "AL",
  );
});
test("a new photo source retries after failure", () => {
  const { container, rerender } = render(
    <Avatar name="Ada Lovelace" src="/first.png" />,
  );
  const image = container.querySelector("img");
  if (!image) throw new Error("Missing image");
  fireEvent.error(image);
  rerender(<Avatar name="Ada Lovelace" src="/second.png" />);
  expect(container.querySelector("img")).toHaveAttribute("src", "/second.png");
});

for (const tone of [undefined, "accent"] as const) {
  test(`avatar tone ${tone ?? "neutral"} retains its full name`, () => {
    render(<Avatar name="Ada Lovelace" {...(tone ? { tone } : {})} />);
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toHaveAttribute(
      "data-tone",
      tone ?? "neutral",
    );
  });
}

test("an identity action has a full accessible name and keyboard activation", async () => {
  const onPress = vi.fn();
  render(
    <Button aria-label="Open Ada Lovelace profile" onPress={onPress}>
      <Avatar name="Ada Lovelace" isDecorative />
    </Button>,
  );
  const user = userEvent.setup();
  await user.tab();
  expect(
    screen.getByRole("button", { name: "Open Ada Lovelace profile" }),
  ).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(onPress).toHaveBeenCalledOnce();
});
