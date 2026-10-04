import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { Button } from "../button/Button.js";
import { Popover } from "./Popover.js";

test("Popover opens with an accessible name", async () => {
  const user = userEvent.setup();
  render(
    <Popover trigger={<Button>Help</Button>} label="Export help">
      Choose a format.
    </Popover>,
  );
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Help" }));
  expect(screen.getByRole("dialog", { name: "Export help" })).toHaveTextContent(
    "Choose a format.",
  );
});

test("Escape closes Popover", async () => {
  const user = userEvent.setup();
  render(
    <Popover trigger={<Button>Help</Button>} label="Help">
      Content
    </Popover>,
  );
  await user.click(screen.getByRole("button", { name: "Help" }));
  expect(screen.getByRole("dialog", { name: "Help" })).toBeVisible();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
