import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../button/Button";
import { Heading } from "../heading/Heading";
import { Inline } from "../inline/Inline";
import { Stack } from "../stack/Stack";
import { Text } from "../text/Text";
import { Card } from "./Card";
export default { title: "Surfaces/Card", component: Card } satisfies Meta<
  typeof Card
>;
type Story = StoryObj<typeof Card>;
export const SavedCollection: Story = {
  render: function SavedCollection(args) {
    const [result, setResult] = useState("");
    return (
      <Card {...args}>
        <Stack gap={12}>
          <Heading level={3} size="ui">
            Field notes
          </Heading>
          <Text tone="muted">
            Twelve documents collected during the spring workshop.
          </Text>
          <Inline gap={8}>
            <Button onPress={() => setResult("Collection opened: Field notes")}>
              Open collection
            </Button>
            <Button
              variant="secondary"
              onPress={() => setResult("Export preview: Field notes")}
            >
              Export
            </Button>
          </Inline>
        </Stack>
        <p role="status">{result}</p>
        {result && (
          <Button onPress={() => setResult("")}>Close collection</Button>
        )}
      </Card>
    );
  },
};
export const CollectionSummary: Story = {
  args: {
    as: "section",
    children: (
      <Stack gap={8}>
        <Heading level={2} size="ui">
          Reading list
        </Heading>
        <Text>Three documents ready for review.</Text>
      </Stack>
    ),
  },
};
