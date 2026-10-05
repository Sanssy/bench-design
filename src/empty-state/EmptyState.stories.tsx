import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../button/Button";
import { EmptyState } from "./EmptyState";
export default {
  title: "Surfaces/EmptyState",
  component: EmptyState,
} satisfies Meta<typeof EmptyState>;
type Story = StoryObj<typeof EmptyState>;
export const EmptyLibrary: Story = {
  args: {
    title: "Your library is empty",
    children: "Import your first document to start a collection.",
  },
  render: function EmptyLibrary(args) {
    const [imported, setImported] = useState(false);
    return imported ? (
      <>
        <p role="status">Sample document imported</p>
        <Button onPress={() => setImported(false)}>Remove document</Button>
      </>
    ) : (
      <EmptyState
        {...args}
        action={
          <Button onPress={() => setImported(true)}>Import documents</Button>
        }
      />
    );
  },
};
export const NoResults: Story = {
  args: {
    title: "No matching documents",
    level: 2,
    children: "Try a broader search or remove a filter.",
  },
};
