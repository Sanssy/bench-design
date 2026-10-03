import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Text } from "./Text";

test("text defaults to a paragraph with UI size and default tone/variant", () => {
  render(<Text>Read</Text>);
  const text = screen.getByText("Read");
  expect(text.tagName).toBe("P");
  for (const [key, value] of [
    ["size", "ui"],
    ["tone", "default"],
    ["variant", "default"],
  ])
    expect(text).toHaveAttribute(`data-${key}`, value);
});
for (const size of ["meta", "ui", "body", "lead"] as const) {
  for (const variant of ["default", "label", "mono"] as const) {
    for (const tone of ["default", "muted"] as const) {
      test(`inline text ${size} ${variant} ${tone}`, () => {
        render(
          <Text as="span" size={size} variant={variant} tone={tone}>
            Read
          </Text>,
        );
        const text = screen.getByText("Read");
        expect(text.tagName).toBe("SPAN");
        expect(text).toHaveAttribute("data-size", size);
        expect(text).toHaveAttribute("data-variant", variant);
        expect(text).toHaveAttribute("data-tone", tone);
      });
    }
  }
}
