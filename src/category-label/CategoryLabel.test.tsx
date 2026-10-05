import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { CategoryLabel } from "./CategoryLabel.js";

test("CategoryLabel keeps the category readable without its decorative color", () => {
  render(<CategoryLabel category="teal">Research</CategoryLabel>);
  expect(screen.getByText("Research")).toBeVisible();
  expect(document.querySelector(".bd-category-label__marker")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
});
