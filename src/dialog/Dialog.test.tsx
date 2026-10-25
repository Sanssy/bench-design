import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, test, vi } from "vitest";
import { BenchProvider } from "../bench-provider/BenchProvider.js";
import { Button } from "../button/Button.js";
import type { IconName } from "../icon/icons.js";
import type { DialogProps } from "../index.js";
import { Dialog } from "./Dialog.js";

type CloseIconVariant = NonNullable<DialogProps["closeIconVariant"]>;
const validCloseIconVariants: CloseIconVariant[] = ["sharp", "rounded"];
const widenedCloseIconVariant: string = "rounded";
// @ts-expect-error a widened string is not a supported close variant
const invalidWidenedCloseIconVariant: CloseIconVariant =
  widenedCloseIconVariant;
// @ts-expect-error unsupported literal variants are not accepted
const invalidLiteralCloseIconVariant: CloseIconVariant = "rounded-outline";
const arbitraryCloseIcon: IconName = "close-rounded";
// @ts-expect-error callers choose a bounded variant, not an IconName
const invalidIconNameCloseIconVariant: CloseIconVariant = arbitraryCloseIcon;
void [
  validCloseIconVariants,
  invalidWidenedCloseIconVariant,
  invalidLiteralCloseIconVariant,
  invalidIconNameCloseIconVariant,
];

test.each([undefined, 14, 16, 18, 20, 24] as const)(
  "Dialog renders close glyph size %s through its trigger",
  async (size) => {
    const user = userEvent.setup();
    const sizeProps = size === undefined ? {} : { closeIconSize: size };
    render(
      <Dialog
        trigger={<Button>Open sized dialog</Button>}
        title="Sizing"
        {...sizeProps}
      >
        Content
      </Dialog>,
    );
    await user.click(screen.getByRole("button", { name: "Open sized dialog" }));
    const close = screen.getByRole("button", { name: "Close" });
    const expectedSize = size ?? 20;
    expect(close).toHaveClass("bd-icon-button");
    expect(close.querySelector("svg")).toHaveAttribute(
      "width",
      String(expectedSize),
    );
    expect(close.querySelector("svg")).toHaveAttribute(
      "height",
      String(expectedSize),
    );
    expect(close.querySelector("svg")).toHaveAttribute("stroke-width", "2");
    expect(close.querySelector("svg")).toHaveAttribute(
      "stroke-linecap",
      "butt",
    );
    expect(close.querySelector("svg path")).toHaveAttribute(
      "d",
      "M6.7071 6.7071L17.2929 17.2929M17.2929 6.7071L6.7071 17.2929",
    );
  },
);

test.each([16, 20] as const)(
  "controlled Dialog changes only the close glyph to rounded at size %s",
  (size) => {
    const { rerender } = render(
      <Dialog
        isOpen
        title="Sizing"
        closeIconSize={size}
        closeIconVariant="sharp"
      >
        Content
      </Dialog>,
    );
    const close = screen.getByRole("button", { name: "Close" });
    const glyph = close.querySelector("svg");
    expect(close).toHaveClass("bd-icon-button");
    expect(glyph).toHaveAttribute("width", String(size));
    expect(glyph).toHaveAttribute("height", String(size));
    expect(glyph).toHaveAttribute("stroke-width", "2");
    expect(glyph).toHaveAttribute("stroke-linecap", "butt");
    expect(glyph?.querySelector("path")).toHaveAttribute(
      "d",
      "M6.7071 6.7071L17.2929 17.2929M17.2929 6.7071L6.7071 17.2929",
    );

    rerender(
      <Dialog
        isOpen
        title="Sizing"
        closeIconSize={size}
        closeIconVariant="rounded"
      >
        Content
      </Dialog>,
    );
    expect(screen.getByRole("button", { name: "Close" })).toBe(close);
    expect(close).toHaveAccessibleName("Close");
    expect(close).toHaveClass("bd-icon-button");
    expect(glyph).toHaveAttribute("width", String(size));
    expect(glyph).toHaveAttribute("height", String(size));
    expect(glyph).toHaveAttribute("stroke", "currentColor");
    expect(glyph).toHaveAttribute("stroke-width", "3");
    expect(glyph).toHaveAttribute("stroke-linecap", "round");
    expect(glyph).toHaveAttribute("stroke-linejoin", "round");
    expect(glyph?.querySelector("path")).toHaveAttribute(
      "d",
      "M6 6l12 12M18 6L6 18",
    );
  },
);

