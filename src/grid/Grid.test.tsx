import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Grid } from "./Grid";

test("default element and native gap", () => {
  render(<Grid columns={2}>Content</Grid>);
  const element = screen.getByText("Content");
  expect(element.tagName).toBe("DIV");
  expect(element.style.getPropertyValue("--bd-gap")).toBe("");
});
for (const as of ["div", "section", "ul", "ol"] as const) {
  test(`renders ${as} with approved attributes`, () => {
    render(
      <Grid as={as} gap={24} columns={3}>
        Content
      </Grid>,
    );
    const element = screen.getByText("Content");
    expect(element.tagName).toBe(as.toUpperCase());
    expect(element.style.getPropertyValue("--bd-gap")).toBe(
      "var(--bd-space-24)",
    );
    expect(element.style.getPropertyValue("--bd-columns")).toBe("3");
  });
}
for (const gap of [4, 8, 12, 16, 24, 32, 48, 64, 96] as const) {
  test(`accepts spacing token ${gap}`, () => {
    render(
      <Grid columns={2} gap={gap}>
        Content
      </Grid>,
    );
    expect(screen.getByText("Content").style.getPropertyValue("--bd-gap")).toBe(
      `var(--bd-space-${gap})`,
    );
  });
}

for (const columns of [2, 3, 4] as const) {
  test(`column count ${columns}`, () => {
    render(<Grid columns={columns}>Content</Grid>);
    expect(
      screen.getByText("Content").style.getPropertyValue("--bd-columns"),
    ).toBe(String(columns));
  });
}
