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

export const Card: Story = { args: { variant: "card", hideLabel: true } };
export const CardPending: Story = {
  args: {
    variant: "card",
    hideLabel: true,
    defaultValue: "Please review these notes.",
    isPending: true,
  },
};
export const CardDisabled: Story = {
  args: { variant: "card", isDisabled: true },
};
export const CardInvalid: Story = {
  args: {
    variant: "card",
    defaultValue: "Please review these notes.",
    errorMessage: "Could not send. Try again.",
  },
};
