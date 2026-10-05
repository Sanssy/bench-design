import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { IconTile } from "./IconTile.js";

test("IconTile is decorative without a label", () => {
  const { container } = render(<IconTile icon="search" />);
  expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  expect(screen.queryByRole("img")).toBeNull();
  expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
});
test("IconTile exposes one named image and remains noninteractive", () => {
  const { rerender } = render(<IconTile icon="search" label="Search" />);
  const tile = screen.getByRole("img", { name: "Search" });
  expect(screen.getAllByRole("img")).toHaveLength(1);
  expect(tile).not.toHaveAttribute("aria-hidden");
  expect(tile).not.toHaveAttribute("tabindex");
  expect(screen.queryByRole("button")).toBeNull();
  rerender(<IconTile icon="search" label="" />);
  expect(screen.queryByRole("img")).toBeNull();
});
test("IconTile defaults and supported tones and sizes", () => {
  const { container, rerender } = render(<IconTile icon="search" />);
  expect(container.firstElementChild).toHaveAttribute("data-tone", "neutral");
  expect(container.firstElementChild).toHaveAttribute("data-size", "md");
  for (const tone of [
    "neutral",
    "accent",
    "green",
    "orange",
    "violet",
    "magenta",
    "teal",
    "blue",
  ] as const) {
    for (const size of ["sm", "md"] as const) {
      rerender(<IconTile icon="search" tone={tone} size={size} />);
      expect(container.firstElementChild).toHaveAttribute("data-tone", tone);
      expect(container.firstElementChild).toHaveAttribute("data-size", size);
    }
  }
});
