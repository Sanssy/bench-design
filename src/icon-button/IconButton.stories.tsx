import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconButton } from "./IconButton.js";

export default {
  title: "Form/IconButton",
  component: IconButton,
  args: { icon: "search", label: "Search documents" },
  parameters: { layout: "centered" },
} satisfies Meta<typeof IconButton>;
type Story = StoryObj<typeof IconButton>;
export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Disabled: Story = { args: { isDisabled: true } };
