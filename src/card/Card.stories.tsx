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

export const Outlined: Story = {
  ...CollectionSummary,
  args: { ...CollectionSummary.args, variant: "outlined", padding: 24 },
};
export const MediaPreview: Story = {
  ...SavedCollection,
  args: {
    media: (
      <img
        alt="Abstract document preview"
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 120'%3E%3Crect width='400' height='120' fill='currentColor'/%3E%3C/svg%3E"
      />
    ),
  },
};
export const OutlinedMedia: Story = {
  ...MediaPreview,
  args: { ...MediaPreview.args, variant: "outlined", padding: 24 },
};
