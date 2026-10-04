import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button/Button.js";
import { IconButton } from "../icon-button/IconButton.js";
import { Toolbar } from "./Toolbar.js";
export default {
  title: "Navigation/Toolbar",
  parameters: { layout: "centered" },
  component: Toolbar,
  args: {
    label: "Canvas tools",
    children: (
      <>
        <IconButton icon="plus" label="Zoom in" />
        <IconButton icon="search" label="Inspect canvas" />
        <Button>Fit canvas</Button>
      </>
    ),
  },
} satisfies Meta<typeof Toolbar>;
type Story = StoryObj<typeof Toolbar>;
export const CanvasTools: Story = {};
