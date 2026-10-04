import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "../stack/Stack";
import { Status } from "./Status";
export default {
  title: "Feedback/Status",
  component: Status,
  parameters: { layout: "centered" },
  argTypes: {
    tone: { control: "select", options: ["success", "warning", "danger"] },
  },
} satisfies Meta<typeof Status>;
type Story = StoryObj<typeof Status>;
export const UploadComplete: Story = {
  args: { tone: "success", label: "Upload complete" },
};
export const UploadResults: Story = {
  args: { tone: "success", label: "Upload complete" },
  render: () => (
    <Stack gap={8}>
      <Status tone="success" label="3 files uploaded" />
      <Status tone="warning" label="1 file renamed" />
      <Status tone="danger" label="1 file rejected" />
    </Stack>
  ),
};
