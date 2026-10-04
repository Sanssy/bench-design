import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "../stack/Stack.js";
import { SegmentedControl } from "./SegmentedControl.js";
export default {
  title: "Form/SegmentedControl",
  component: SegmentedControl,
  args: {
    label: "Setting",
    description: "Choose a value for your workspace",
    isRequired: true,
    defaultValue: "all",
    options: [
      { id: "all", label: "All", count: 24 },
      { id: "recent", label: "Recent", count: 8 },
      { id: "archived", label: "Archived", isDisabled: true },
    ],
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof SegmentedControl>;
type Story = StoryObj<typeof SegmentedControl>;
export const Default: Story = {};
export const Review: Story = {
  render: (args) => (
    <Stack gap={24}>
      <SegmentedControl
        {...args}
        label="Primary setting"
        isInvalid
        errorMessage="Review this value"
      />
      <SegmentedControl {...args} label="Archived setting" isDisabled />
      <SegmentedControl
        label="View"
        hideLabel
        options={[
          { id: "grid", label: "Grid", icon: "search" },
          { id: "list", label: "List", icon: "menu" },
        ]}
      />
    </Stack>
  ),
};
