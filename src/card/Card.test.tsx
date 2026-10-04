import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Card } from "./Card.js";

for (const as of ["article", "section", "div"] as const) {
  test(`Card renders ${as}`, () => {
    render(<Card as={as}>Saved collection</Card>);
    expect(screen.getByText("Saved collection").tagName).toBe(as.toUpperCase());
  });
}
test("Card defaults to an article", () => {
  render(<Card>Saved collection</Card>);
  expect(screen.getByRole("article")).toHaveTextContent("Saved collection");
});
