import { composeStories } from "@storybook/react-vite";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import * as CardStories from "../src/card/Card.stories";
import * as GridStories from "../src/grid/Grid.stories";
import * as InspectorStories from "../src/inspector/Inspector.stories";

const { SavedCollection } = composeStories(CardStories);
const { Collection } = composeStories(GridStories);
const { ResourceDetails } = composeStories(InspectorStories);
for (const [Story, action, result, reset] of [
  [
    SavedCollection,
    "Open collection",
    "Collection opened: Field notes",
    "Close collection",
  ],
  [
    SavedCollection,
    "Export",
    "Export preview: Field notes",
    "Close collection",
  ],
  [Collection, "Open essays", "Reading room selected", "Back to collections"],
  [Collection, "Explore notes", "Field notes selected", "Back to collections"],
  [
    Collection,
    "Read interviews",
    "Conversations selected",
    "Back to collections",
  ],
  [ResourceDetails, "Edit resource", "Editing Field notes", "Cancel"],
  [ResourceDetails, "Duplicate", "Field notes copy created", "Cancel"],
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
