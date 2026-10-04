import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "../stack/Stack.js";
import { CheckboxGroup } from "./CheckboxGroup.js";

export default {
  title: "Form/CheckboxGroup",
  component: CheckboxGroup,
  args: {
    label: "Collection",
    description: "Organize your documents",
    isRequired: true,
    options: [
      { id: "one", label: "Reading" },
      { id: "two", label: "Research" },
      { id: "three", label: "Archive", isDisabled: true },
    ],
    defaultValue: ["one"],
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof CheckboxGroup>;
type Story = StoryObj<typeof CheckboxGroup>;
export const Default: Story = {};
export const Review: Story = {
  render: (args) => (
    <Stack gap={24}>
      <CheckboxGroup
        {...args}
        label="Collection"
        isInvalid
        errorMessage="Review this value"
      />
      <CheckboxGroup {...args} label="Archived collection" isDisabled />
      <CheckboxGroup
        {...args}
        label="Additional collection"
        isRequired={false}
      />
    </Stack>
  ),
};
