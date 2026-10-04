import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "../stack/Stack.js";
import { ColorField } from "./ColorField.js";
export default {
  title: "Form/ColorField",
  component: ColorField,
  args: {
    label: "Setting",
    description: "Choose a value for your workspace",
    isRequired: true,
    defaultValue: "#d8ed69",
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof ColorField>;
type Story = StoryObj<typeof ColorField>;
export const Default: Story = {};
export const Review: Story = {
  render: (args) => (
    <Stack gap={24}>
      <ColorField
        {...args}
        label="Primary setting"
        isInvalid
        errorMessage="Review this value"
      />
      <ColorField {...args} label="Archived setting" isDisabled />
      <ColorField {...args} label="Additional setting" isRequired={false} />
    </Stack>
  ),
};
