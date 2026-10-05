import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Badge } from "./Badge.js";

for (const variant of ["outline", "solid"] as const) {
  test(`Badge renders ${variant} plain text`, () => {
    render(<Badge variant={variant}>SVG</Badge>);
    expect(screen.getByText("SVG").closest(".bd-badge")).toHaveAttribute(
      "data-variant",
      variant,
    );
    expect(screen.getByText("SVG").tagName).toBe("SPAN");
    expect(screen.queryByRole("button")).toBeNull();
  });
}
test("Badge defaults to outline and accepts a count", () => {
  render(<Badge>{12}</Badge>);
  expect(screen.getByText("12").closest(".bd-badge")).toHaveAttribute(
    "data-variant",
    "outline",
  );
});

test("Badge defaults to neutral and exposes status tones", () => {
  const { rerender } = render(<Badge>Ready</Badge>);
  expect(screen.getByText("Ready").closest(".bd-badge")).toHaveAttribute(
    "data-tone",
    "neutral",
  );
  for (const tone of ["success", "warning", "danger"] as const) {
    rerender(<Badge tone={tone}>Ready</Badge>);
    expect(screen.getByText("Ready").closest(".bd-badge")).toHaveAttribute(
      "data-tone",
      tone,
    );
  }
});

test("Badge keeps long tag text with a decorative icon", () => {
  render(
    <Badge icon="link" variant="tag" tone="teal">
      Related research and supporting documentation
    </Badge>,
  );
  const label = screen.getByText(
    "Related research and supporting documentation",
  );
  expect(label.closest(".bd-badge")).toHaveAttribute("data-variant", "tag");
  expect(label.closest(".bd-badge")).toHaveAttribute("data-tone", "teal");
  expect(document.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  expect(screen.queryByRole("img")).toBeNull();
});
test("Badge accepts the explicit metadata presentation", () => {
  render(<Badge variant="meta">PDF</Badge>);
  expect(screen.getByText("PDF").closest(".bd-badge")).toHaveAttribute(
    "data-variant",
    "meta",
  );
});
