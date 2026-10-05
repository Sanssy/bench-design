import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { GettingStarted } from "../.storybook/PublicDocs";

test("first render saves and resets", async () => {
  const user = userEvent.setup();
  render(<GettingStarted />);
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByRole("status")).toHaveTextContent("Changes saved");
  await user.click(screen.getByRole("button", { name: "Reset" }));
  expect(screen.getByRole("status")).toHaveTextContent("No changes saved yet");
});
