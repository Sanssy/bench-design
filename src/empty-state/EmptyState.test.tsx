import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
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
