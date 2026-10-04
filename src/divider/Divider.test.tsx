import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Divider } from "./Divider";

test("decorative hr is hidden from assistive technology", () => {
  const { container } = render(<Divider />);
  expect(container.querySelector("hr")).toHaveAttribute("aria-hidden", "true");
  expect(screen.queryByRole("separator")).toBeNull();
});
