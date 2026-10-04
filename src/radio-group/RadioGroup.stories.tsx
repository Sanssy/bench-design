import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "../stack/Stack.js";
import { RadioGroup } from "./RadioGroup.js";

export default {
  title: "Form/RadioGroup",
  component: RadioGroup,
  args: {
    label: "Collection",
    description: "Organize your documents",
    isRequired: true,
    options: [
      { id: "one", label: "Reading" },
      { id: "two", label: "Research" },
      { id: "three", label: "Archive", isDisabled: true },
    ],
    defaultValue: "one",
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof RadioGroup>;
type Story = StoryObj<typeof RadioGroup>;
export const Default: Story = {};
export const Review: Story = {
  render: (args) => (
    <Stack gap={24}>
      <RadioGroup
        {...args}
        label="Collection"
        isInvalid
        errorMessage="Review this value"
      />
      <RadioGroup {...args} label="Archived collection" isDisabled />
      <RadioGroup {...args} label="Additional collection" isRequired={false} />
    </Stack>
  ),
};
