import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button/Button";
import { Text } from "../text/Text";
import { Inline } from "./Inline";
export default {
  title: "Layout/Inline",
  component: Inline,
  argTypes: {
    justify: {
      control: "select",
      options: [
        "start",
        "center",
        "end",
        "space-between",
        "space-around",
        "space-evenly",
      ],
    },
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
        <Button>Save draft</Button>
        <Button variant="secondary">Preview</Button>
        <Text tone="muted">Saved a moment ago</Text>
      </>
    ),
  },
} satisfies Meta<typeof Inline>;
type Story = StoryObj<typeof Inline>;
export const Actions: Story = { args: {} };
export const Labels: Story = {
  args: {
    as: "ul",
    gap: 12,
    children: (
      <>
        <li>
          <Text variant="label">Essays and criticism</Text>
        </li>
        <li>
          <Text variant="label">Field notes and observations</Text>
        </li>
      </>
    ),
  },
};
