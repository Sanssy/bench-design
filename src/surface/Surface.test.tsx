import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Surface } from "./Surface.js";

for (const as of ["div", "section", "article", "aside"] as const) {
  test(`Surface renders ${as} with the requested background and spacing`, () => {
    render(
      <Surface as={as} tone="subtle" padding={24}>
        Collection
      </Surface>,
    );
    const surface = screen.getByText("Collection");
    expect(surface.tagName).toBe(as.toUpperCase());
    expect(surface).toHaveAttribute("data-tone", "subtle");
    expect(surface.style.getPropertyValue("--bd-surface-padding")).toBe(
      "var(--bd-space-24)",
    );
  });
}
test("Surface defaults to a raised div without an inline padding override", () => {
  render(<Surface>Collection</Surface>);
  const surface = screen.getByText("Collection");
  expect(surface.tagName).toBe("DIV");
  expect(surface).toHaveAttribute("data-tone", "raised");
  expect(surface.style.getPropertyValue("--bd-surface-padding")).toBe("");
});
