import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "../stack/Stack.js";
import { TextField } from "./TextField.js";

export default {
  title: "Form/TextField",
  component: TextField,
  args: {
    label: "Collection",
    description: "Organize your documents",
    isRequired: true,
    defaultValue: "Reading notes",
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof TextField>;
type Story = StoryObj<typeof TextField>;
export const Default: Story = {};
export const Review: Story = {
  render: (args) => (
    <Stack gap={24}>
      <TextField
        {...args}
        label="Collection"
        isInvalid
        errorMessage="Review this value"
      />
      <TextField {...args} label="Archived collection" isDisabled />
      <TextField {...args} label="Additional collection" isRequired={false} />
    </Stack>
  ),
};

export const ShortName: Story = {
  args: {
    label: "Name",
    description: "Up to 12 characters",
    defaultValue: "",
    maxLength: 12,
  },
};
