import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "../text/Text";
import { Value } from "./Value";
export default {
  title: "Data/Value",
  parameters: { layout: "centered" },
  component: Value,
  argTypes: {
    mode: {
      control: "select",
      options: ["hero", "indexed", "dense", "plain", "editorial"],
    },
  },
} satisfies Meta<typeof Value>;
type Story = StoryObj<typeof Value>;
export const Score: Story = { args: { value: 7, total: 10, mode: "hero" } };
export const InlineStats: Story = {
  args: { value: "12.5", sign: "+", unit: "%", mode: "plain" },
  render: (args) => (
    <Text>
      Attendance increased by <Value {...args} /> this month.
    </Text>
  ),
};

export const RecordedAmount: Story = {
  args: { value: 840, unit: "EUR / month", mode: "editorial" },
};
