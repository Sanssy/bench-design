import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Geometry, Palette, Typography } from "../.storybook/Foundations";

describe("foundation documentation", () => {
  it("groups the palette by purpose", () => {
    render(<Palette theme="light" />);
    expect(screen.getByRole("heading", { name: "Surfaces" })).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Focus et sélection" }),
    ).toBeVisible();
  });
  it("provides a readable type scale", () => {
    render(<Typography />);
    expect(
      screen.getByRole("table", { name: "Échelle typographique" }),
    ).toBeVisible();
    expect(screen.getByText(/SOFT 35/)).toBeVisible();
  });
  it("makes the scrolling type scale keyboard accessible", () => {
    render(<Typography />);
    const region = screen.getByRole("region", {
      name: "Échelle typographique",
    });
    expect(region).toHaveAttribute("tabindex", "0");
    region.focus();
    expect(region).toHaveFocus();
  });
  it("provides a keyboard focus target", () => {
    render(<Geometry />);
    expect(
      screen.getByRole("button", { name: "Explorer le focus" }),
    ).toBeVisible();
  });
});
