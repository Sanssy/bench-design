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

test.each(["center", "end"] as const)(
  "Dialog %s moves focus to each new view title and keeps Escape dismissal",
  async (placement) => {
    const user = userEvent.setup();
    function Views() {
      const [detail, setDetail] = useState(false);
      return (
        <Dialog
          trigger={<Button>Open views</Button>}
          placement={placement}
          title={detail ? "Detail" : "Overview"}
          {...(detail
            ? { backLabel: "Back to overview", onBack: () => setDetail(false) }
            : {})}
        >
          {detail ? (
            "Detail content"
          ) : (
            <Button onPress={() => setDetail(true)}>Read detail</Button>
          )}
        </Dialog>
      );
    }
    render(<Views />);
    const origin = screen.getByRole("button", { name: "Open views" });
    await user.click(origin);
    expect(
      screen.queryByRole("button", { name: "Back to overview" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Read detail" }));
    expect(screen.getByRole("heading", { name: "Detail" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(
      screen.getByRole("button", { name: "Back to overview" }),
    ).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("heading", { name: "Overview" })).toHaveFocus();
    expect(screen.getByRole("dialog", { name: "Overview" })).toHaveTextContent(
      "Read detail",
    );
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await vi.waitFor(() => expect(origin).toHaveFocus());
  },
);

test("Dialog requires both back props and preserves focus when its title is unchanged", async () => {
  const user = userEvent.setup();
  const props = {
    title: "Details",
    isOpen: true,
    children: <Button>Read</Button>,
  };
  const { rerender } = render(<Dialog {...props} backLabel="Back" />);
  expect(
    screen.queryByRole("button", { name: "Back" }),
  ).not.toBeInTheDocument();
  rerender(<Dialog {...props} onBack={vi.fn()} />);
  expect(screen.getAllByRole("button")).toHaveLength(2);
  await user.click(screen.getByRole("button", { name: "Read" }));
  rerender(<Dialog {...props} backLabel="Back" onBack={vi.fn()} />);
  expect(screen.getByRole("button", { name: "Back" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Read" })).toHaveFocus();
});

test("Dialog keeps focus when a rich title re-renders with the same text", async () => {
  const user = userEvent.setup();
  const view = (
    <Dialog
      isOpen
      title={
        <>
          Same <em>title</em>
        </>
      }
    >
      <Button>Read</Button>
    </Dialog>
  );
  const { rerender } = render(view);
  await user.click(screen.getByRole("button", { name: "Read" }));
  rerender(
    <Dialog
      isOpen
      title={
        <>
          Same <em>title</em>
        </>
      }
    >
      <Button>Read</Button>
    </Dialog>,
  );
  expect(screen.getByRole("button", { name: "Read" })).toHaveFocus();
});
