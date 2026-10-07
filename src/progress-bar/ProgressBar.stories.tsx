import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProgressBar } from "./ProgressBar";

export default {
  title: "Feedback/ProgressBar",
  component: ProgressBar,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ProgressBar>;
type Story = StoryObj<typeof ProgressBar>;
export const Processing: Story = {
  args: { label: "Processing documents", value: 40 },
};
export const Waiting: Story = {
  args: { label: "Preparing documents", isIndeterminate: true },
};
export const Completed: Story = {
  args: { label: "Documents processed", value: 100 },
};
export const ItemCount: Story = {
  args: {
    label: "Processing documents",
    value: 4,
    maxValue: 10,
    valueLabel: "4 of 10",
  },
};
export const Compact: Story = {
  args: { label: "Processing documents", value: 40, hideLabel: true },
};
