import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { SidePanel } from "./SidePanel.js";

test("SidePanel renders an optional title and its content", () => {
  const { rerender } = render(<SidePanel title="Library">Assets</SidePanel>);
  expect(
    screen.getByRole("heading", { level: 2, name: "Library" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Assets")).toBeInTheDocument();
  rerender(<SidePanel>Properties</SidePanel>);
  expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  expect(screen.getByText("Properties")).toBeInTheDocument();
});
