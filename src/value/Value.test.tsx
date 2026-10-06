import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Value } from "./Value.js";

test("a total produces an English accessible name and visible fraction", () => {
  render(<Value value={7} total={10} />);
  const value = screen.getByRole("img", { name: "7 of 10" });
  expect(value).toHaveTextContent("7/10");
  expect(value).toHaveAttribute("data-mode", "plain");
});
for (const sign of ["+", "-", "±"] as const) {
  test(`a ${sign} sign and unit are both visible and named`, () => {
    render(<Value value="12.5" sign={sign} unit="%" />);
    expect(
      screen.getByRole("img", { name: `${sign}12.5 %` }),
    ).toHaveTextContent(`${sign}12.5%`);
  });
}
test("zero total is preserved with sign and unit", () => {
  render(<Value value={0} total={0} sign="±" unit="pts" />);
  expect(screen.getByRole("img", { name: "±0 of 0 pts" })).toHaveTextContent(
    "±0/0pts",
  );
});
for (const mode of [
  "hero",
  "indexed",
  "dense",
  "plain",
  "editorial",
] as const) {
  test(`explicit label overrides the generated name in ${mode} mode`, () => {
    render(
      <Value
        value={7}
        total={10}
        mode={mode}
        label="Seven points out of ten"
      />,
    );
    expect(
      screen.getByRole("img", { name: "Seven points out of ten" }),
    ).toHaveAttribute("data-mode", mode);
  });
}
test("a standalone value is named", () => {
  render(<Value value="07" />);
  expect(screen.getByRole("img", { name: "07" })).toHaveTextContent("07");
});

for (const value of ["", "   "]) {
  test("an empty value without a label has a fallback name", () => {
    render(<Value value={value} />);
    expect(screen.getByRole("img", { name: "No value" })).toBeInTheDocument();
  });
}
test("an empty value may be named explicitly", () => {
  render(<Value value="" label="Not available" />);
  expect(
    screen.getByRole("img", { name: "Not available" }),
  ).toBeInTheDocument();
});
