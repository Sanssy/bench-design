import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Icon } from "./Icon";
import { type IconName, icons } from "./icons";

test("decorative icon is hidden and has no role", () => {
  const { container } = render(<Icon name="plus" />);
  const svg = container.querySelector("svg");
  expect(svg).toHaveAttribute("aria-hidden", "true");
  expect(svg).not.toHaveAttribute("role");
  expect(svg).toHaveAttribute("focusable", "false");
  expect(svg).toHaveAttribute("width", "24");
  expect(svg).toHaveAttribute("height", "24");
});
test("label exposes an image with an accessible name", () => {
  render(<Icon name="search" label="Search" />);
  expect(screen.getByRole("img", { name: "Search" })).not.toHaveAttribute(
    "aria-hidden",
  );
});
for (const size of [16, 20, 24] as const) {
  test(`explicit size ${size}`, () => {
    render(<Icon name="check" size={size} label="Done" />);
    expect(screen.getByRole("img")).toHaveAttribute("width", String(size));
    expect(screen.getByRole("img")).toHaveAttribute("height", String(size));
  });
}
for (const name of Object.keys(icons) as IconName[]) {
  test(`renders ${name} geometry`, () => {
    render(<Icon name={name} label={name} />);
    const svg = screen.getByRole("img", { name });
    expect(svg.tagName).toBe("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("stroke", "currentColor");
    expect(svg.children.length).toBeGreaterThan(0);
  });
}
