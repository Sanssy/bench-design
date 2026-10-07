import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { CitationGroup } from "./CitationGroup.js";

const passage = {
  id: "one",
  label: "Excerpt",
  locator: "Page 1",
  quote: "A quoted passage.",
};
test("source heading and caller-owned passages preserve semantics and order", () => {
  const { container, rerender } = render(
    <CitationGroup
      title="Report"
      meta="Archive · 2026"
      citations={[
        passage,
        { id: "two", label: "Summary", quote: "Second passage." },
      ]}
    />,
  );
  expect(
    screen.getByRole("heading", { name: "Report", level: 3 }),
  ).toBeVisible();
  expect(screen.getByText("Archive · 2026")).toBeVisible();
  expect(screen.getByText("Page 1")).toBeVisible();
  expect(
    [...container.querySelectorAll("blockquote")].map(
      (node) => node.textContent,
    ),
  ).toEqual(["A quoted passage.", "Second passage."]);
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  rerender(
    <CitationGroup
      title="Other"
      headingLevel={2}
      icon="briefcase"
      citations={[]}
    />,
  );
  expect(
    screen.getByRole("heading", { name: "Other", level: 2 }),
  ).toBeVisible();
  expect(screen.queryByText("Archive · 2026")).not.toBeInTheDocument();
});
test("each passage owns its navigation or action, never its whole row", async () => {
  const onAction = vi.fn();
  const user = userEvent.setup();
  render(
    <CitationGroup
      title="Report"
      citations={[
        { ...passage, actionLabel: "Read passage", href: "#passage" },
        {
          id: "two",
          label: "Summary",
          quote: "Second passage.",
          actionLabel: "Open preview",
          onAction,
        },
        { id: "three", label: "Note", quote: "No action." },
      ]}
    />,
  );
  const link = screen.getByRole("link", { name: "Read passage" });
  expect(link).toHaveAttribute("href", "#passage");
  expect(link).not.toHaveTextContent(passage.quote);
  await user.click(screen.getByText("Second passage."));
  expect(onAction).not.toHaveBeenCalled();
  await user.tab();
  expect(link).toHaveFocus();
  await user.tab();
  await user.keyboard("{Enter}");
  await user.keyboard(" ");
  expect(onAction).toHaveBeenCalledTimes(2);
  expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  expect(screen.getAllByRole("link")).toHaveLength(1);
  expect(screen.getAllByRole("button")).toHaveLength(1);
});
