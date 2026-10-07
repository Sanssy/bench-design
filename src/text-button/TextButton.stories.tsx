import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "../text/Text.js";
import { TextButton } from "./TextButton.js";

export default {
  title: "Typography/TextButton",
  component: TextButton,
  args: {
    children: "Show the supporting records",
    onPress: () => window.dispatchEvent(new Event("text-button-press")),
  },
} satisfies Meta<typeof TextButton>;
type Story = StoryObj<typeof TextButton>;
export const InText: Story = {
  render: (args) => (
    <Text>
      The amount is stated in one record. <TextButton {...args} />
    </Text>
  ),
};
export const Metadata: Story = {
  args: {
    children: "2 source records",
    icon: "link",
    trailingIcon: "arrow-up-right",
    variant: "meta",
  },
  render: (args) => (
    <Text>
      <TextButton {...args} />
    </Text>
  ),
};
