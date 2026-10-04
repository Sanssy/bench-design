import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Badge } from "./Badge.js";

for (const variant of ["outline", "solid"] as const) {
  test(`Badge renders ${variant} plain text`, () => {
    render(<Badge variant={variant}>SVG</Badge>);
    expect(screen.getByText("SVG")).toHaveAttribute("data-variant", variant);
    expect(screen.getByText("SVG").tagName).toBe("SPAN");
    expect(screen.queryByRole("button")).toBeNull();
  });
}
test("Badge defaults to outline and accepts a count", () => {
  render(<Badge>{12}</Badge>);
  expect(screen.getByText("12")).toHaveAttribute("data-variant", "outline");
});

test("Badge defaults to neutral and exposes status tones", () => {
  const { rerender } = render(<Badge>Ready</Badge>);
  expect(screen.getByText("Ready")).toHaveAttribute("data-tone", "neutral");
  for (const tone of ["success", "warning", "danger"] as const) {
    rerender(<Badge tone={tone}>Ready</Badge>);
    expect(screen.getByText("Ready")).toHaveAttribute("data-tone", tone);
  }
});
