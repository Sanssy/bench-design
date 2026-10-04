import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "../text/Text";
import { SidePanel } from "./SidePanel";

export default {
  title: "Layout/SidePanel",
  component: SidePanel,
} satisfies Meta<typeof SidePanel>;
type Story = StoryObj<typeof SidePanel>;
export const Library: Story = {
  args: {
    title: "Library",
    children: (
      <>
        <Text>Field notes</Text>
        <Text>Conversations</Text>
        <Text>Essays for a quiet afternoon</Text>
      </>
    ),
  },
};
export const Notes: Story = {
  args: {
    children: <Text>Keep related observations close to your work.</Text>,
  },
};
