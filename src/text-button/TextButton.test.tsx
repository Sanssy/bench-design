import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { TextButton } from "./TextButton.js";

test("TextButton is a link-styled native button activated by keyboard", async () => {
  const user = userEvent.setup();
  const press = vi.fn();
  render(
    <TextButton onPress={press} variant="meta" trailingIcon="arrow-up-right">
      2 source records
    </TextButton>,
  );
  const button = screen.getByRole("button", { name: "2 source records" });
  expect(button).toHaveClass("bd-link");
  expect(button).toHaveAttribute("data-variant", "meta");
  expect(button).toHaveAttribute("type", "button");
  await user.tab();
  expect(button).toHaveFocus();
  await user.keyboard("{Enter}");
  await user.keyboard(" ");
  expect(press).toHaveBeenCalledTimes(2);
});
