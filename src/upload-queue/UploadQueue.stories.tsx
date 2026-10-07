import type { Meta, StoryObj } from "@storybook/react-vite";
import { UploadQueue, type UploadQueueProps } from "./UploadQueue";
export default {
  title: "Feedback/UploadQueue",
  component: UploadQueue,
  parameters: { layout: "padded" },
  args: { label: "Uploads" },
} satisfies Meta<typeof UploadQueue>;
type Story = StoryObj<typeof UploadQueue>;
const items: UploadQueueProps["items"] = [
  { id: "report", name: "Report.pdf", status: "uploading", progress: 35 },
  { id: "notes", name: "Notes.txt", status: "uploading" },
  {
    id: "done",
    name: "Ready.pdf",
    status: "complete",
    description: "Document ready",
    action: { label: "View details", href: "#details" },
  },
  {
    id: "failed",
    name: "Failed.pdf",
    status: "error",
    description: "This document could not be uploaded.",
  },
];
export const Uploading: Story = { args: { items: items.slice(0, 2) } };
export const Complete: Story = { args: { items: items.slice(2, 3) } };
export const Failed: Story = { args: { items: items.slice(3) } };
export const Mixed: Story = { args: { items } };
