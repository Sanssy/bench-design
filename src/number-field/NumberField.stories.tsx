import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "../stack/Stack.js";
import { NumberField } from "./NumberField.js";
export default {
  title: "Form/NumberField",
  component: NumberField,
  args: {
    label: "Setting",
    description: "Choose a value for your workspace",
    isRequired: true,
    defaultValue: 2,
    minValue: 0,
    maxValue: 10,
    step: 1,
    unit: "items",
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof NumberField>;
type Story = StoryObj<typeof NumberField>;
export const Default: Story = {};
export const Review: Story = {
  render: (args) => (
    <Stack gap={24}>
      <NumberField
        {...args}
        label="Primary setting"
        isInvalid
        errorMessage="Review this value"
      />
      <NumberField {...args} label="Archived setting" isDisabled />
      <NumberField {...args} label="Additional setting" isRequired={false} />
    </Stack>
  ),
};