test("controlled Dialog rerender updates only the close glyph size", () => {
  const renderDialog = (closeIconSize: 16 | 24) => (
    <Dialog isOpen title="Sizing" closeIconSize={closeIconSize}>
      Content
    </Dialog>
  );
  const { rerender } = render(renderDialog(16));
  const close = screen.getByRole("button", { name: "Close" });
  expect(close.querySelector("svg")).toHaveAttribute("width", "16");
  expect(close.querySelector("svg")).toHaveAttribute("height", "16");

  rerender(renderDialog(24));
  expect(screen.getByRole("button", { name: "Close" })).toBe(close);
  expect(close).toHaveAccessibleName("Close");
  expect(close.querySelector("svg")).toHaveAttribute("width", "24");
  expect(close.querySelector("svg")).toHaveAttribute("height", "24");
});

test("Dialog close name follows the French locale and closes", async () => {
  const user = userEvent.setup();
  render(
    <BenchProvider locale="fr-FR">
      <Dialog trigger={<Button>Open French dialog</Button>} title="Aide">
        Instructions
      </Dialog>
    </BenchProvider>,
  );

  await user.click(screen.getByRole("button", { name: "Open French dialog" }));
  const close = screen.getByRole("button", { name: "Fermer" });
  await user.click(close);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("Dialog close name follows a message override and closes", async () => {
  const user = userEvent.setup();
  render(
    <BenchProvider messages={{ close: "Fermer la fenêtre" }}>
      <Dialog trigger={<Button>Open overridden dialog</Button>} title="Help">
        Instructions
      </Dialog>
    </BenchProvider>,
  );

  await user.click(
    screen.getByRole("button", { name: "Open overridden dialog" }),
  );
  const close = screen.getByRole("button", {
    name: "Fermer la fenêtre",
  });
  await user.click(close);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

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

test.each(["center", "end"] as const)(
  "Dialog %s announces its description and orders rich header metadata",
  (placement) => {
    render(
      <Dialog
        isOpen
        placement={placement}
        eyebrow="Collection"
        meta={<span>Reviewed</span>}
        title="Document details"
        description={
          <>
            Read the <em>source</em> before sharing.
          </>
        }
      >
        Content
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog", { name: "Document details" });
    expect(dialog).toHaveAccessibleDescription(
      "Read the source before sharing.",
    );
    const header = dialog.querySelector("header > div");
    expect(
      Array.from(header?.children ?? []).map((child) => child.textContent),
    ).toEqual([
      "Collection",
      "Reviewed",
      "Document details",
      "Read the source before sharing.",
    ]);
    expect(screen.getByText("source").closest(".bd-text")).toHaveAttribute(
      "data-tone",
      "muted",
    );
  },
);

test("Dialog omits optional header slots and description association by default", () => {
  render(
    <Dialog isOpen title="Details" eyebrow="Collection">
      Content
    </Dialog>,
  );
  const dialog = screen.getByRole("dialog", { name: "Details" });
  expect(dialog).not.toHaveAttribute("aria-describedby");
  expect(dialog).toHaveAccessibleDescription("");
  expect(
    Array.from(dialog.querySelector("header > div")?.children ?? []).map(
      (child) => child.textContent,
    ),
  ).toEqual(["Collection", "Details"]);
});
