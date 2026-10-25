import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Notice } from "./Notice.js";

for (const tone of ["neutral", "success", "warning", "danger"] as const) {
  test(`Notice ${tone} announces title and description`, () => {
    const { container, rerender } = render(
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
    rerender(
      <Notice tone={tone} title="Upload result" showIcon>
        Review the files.
      </Notice>,
    );
    expect(container.querySelector("svg")).toHaveAttribute("width", "20");
  });
}

for (const tone of ["neutral", "success", "warning", "danger"] as const) {
  test(`Notice ${tone} omits only its icon when showIcon is false`, () => {
    const { container } = render(
      <Notice tone={tone} title="Upload result" showIcon={false}>
        Review the files.
      </Notice>,
    );
    expect(container.querySelector("svg")).not.toBeInTheDocument();
    expect(
      screen.getByRole(tone === "danger" ? "alert" : "status"),
    ).toHaveTextContent("Upload resultReview the files.");
  });
}
