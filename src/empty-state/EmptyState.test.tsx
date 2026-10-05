import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { Button } from "../button/Button.js";
import { EmptyState } from "./EmptyState.js";

for (const level of [1, 2, 3, 4, 5, 6] as const) {
  test(`EmptyState renders heading level ${level}`, () => {
    render(
      <EmptyState title="No documents" level={level}>
        Add a document.
      </EmptyState>,
    );
    expect(
      screen.getByRole("heading", { level, name: "No documents" }),
    ).toHaveAttribute("data-size", "ui");
    expect(screen.getByText("Add a document.")).toHaveAttribute(
      "data-tone",
      "muted",
    );
  });
}
test("EmptyState defaults to h3 and omits an absent action", () => {
  const { container } = render(
    <EmptyState title="No documents">Add a document.</EmptyState>,
  );
  expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
    "No documents",
  );
  expect(container.querySelector(".bd-empty-state__action")).toBeNull();
});
test("EmptyState presents the supplied action", () => {
  render(
    <EmptyState title="No documents" action={<Button>Import documents</Button>}>
      Add a document.
    </EmptyState>,
  );
  expect(
    screen.getByRole("button", { name: "Import documents" }),
  ).toBeVisible();
});

test("editorial empty state keeps its heading, decorative icon and usable action", async () => {
  const onPress = vi.fn();
  const { container } = render(
    <EmptyState
      title="No resources"
      level={2}
      variant="editorial"
      icon="file-text"
      action={<Button onPress={onPress}>Add resource</Button>}
    >
      Start your collection.
    </EmptyState>,
  );
  expect(
    screen.getByRole("heading", { name: "No resources", level: 2 }),
  ).toHaveAttribute("data-size", "lead");
  expect(container.querySelector(".bd-icon-tile")).toHaveAttribute(
    "data-tone",
    "neutral",
  );
  expect(container.querySelector(".bd-icon-tile")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Add resource" }));
  expect(onPress).toHaveBeenCalledOnce();
});
