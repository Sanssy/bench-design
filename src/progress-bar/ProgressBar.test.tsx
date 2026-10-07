import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ProgressBar } from "./ProgressBar.js";

test("names progress and updates a custom range", () => {
  const { rerender } = render(
    <ProgressBar label="Processing" value={30} minValue={10} maxValue={50} />,
  );
  const bar = screen.getByRole("progressbar", { name: "Processing" });
  expect(bar).toHaveAttribute("aria-valuemin", "10");
  expect(bar).toHaveAttribute("aria-valuemax", "50");
  expect(bar).toHaveAttribute("aria-valuenow", "30");
  expect(screen.getByText("50%")).toBeInTheDocument();
  rerender(
    <ProgressBar label="Processing" value={50} minValue={10} maxValue={50} />,
  );
  expect(bar).toHaveAttribute("aria-valuenow", "50");
});
test("hides a label without removing the accessible name", () => {
  render(<ProgressBar label="Processing" value={0} hideLabel />);
  expect(
    screen.getByRole("progressbar", { name: "Processing" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Processing")).toHaveClass("bd-field-hidden-label");
});
test("uses the supplied value text", () => {
  render(<ProgressBar label="Processing" value={40} valueLabel="4 of 10" />);
  expect(screen.getByText("4 of 10")).toBeInTheDocument();
  expect(screen.getByRole("progressbar")).toHaveAttribute(
    "aria-valuetext",
    "4 of 10",
  );
});
test("indeterminate progress omits a numeric value", () => {
  render(<ProgressBar label="Processing" value={40} isIndeterminate />);
  expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
  expect(screen.getByRole("progressbar")).toHaveAttribute("data-indeterminate");
  expect(screen.queryByText("40%")).not.toBeInTheDocument();
});
