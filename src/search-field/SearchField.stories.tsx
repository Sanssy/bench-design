import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "../stack/Stack.js";
import { SearchField } from "./SearchField.js";

export default {
  title: "Form/SearchField",
  component: SearchField,
  args: {
    label: "Collection",
    description: "Organize your documents",
    isRequired: true,
    defaultValue: "Notes",
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof SearchField>;
type Story = StoryObj<typeof SearchField>;
export const Default: Story = {};
export const Review: Story = {
  render: (args) => (
    <Stack gap={24}>
      <SearchField
        {...args}
        label="Collection"
        isInvalid
        errorMessage="Review this value"
      />
      <SearchField {...args} label="Archived collection" isDisabled />
      <SearchField {...args} label="Additional collection" isRequired={false} />
    </Stack>
  ),
};

export const Underlined: Story = {
  args: {
    variant: "underlined",
    hideLabel: true,
    autoComplete: "off",
    label: "Search documents",
    description: "Search by title",
  },
};
export const UnderlinedReview: Story = {
  ...Review,
  args: { variant: "underlined", hideLabel: true, autoComplete: "off" },
};
