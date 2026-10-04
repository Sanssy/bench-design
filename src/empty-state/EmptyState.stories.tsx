import type { Meta, StoryObj } from "@storybook/react-vite";
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
    action: <Button>Import documents</Button>,
  },
};
export const NoResults: Story = {
  args: {
    title: "No matching documents",
    level: 2,
    children: "Try a broader search or remove a filter.",
  },
};
