import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "../stack/Stack.js";
import { TextArea } from "./TextArea.js";
export default {
  title: "Form/TextArea",
  component: TextArea,
  args: {
    label: "Setting",
    description: "Choose a value for your workspace",
    isRequired: true,
    defaultValue: "Reading notes",
    maxLength: 500,
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof TextArea>;
type Story = StoryObj<typeof TextArea>;
export const Default: Story = {};
export const Review: Story = {
  render: (args) => (
    <Stack gap={24}>
      <TextArea
        {...args}
        label="Primary setting"
        isInvalid
        errorMessage="Review this value"
      />
      <TextArea {...args} label="Archived setting" isDisabled />
      <TextArea {...args} label="Additional setting" isRequired={false} />
    </Stack>
  ),
};
