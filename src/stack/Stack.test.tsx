import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Stack } from "./Stack";

test("default element and native gap", () => {
  render(<Stack>Content</Stack>);
  const element = screen.getByText("Content");
  expect(element.tagName).toBe("DIV");
  expect(element.style.getPropertyValue("--bd-gap")).toBe("");
  expect(element.style.getPropertyValue("--bd-align")).toBe("stretch");
});
for (const as of ["div", "section", "ul", "ol"] as const) {
  test(`renders ${as} with approved attributes`, () => {
    render(
      <Stack as={as} gap={24} align="center">
        Content
      </Stack>,
    );
    const element = screen.getByText("Content");
    expect(element.tagName).toBe(as.toUpperCase());
    expect(element.style.getPropertyValue("--bd-gap")).toBe(
      "var(--bd-space-24)",
    );
    expect(element.style.getPropertyValue("--bd-align")).toBe("center");
  });
}
for (const gap of [4, 8, 12, 16, 24, 32, 48, 64, 96] as const) {
  test(`accepts spacing token ${gap}`, () => {
    render(<Stack gap={gap}>Content</Stack>);
    expect(screen.getByText("Content").style.getPropertyValue("--bd-gap")).toBe(
      `var(--bd-space-${gap})`,
    );
  });
}

for (const align of ["start", "center", "end", "stretch"] as const) {
  test(`alignment ${align}`, () => {
    render(<Stack align={align}>Content</Stack>);
    expect(
      screen.getByText("Content").style.getPropertyValue("--bd-align"),
    ).toBe(align);
  });
}
