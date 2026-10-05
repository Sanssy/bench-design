import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { TopNav } from "./TopNav";

const items = [
  {
    id: "browse",
    label: "Browse",
    href: "#browse",
    count: 0,
    icon: "search" as const,
  },
  { id: "saved", label: "Saved", href: "#saved", count: 123 },
  { id: "ask", label: "Ask", href: "#ask" },
];
test("names page navigation and preserves native destinations without tabs", () => {
  render(<TopNav label="Main pages" items={items} />);
  expect(
    screen.getByRole("navigation", { name: "Main pages" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Ask" })).toHaveAttribute(
    "href",
    "#ask",
  );
  expect(screen.queryByRole("tablist")).toBeNull();
});
test("updates the current page from the consumer", () => {
  const { rerender } = render(
    <TopNav label="Pages" items={items} currentId="browse" />,
  );
  expect(screen.getByRole("link", { name: "Browse 0" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  rerender(<TopNav label="Pages" items={items} currentId="ask" />);
  expect(screen.getByRole("link", { name: "Browse 0" })).not.toHaveAttribute(
    "aria-current",
  );
  expect(screen.getByRole("link", { name: "Ask" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  rerender(<TopNav label="Pages" items={items} />);
  expect(document.querySelector("[aria-current]")).toBeNull();
});
test("announces zero and large counts with the destination and keeps icons decorative", () => {
  render(<TopNav label="Pages" items={items} />);
  expect(screen.getByRole("link", { name: "Browse 0" })).toHaveTextContent("0");
  expect(screen.getByRole("link", { name: "Saved 123" })).toHaveTextContent(
    "123",
  );
  expect(screen.getByRole("link", { name: "Ask" })).toHaveTextContent(/^Ask$/);
  expect(screen.queryByRole("img")).toBeNull();
});
test("all destinations participate in native Tab order", async () => {
  render(<TopNav label="Pages" items={items} />);
  const user = userEvent.setup();
  for (const link of screen.getAllByRole("link")) {
    await user.tab();
    expect(link).toHaveFocus();
  }
});
