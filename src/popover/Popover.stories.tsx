import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button/Button";
import { Text } from "../text/Text";
import { Popover } from "./Popover";
export default {
  title: "Overlays/Popover",
  component: Popover,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Popover>;
type Story = StoryObj<typeof Popover>;
export const ExportHelp: Story = {
  args: {
    trigger: <Button>Export help</Button>,
    label: "Export formats",
    children: <Text>Choose SVG for editable artwork or PNG for sharing.</Text>,
  },
};
export const SharingHelp: Story = {
  args: {
    trigger: <Button>Sharing help</Button>,
    label: "Sharing options",
    placement: "top end",
    children: <Text>Download a copy to share with your collaborators.</Text>,
  },
};
