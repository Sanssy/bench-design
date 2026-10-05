import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Paper } from "./Paper.js";

test("preserves document content and native highlighted passages", () => {
  render(
    <Paper>
      <p>
        Highlighted passage: <mark>Keep a copy.</mark>
      </p>
    </Paper>,
  );
  expect(screen.getByText("Keep a copy.").tagName).toBe("MARK");
  expect(screen.getByText(/Highlighted passage:/)).toBeVisible();
});
