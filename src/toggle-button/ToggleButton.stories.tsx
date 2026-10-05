import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Stack } from "../stack/Stack.js";
import { ToggleButton } from "./ToggleButton.js";
export default {
  title: "Actions/ToggleButton",
  component: ToggleButton,
  args: { label: "Show guides" },
  parameters: { layout: "centered" },
} satisfies Meta<typeof ToggleButton>;
type Story = StoryObj<typeof ToggleButton>;
export const Guides: Story = {};
export const ViewOptions: Story = {
  render: () => (
    <Stack gap={16}>
      <ToggleButton label="Show guides" defaultSelected />
      <ToggleButton label="Show guides" isDisabled />
      <ToggleButton label="Show guides" defaultSelected isDisabled />
      <ToggleButton label="Show guides" icon="check" />
      <ToggleButton label="Show guides" icon="check" defaultSelected />
      <ToggleButton label="Show guides" icon="check" isDisabled />
      <ToggleButton
        label="Show guides"
        icon="check"
        defaultSelected
        isDisabled
      />
    </Stack>
  ),
};
export const ControlledGuides: Story = {
  render: function ControlledGuides(args) {
    const [selected, setSelected] = useState(false);
    return (
      <ToggleButton
        {...args}
        icon="check"
        isSelected={selected}
        onChange={setSelected}
      />
    );
  },
};
