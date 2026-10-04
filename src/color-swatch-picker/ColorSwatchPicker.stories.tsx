import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "../stack/Stack.js";
import { ColorSwatchPicker } from "./ColorSwatchPicker.js";
export default {
  title: "Form/ColorSwatchPicker",
  component: ColorSwatchPicker,
  args: {
    label: "Setting",
    description: "Choose a value for your workspace",
    isRequired: true,
    defaultValue: "lime",
    colors: [
      { id: "lime", name: "Lime", value: "#d8ed69" },
      { id: "ink", name: "Ink", value: "#18201c" },
      { id: "paper", name: "Paper", value: "#f5f4ef" },
    ],
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof ColorSwatchPicker>;
type Story = StoryObj<typeof ColorSwatchPicker>;
export const Default: Story = {};
export const Review: Story = {
  render: (args) => (
    <Stack gap={24}>
      <ColorSwatchPicker
        {...args}
        label="Primary setting"
        isInvalid
        errorMessage="Review this value"
      />
      <ColorSwatchPicker {...args} label="Archived setting" isDisabled />
      <ColorSwatchPicker
        {...args}
        label="Additional setting"
        isRequired={false}
      />
    </Stack>
  ),
};
