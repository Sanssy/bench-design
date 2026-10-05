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

test("CategoryLabel replaces the square with a decorative icon", () => {
  render(
    <CategoryLabel category="teal" icon="file-text">
      Research
    </CategoryLabel>,
  );
  expect(screen.getByText("Research")).toBeVisible();
  expect(document.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  expect(document.querySelector(".bd-category-label__marker")).toBeNull();
});
test("CategoryLabel plain keeps a long visible label", () => {
  render(
    <CategoryLabel category="blue" variant="plain">
      Research and supporting documentation
    </CategoryLabel>,
  );
  expect(
    screen
      .getByText("Research and supporting documentation")
      .closest(".bd-category-label"),
  ).toHaveAttribute("data-variant", "plain");
});
