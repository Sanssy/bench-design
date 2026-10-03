import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Heading } from "./Heading";

for (const level of [1, 2, 3, 4, 5, 6] as const) {
  test(`heading level ${level} and default size`, () => {
    render(<Heading level={level}>Title</Heading>);
    expect(screen.getByRole("heading", { level })).toHaveAttribute(
      "data-size",
      ["display", "heading", "lead", "ui", "ui", "ui"][level - 1],
    );
  });
}
for (const size of ["display", "heading", "lead", "ui"] as const) {
  test(`explicit heading size ${size} preserves level`, () => {
    render(
      <Heading level={2} size={size}>
        Title
      </Heading>,
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute(
      "data-size",
      size,
    );
  });
}
