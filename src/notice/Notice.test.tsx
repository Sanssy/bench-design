import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Notice } from "./Notice.js";

for (const tone of ["success", "warning", "danger"] as const) {
  test(`Notice ${tone} announces title and description`, () => {
    const { container } = render(
      <Notice tone={tone} title="Upload result">
        Review the files.
      </Notice>,
    );
    expect(
      screen.getByRole(tone === "danger" ? "alert" : "status"),
    ).toHaveTextContent("Upload result");
    expect(screen.getByText("Review the files.")).toBeVisible();
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
}
