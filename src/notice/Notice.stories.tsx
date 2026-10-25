import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { Stack } from "../stack/Stack";
import { Notice } from "./Notice";
export default {
  title: "Feedback/Notice",
  component: Notice,
  parameters: { layout: "centered" },
  argTypes: {
    showIcon: { control: "boolean" },
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

export const CompactFeedback: Story = {
  args: {
    tone: "warning",
    title: "Your files are almost ready",
    children:
      "Review the selected files and confirm their names before sharing them with your team.",
  },
  render: (args) => (
    <div
      style={
        {
          "--bd-notice-padding-block": "var(--bd-space-12)",
          "--bd-notice-padding-inline": "var(--bd-space-16)",
          "--bd-space-16": "14px",
          width: "min(100%, 36rem)",
        } as CSSProperties
      }
    >
      <Notice {...args} />
    </div>
  ),
};

export const QuietNote: Story = {
  args: {
    tone: "neutral",
    title: "Project saved",
    children:
      "Your changes are stored on this device. Review each section before sharing the project with your collaborators.",
    showIcon: false,
  },
};
