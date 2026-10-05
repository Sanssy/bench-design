import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../button/Button";
import { Text } from "../text/Text";
import { Grid } from "./Grid";
export default {
  title: "Layout/Grid",
  component: Grid,
  argTypes: {
    columns: { control: "select", options: [2, 3, 4] },
    gap: {
      control: "select",
      options: [undefined, 4, 8, 12, 16, 24, 32, 48, 64, 96],
    },
    as: { control: "select", options: ["div", "section", "ul", "ol"] },
  },
  args: {
    gap: 24,
    columns: 3,
  },
} satisfies Meta<typeof Grid>;
type Story = StoryObj<typeof Grid>;
export const Collection: Story = {
  render: function Collection(args) {
    const [result, setResult] = useState("");
    return (
      <>
        <Grid {...args}>
          <div>
            <Text>Reading room</Text>
            <Text tone="muted">Essays for a quiet afternoon.</Text>
            <Button onPress={() => setResult("Reading room selected")}>
              Open essays
            </Button>
          </div>
          <div>
            <Text>Field notes</Text>
            <Text tone="muted">Observations from everyday places.</Text>
            <Button
              variant="secondary"
              onPress={() => setResult("Field notes selected")}
            >
              Explore notes
            </Button>
          </div>
          <div>
            <Text>Conversations</Text>
            <Text tone="muted">Ideas shared across disciplines.</Text>
            <Button
              variant="secondary"
              onPress={() => setResult("Conversations selected")}
            >
              Read interviews
            </Button>
          </div>
        </Grid>
        <p role="status">{result}</p>
        {result && (
          <Button onPress={() => setResult("")}>Back to collections</Button>
        )}
      </>
    );
  },
};
export const Gallery: Story = {
  args: {
    columns: 4,
    as: "ul",
    children: (
      <>
        <li>
          <Text>Architecture</Text>
          <Text tone="muted">Spaces for living.</Text>
        </li>
        <li>
          <Text>Photography</Text>
          <Text tone="muted">Stories in images.</Text>
        </li>
        <li>
          <Text>Literature</Text>
          <Text tone="muted">New voices to discover.</Text>
        </li>
        <li>
          <Text>Design</Text>
          <Text tone="muted">Objects with purpose.</Text>
        </li>
      </>
    ),
  },
};
