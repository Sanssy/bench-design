import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "../stack/Stack.js";
import { FilterChip } from "./FilterChip.js";
export default {
  title: "Form/FilterChip",
  component: FilterChip,
  args: { label: "Available" },
  parameters: { layout: "centered" },
} satisfies Meta<typeof FilterChip>;
type Story = StoryObj<typeof FilterChip>;
export const Default: Story = {};
export const Active: Story = {
  render: (args) => (
    <Stack gap={16}>
      <FilterChip {...args} defaultSelected />
      <FilterChip {...args} label="Archived" isDisabled />
      <FilterChip
        {...args}
        label="Selected unavailable"
        defaultSelected
        isDisabled
      />
    </Stack>
  ),
};
