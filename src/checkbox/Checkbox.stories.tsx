import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "../stack/Stack.js";
import { Checkbox } from "./Checkbox.js";

export default {
  title: "Form/Checkbox",
  component: Checkbox,
  args: {
    label: "Collection",
    description: "Organize your documents",
    isRequired: true,
    defaultSelected: true,
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof Checkbox>;
type Story = StoryObj<typeof Checkbox>;
export const Default: Story = {};
export const Review: Story = {
  render: (args) => (
    <Stack gap={24}>
      <Checkbox
        {...args}
        label="Collection"
        isInvalid
        errorMessage="Review this value"
      />
      <Checkbox {...args} label="Archived collection" isDisabled />
      <Checkbox {...args} label="Additional collection" isRequired={false} />
    </Stack>
  ),
};
