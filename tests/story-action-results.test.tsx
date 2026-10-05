import { composeStories } from "@storybook/react-vite";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import * as DialogStories from "../src/dialog/Dialog.stories";
import * as EmptyStories from "../src/empty-state/EmptyState.stories";
import * as ToolbarStories from "../src/toolbar/Toolbar.stories";

const { DocumentDetails, ReadingGuide } = composeStories(DialogStories);
const { EmptyLibrary } = composeStories(EmptyStories);
const { CanvasTools } = composeStories(ToolbarStories);
for (const [Story, action, result, reset] of [
  [
    EmptyLibrary,
    "Import documents",
    "Sample document imported",
    "Remove document",
  ],
  [CanvasTools, "Zoom in", "Zoom: 110%", "Fit canvas"],
  [CanvasTools, "Inspect canvas", "Canvas inspection opened", "Fit canvas"],
] as const) {
  test(`${action} produces a reversible local result`, async () => {
    const user = userEvent.setup();
    render(<Story />);
    await user.click(screen.getByRole("button", { name: action }));
    expect(screen.getByRole("status")).toHaveTextContent(result);
    await user.click(screen.getByRole("button", { name: reset }));
    expect(screen.queryByText(result)).not.toBeInTheDocument();
  });
}
for (const [Story, trigger, action] of [
  [DocumentDetails, "View details", "Download"],
  [ReadingGuide, "Read guide", "Download guide"],
] as const) {
  test(`${action} previews a result and resets`, async () => {
    const user = userEvent.setup();
    render(<Story />);
    await user.click(screen.getByRole("button", { name: trigger }));
    await user.click(screen.getByRole("button", { name: action }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Local download preview ready",
    );
    await user.click(screen.getByRole("button", { name: "Reset preview" }));
    expect(
      screen.queryByText("Local download preview ready"),
    ).not.toBeInTheDocument();
  });
}
