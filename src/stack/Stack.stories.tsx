import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button/Button";
import { Text } from "../text/Text";
import { Stack } from "./Stack";
export default {
  title: "Layout/Stack",
  component: Stack,
  argTypes: {
    align: {
      control: "select",
      options: ["start", "center", "end", "stretch"],
    },
    gap: {
      control: "select",
      options: [undefined, 4, 8, 12, 16, 24, 32, 48, 64, 96],
    },
    as: { control: "select", options: ["div", "section", "ul", "ol"] },
  },
  args: {
    gap: 24,
    children: (
      <>
        <Text>Reading room</Text>
        <Text tone="muted">Explore essays and field notes.</Text>
        <Button>Open collection</Button>
      </>
    ),
  },
} satisfies Meta<typeof Stack>;
type Story = StoryObj<typeof Stack>;
export const Card: Story = { args: {} };
export const ReadingList: Story = {
  args: {
    as: "ul",
    children: (
      <>
        <li>
          <Text>Essays</Text>
        </li>
        <li>
          <Text>Field notes</Text>
        </li>
      </>
    ),
  },
};
