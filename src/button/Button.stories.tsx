import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

export default {
  title: "Form/Button",
  component: Button,
  args: { children: "Save" },
  parameters: { layout: "centered" },
} satisfies Meta<typeof Button>;
type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };

export const Disabled: Story = {
  name: "Disabled",
  args: { isDisabled: true },
};

export const Variants: Story = {
  name: "Variants",
  render: () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--bd-space-16)",
        alignItems: "center",
      }}
    >
      <Button variant="primary">Save</Button>
      <Button variant="secondary">Cancel</Button>
      <Button isDisabled>Unavailable</Button>
    </div>
  ),
};

export const WithIcon: Story = {
  name: "With icon",
  args: { icon: "plus", children: "Add item" },
};

export const IconEnd: Story = {
  args: { icon: "plus", iconPosition: "end", children: "Add item" },
};

export const Pending: Story = {
  args: { isPending: true, children: "Save" },
};
