import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Inline } from "./Inline";

test("default element and native gap", () => {
  render(<Inline>Content</Inline>);
  const element = screen.getByText("Content");
  expect(element.tagName).toBe("DIV");
  expect(element.style.getPropertyValue("--bd-gap")).toBe("");
});
for (const as of ["div", "section", "ul", "ol"] as const) {
  test(`renders ${as} with approved attributes`, () => {
    render(
      <Inline as={as} gap={24} align="end" justify="space-between">
        Content
      </Inline>,
    );
    const element = screen.getByText("Content");
    expect(element.tagName).toBe(as.toUpperCase());
    expect(element.style.getPropertyValue("--bd-gap")).toBe(
      "var(--bd-space-24)",
    );
    expect(element.style.getPropertyValue("--bd-align")).toBe("end");
    expect(element.style.getPropertyValue("--bd-justify")).toBe(
      "space-between",
    );
  });
}
for (const gap of [4, 8, 12, 16, 24, 32, 48, 64, 96] as const) {
  test(`accepts spacing token ${gap}`, () => {
    render(<Inline gap={gap}>Content</Inline>);
    expect(screen.getByText("Content").style.getPropertyValue("--bd-gap")).toBe(
      `var(--bd-space-${gap})`,
    );
  });
}

for (const align of ["start", "center", "end", "stretch"] as const) {
  test(`alignment ${align}`, () => {
    render(<Inline align={align}>Content</Inline>);
    expect(
      screen.getByText("Content").style.getPropertyValue("--bd-align"),
    ).toBe(align);
  });
}
for (const justify of [
  "start",
  "center",
  "end",
  "space-between",
  "space-around",
  "space-evenly",
] as const) {
  test(`justification ${justify}`, () => {
    render(<Inline justify={justify}>Content</Inline>);
    expect(
      screen.getByText("Content").style.getPropertyValue("--bd-justify"),
    ).toBe(justify);
  });
}
