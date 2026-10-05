import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { expect, test } from "vitest";
import { Link } from "./Link";

test("preserves the link destination", () => {
  render(<Link href="/chapter">Read chapter</Link>);
  expect(screen.getByRole("link")).toHaveAttribute("href", "/chapter");
});
test("internal links stay in the current tab without an announcement", () => {
  render(<Link href="/chapter">Read chapter</Link>);
  const link = screen.getByRole("link", { name: "Read chapter" });
  expect(link).not.toHaveAttribute("target");
  expect(link).not.toHaveAttribute("rel");
  expect(screen.queryByText("(opens in a new tab)")).toBeNull();
});
test("external links open a new tab", () => {
  render(
    <Link href="https://example.com" external>
      Read chapter
    </Link>,
  );
  expect(screen.getByRole("link")).toHaveAttribute("target", "_blank");
});
test("external links protect the opener and referrer", () => {
  render(
    <Link href="https://example.com" external>
      Read chapter
    </Link>,
  );
  expect(screen.getByRole("link")).toHaveAttribute(
    "rel",
    "noopener noreferrer",
  );
});
test("external links announce the new tab", () => {
  render(
    <Link href="https://example.com" external>
      Read chapter
    </Link>,
  );
  expect(screen.getByRole("link")).toHaveAccessibleName(
    "Read chapter (opens in a new tab)",
  );
  expect(screen.getByText("(opens in a new tab)")).toBeInTheDocument();
});
test("explicit names retain the external announcement", () => {
  render(
    <Link href="https://example.com" external aria-label="Read chapter online">
      Read chapter
    </Link>,
  );
  expect(screen.getByRole("link")).toHaveAccessibleName(
    "Read chapter online (opens in a new tab)",
  );
});
test("forwards the ref and accessible name", () => {
  const ref = createRef<HTMLAnchorElement>();
  render(
    <Link href="/chapter" ref={ref} aria-label="Read chapter details">
      Read chapter
    </Link>,
  );
  expect(ref.current).toBe(
    screen.getByRole("link", { name: "Read chapter details" }),
  );
});

for (const external of [false, true]) {
  test(`decorative icons preserve the ${external ? "external" : "internal"} name`, () => {
    render(
      <Link
        href="/chapter"
        icon="info"
        trailingIcon="arrow-right"
        external={external}
      >
        Read chapter
      </Link>,
    );
    const link = screen.getByRole("link", {
      name: external ? "Read chapter (opens in a new tab)" : "Read chapter",
    });
    const icons = link.querySelectorAll("svg");
    expect(icons).toHaveLength(2);
    for (const icon of icons) {
      expect(icon).toHaveAttribute("aria-hidden", "true");
      expect(icon).toHaveAttribute("focusable", "false");
    }
    expect(screen.queryByRole("img")).toBeNull();
  });
}
