import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { GettingStarted, Principles, Themes } from "../.storybook/PublicDocs";

it("documents the delivered CSS import", () => {
  render(<GettingStarted />);
  expect(screen.getByText(/import "bench-design\/styles.css"/)).toBeVisible();
});
it("restricts the editorial font to editorial content", () => {
  render(<Principles />);
  expect(screen.getByText(/exclude controls/)).toBeVisible();
});
it("documents the theme storage contract", () => {
  render(<Themes />);
  expect(screen.getByText(/Le script lit localStorage/)).toBeVisible();
});
