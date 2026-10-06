import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { AppShell } from "../app-shell/AppShell.js";
import { Link } from "../link/Link.js";
import { TopNav } from "../top-nav/TopNav.js";
import { AppHeader } from "./AppHeader.js";

const header = (
  <AppHeader
    brand={<Link href="#home">Workspace</Link>}
    navigation={
      <TopNav
        label="Main pages"
        items={[{ id: "browse", label: "Browse", href: "#browse" }]}
      />
    }
    actions={<button type="button">Account</button>}
    meta="Online"
  />
);
test("exposes the supplied slots and preserves keyboard order", async () => {
  render(header);
  expect(screen.getByRole("banner")).toHaveTextContent("Online");
  expect(
    screen.getByRole("navigation", { name: "Main pages" }),
  ).toBeInTheDocument();
  const user = userEvent.setup();
  for (const name of ["Workspace", "Browse", "Account"]) {
    await user.tab();
    expect(
      screen.getByRole(name === "Account" ? "button" : "link", { name }),
    ).toHaveFocus();
  }
});
test("integrates into AppShell with exactly one header and banner", () => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }));
  try {
    const { container } = render(<AppShell header={header}>Document</AppShell>);
    expect(screen.getAllByRole("banner")).toHaveLength(1);
    expect(container.querySelectorAll("header")).toHaveLength(1);
    expect(screen.getByRole("main")).toHaveTextContent("Document");
  } finally {
    vi.unstubAllGlobals();
  }
});

test("centered navigation preserves source keyboard order", async () => {
  const { rerender } = render(
    <AppHeader {...header.props} navigationAlign="center" />,
  );
  expect(screen.getByRole("banner")).toHaveAttribute(
    "data-navigation-align",
    "center",
  );
  const user = userEvent.setup();
  for (const name of ["Workspace", "Browse", "Account"]) {
    await user.tab();
    expect(
      screen.getByRole(name === "Account" ? "button" : "link", { name }),
    ).toHaveFocus();
  }
  rerender(header);
  expect(screen.getByRole("banner")).toHaveAttribute(
    "data-navigation-align",
    "start",
  );
});
