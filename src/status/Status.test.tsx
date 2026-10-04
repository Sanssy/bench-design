import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Status } from "./Status.js";

for (const tone of ["success", "warning", "danger"] as const) {
  test(`Status ${tone} labels a decorative icon without interaction`, () => {
    const { container } = render(
      <Status tone={tone} label="Upload complete" />,
    );
    expect(screen.getByText("Upload complete")).toBeVisible();
    expect(container.querySelector(".bd-status")).toHaveAttribute(
      "data-tone",
      tone,
    );
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
  });
}
