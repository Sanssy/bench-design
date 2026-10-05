import type { Meta, StoryObj } from "@storybook/react-vite";
import { Composer } from "./Composer.js";
export default {
  title: "Form/Composer",
  component: Composer,
  args: {
    label: "Message",
    placeholder: "Write a message",
    onSubmit: () => {},
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof Composer>;
type Story = StoryObj<typeof Composer>;
export const Default: Story = {};
export const Pending: Story = {
  args: {
    defaultValue: "Please review these notes.",
    isPending: true,
    hideLabel: true,
  },
};
export const Disabled: Story = { args: { isDisabled: true } };
export const Invalid: Story = {
  args: {
    defaultValue: "Please review these notes.",
    errorMessage: "Could not send. Try again.",
  },
};
