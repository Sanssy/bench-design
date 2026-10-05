import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { expect, test, vi } from "vitest";
import { Button } from "../button/Button.js";
import { IconButton, type IconButtonProps } from "./IconButton.js";

test("Button places a decorative 20px icon before its visible label", () => {
  render(<Button icon="plus">Add</Button>);
  const button = screen.getByRole("button", { name: "Add" });
  expect(button.firstChild).toBe(button.querySelector("svg"));
  expect(button.querySelector("svg")).toHaveAttribute("width", "20");
  expect(button.querySelector("svg")).toHaveAttribute("height", "20");
  expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  expect(button.lastChild?.textContent).toBe("Add");
});

test("IconButton has an accessible name and decorative icon", () => {
  render(<IconButton icon="search" label="Search documents" />);
  const button = screen.getByRole("button", { name: "Search documents" });
  expect(button).not.toHaveAttribute("title");
  expect(button).toHaveAttribute("data-variant", "secondary");
  expect(button).toHaveAttribute("type", "button");
  expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  expect(button.querySelector("svg")).toHaveAttribute("width", "20");
});

for (const action of ["pointer", "{Enter}", " "]) {
  for (const isDisabled of [false, true]) {
    test(`IconButton ${action}, disabled=${isDisabled}`, async () => {
      const user = userEvent.setup();
      const onPress = vi.fn();
      render(
        <IconButton
          icon="search"
          label="Search"
          onPress={onPress}
          isDisabled={isDisabled}
        />,
      );
      const button = screen.getByRole("button", { name: "Search" });
      expect((button as HTMLButtonElement).disabled).toBe(isDisabled);
      if (action === "pointer") await user.click(button);
      else {
        button.focus();
        await user.keyboard(action);
      }
      expect(onPress).toHaveBeenCalledTimes(isDisabled ? 0 : 1);
    });
  }
}

test("IconButton forwards its DOM ref, variant and native type", () => {
  const ref = createRef<HTMLButtonElement>();
  render(
    <IconButton
      ref={ref}
      icon="search"
      label="Search"
      variant="primary"
      type="submit"
    />,
  );
  expect(ref.current).toBe(screen.getByRole("button"));
  expect(ref.current).toHaveAttribute("type", "submit");
  expect(ref.current).toHaveAttribute("data-variant", "primary");
});

// @ts-expect-error an accessible label is required
const missingLabel: IconButtonProps = { icon: "search" };
// @ts-expect-error an icon is required
const missingIcon: IconButtonProps = { label: "Search" };
void [missingLabel, missingIcon];

test("IconButton exposes its label on keyboard focus and closes on Escape", async () => {
  const user = userEvent.setup();
  const { rerender } = render(<IconButton icon="search" label="Search" />);
  await user.tab();
  expect(await screen.findByRole("tooltip")).toHaveTextContent("Search");
  expect(screen.getByRole("button", { name: "Search" })).toHaveFocus();
  rerender(<IconButton icon="search" label="Find documents" />);
  expect(screen.getByRole("tooltip")).toHaveTextContent("Find documents");
  expect(
    screen.getByRole("button", { name: "Find documents" }),
  ).not.toHaveAttribute("title");
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});
