import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { ManifestProps } from "../.storybook/ManifestProps";

it("shows exact literal types, required flags and defaults from the manifest", () => {
  render(<ManifestProps component="Badge" />);
  const row = screen.getByRole("row", { name: /tone/ });
  expect(
    within(row).getByText(
      '| "neutral" | "success" | "warning" | "danger" | "teal" | "magenta" | "orange" | "violet" | "green" | "blue"',
    ),
  ).toBeVisible();
  expect(within(row).getByText("No")).toBeVisible();
  expect(within(row).getByText('"neutral"')).toBeVisible();
  expect(
    screen.getByRole("row", { name: /children string \| number Yes/ }),
  ).toBeVisible();
});
