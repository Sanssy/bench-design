import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, test, vi } from "vitest";
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

test("Dialog supports external opening without a trigger and restores origin focus", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  function Example() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onPress={() => setOpen(true)}>Show help</Button>
        <Dialog
          title="Help"
          isOpen={open}
          onOpenChange={(next) => {
            change(next);
            setOpen(next);
          }}
        >
          Instructions
        </Dialog>
      </>
    );
  }
  render(<Example />);
  const origin = screen.getByRole("button", { name: "Show help" });
  await user.tab();
  await user.keyboard("{Enter}");
  expect(screen.getByRole("dialog", { name: "Help" })).toBeInTheDocument();
  await user.keyboard("{Escape}");
  expect(change).toHaveBeenCalledWith(false);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await vi.waitFor(() => expect(origin).toHaveFocus());
});
test("Dialog follows controlled changes with its optional trigger", () => {
  const { rerender } = render(
    <Dialog title="Help" trigger={<Button>Open</Button>} isOpen>
      Instructions
    </Dialog>,
  );
  expect(screen.getByRole("dialog", { name: "Help" })).toBeInTheDocument();
  rerender(
    <Dialog title="Help" trigger={<Button>Open</Button>} isOpen={false}>
      Instructions
    </Dialog>,
  );
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("End Dialog keeps a rich accessible title and restores focus after Escape", async () => {
  const user = userEvent.setup();
  render(
    <Dialog
      trigger={<Button>Open sheet</Button>}
      title={
        <>
          Add <em>documents</em>
        </>
      }
      placement="end"
      size="wide"
    >
      <Button>Choose files</Button>
    </Dialog>,
  );
  const origin = screen.getByRole("button", { name: "Open sheet" });
  await user.click(origin);
  const dialog = screen.getByRole("dialog", { name: "Add documents" });
  expect(dialog.closest(".bd-modal")).toHaveClass(
    "bd-modal-end",
    "bd-modal-wide",
  );
  expect(screen.getByRole("heading", { name: "Add documents" })).toBeVisible();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await vi.waitFor(() => expect(origin).toHaveFocus());
});
