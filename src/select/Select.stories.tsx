import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "../stack/Stack.js";
import { Select } from "./Select.js";

export default {
  title: "Form/Select",
  component: Select,
  args: {
    label: "Collection",
    description: "Organize your documents",
    isRequired: true,
    options: [
      { id: "one", label: "Reading" },
      { id: "two", label: "Research" },
      { id: "three", label: "Archive", isDisabled: true },
    ],
    defaultSelectedKey: "one",
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof Select>;
type Story = StoryObj<typeof Select>;
export const Default: Story = {};
export const Review: Story = {
  render: (args) => (
    <Stack gap={24}>
      <Select
        {...args}
        label="Collection"
        isInvalid
        errorMessage="Review this value"
      />
      <Select {...args} label="Archived collection" isDisabled />
      <Select {...args} label="Additional collection" isRequired={false} />
    </Stack>
  ),
};
