import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { BootstrapHarness } from "./fixtures/BootstrapHarness";

test("bootstrap harness renders a named native control", () => {
  render(<BootstrapHarness />);
  expect(
    screen.getByRole("button", { name: "Exercise harness" }),
  ).toBeVisible();
});

test("bootstrap harness exposes a native click to React state", async () => {
  const user = userEvent.setup();
  render(<BootstrapHarness />);
  await user.click(screen.getByRole("button", { name: "Exercise harness" }));
  expect(screen.getByRole("status")).toHaveTextContent("Interactions: 1");
});
