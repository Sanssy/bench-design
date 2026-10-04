import type { Meta, StoryObj } from "@storybook/react-vite";
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
  args: {
    children: (
      <Stack gap={12}>
        <Heading level={3} size="ui">
          Field notes
        </Heading>
        <Text tone="muted">
          Twelve documents collected during the spring workshop.
        </Text>
        <Inline gap={8}>
          <Button>Open collection</Button>
          <Button variant="secondary">Export</Button>
        </Inline>
      </Stack>
    ),
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
