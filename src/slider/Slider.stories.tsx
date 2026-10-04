import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "../stack/Stack.js";
import { Slider } from "./Slider.js";
export default {
  title: "Form/Slider",
  component: Slider,
  args: {
    label: "Setting",
    description: "Choose a value for your workspace",
    isRequired: true,
    defaultValue: 25,
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof Slider>;
type Story = StoryObj<typeof Slider>;
export const Default: Story = {};
export const Review: Story = {
  render: (args) => (
    <Stack gap={24}>
      <Slider
        {...args}
        label="Primary setting"
        isInvalid
        errorMessage="Review this value"
      />
      <Slider {...args} label="Archived setting" isDisabled />
      <Slider {...args} label="Additional setting" isRequired={false} />
    </Stack>
  ),
};
