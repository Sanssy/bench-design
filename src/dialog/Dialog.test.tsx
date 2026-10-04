import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { Button } from "../button/Button.js";
import { Dialog } from "./Dialog.js";

test("Dialog opens with its title as accessible name", async () => {
  const user = userEvent.setup();
  render(
    <Dialog trigger={<Button>Open</Button>} title="Document details">
      Content
    </Dialog>,
  );
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Open" }));
  expect(
    screen.getByRole("dialog", { name: "Document details" }),
  ).toHaveTextContent("Content");
});

test("Dialog close action hides the dialog", async () => {
  const user = userEvent.setup();
  render(
    <Dialog trigger={<Button>Open</Button>} title="Details">
      Content
    </Dialog>,
  );
  await user.click(screen.getByRole("button", { name: "Open" }));
  await user.click(screen.getByRole("button", { name: "Close" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
