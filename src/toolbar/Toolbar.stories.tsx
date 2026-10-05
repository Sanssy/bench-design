import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../button/Button.js";
import { IconButton } from "../icon-button/IconButton.js";
import { Toolbar } from "./Toolbar.js";
export default {
  title: "Navigation/Toolbar",
  parameters: { layout: "centered" },
  component: Toolbar,
} satisfies Meta<typeof Toolbar>;
type Story = StoryObj<typeof Toolbar>;
export const CanvasTools: Story = {
  render: function CanvasTools() {
    const [zoom, setZoom] = useState(100);
    const [inspecting, setInspecting] = useState(false);
    return (
      <>
        <Toolbar label="Canvas tools">
          <IconButton
            icon="plus"
            label="Zoom in"
            onPress={() => setZoom((value) => value + 10)}
          />
          <IconButton
            icon="search"
            label="Inspect canvas"
            onPress={() => setInspecting(true)}
          />
          <Button
            onPress={() => {
              setZoom(100);
              setInspecting(false);
            }}
          >
            Fit canvas
          </Button>
        </Toolbar>
        <p role="status">
          {inspecting ? "Canvas inspection opened" : `Zoom: ${zoom}%`}
        </p>
      </>
    );
  },
};
