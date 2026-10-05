import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "../stack/Stack";
import { Notice } from "./Notice";
export default {
  title: "Feedback/Notice",
  component: Notice,
  parameters: { layout: "centered" },
  argTypes: {
    tone: {
      control: "select",
      options: ["neutral", "success", "warning", "danger"],
    },
  },
} satisfies Meta<typeof Notice>;
type Story = StoryObj<typeof Notice>;
export const UploadComplete: Story = {
  args: {
    tone: "success",
    title: "Upload complete",
    children: "Your files are ready to use.",
  },
};
export const StorageMessages: Story = {
  args: { tone: "warning", title: "Storage almost full", children: "" },
  render: () => (
    <Stack gap={16}>
      <Notice tone="warning" title="Storage almost full">
        Export older projects to free space.
      </Notice>
      <Notice tone="danger" title="Upload failed">
        Check your connection and try again.
      </Notice>
    </Stack>
  ),
};

export const LocalStorage: Story = {
  args: {
    tone: "neutral",
    title: "Saved locally",
    children: "Changes will sync when you reconnect.",
  },
};
