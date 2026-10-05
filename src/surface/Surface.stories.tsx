import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button/Button";
import { Heading } from "../heading/Heading";
import { Inline } from "../inline/Inline";
import { Link } from "../link/Link";
import { Stack } from "../stack/Stack";
import { Text } from "../text/Text";
import { Surface } from "./Surface";
export default { title: "Surfaces/Surface", component: Surface } satisfies Meta<
  typeof Surface
>;
type Story = StoryObj<typeof Surface>;
export const Workspace: Story = {
  args: {
    tone: "raised",
    padding: 16,
    children: (
      <Stack gap={8}>
        <Heading level={2} size="ui">
          Collection workspace
        </Heading>
        <Text>Review your saved documents before exporting.</Text>
      </Stack>
    ),
  },
};
export const Notice: Story = {
  args: {
    tone: "subtle",
    padding: 16,
    as: "aside",
    children: <Text>Changes are saved on this device.</Text>,
  },
};

export const Inverse: Story = {
  args: {
    tone: "inverse",
    padding: 24,
    children: (
      <Stack gap={24}>
        <Heading level={2} size="ui">
          A fresh perspective
        </Heading>
        <Text>
          Explore a contrasting region without changing the page theme.
        </Text>
        <Text tone="muted">Supporting information stays readable.</Text>
        <Text>
          <Link href="#details">Read the details</Link>
        </Text>
        <Text tone="muted">
          <Link href="#details">More information</Link>
        </Text>
        <Inline gap={24}>
          <Button variant="primary">Continue</Button>
          <Button variant="secondary">Review options</Button>
        </Inline>
        <Surface tone="raised" padding={16}>
          <Stack gap={8}>
            <Text>Raised content</Text>
            <Text tone="muted">Supporting raised content</Text>
          </Stack>
        </Surface>
        <Surface tone="subtle" padding={16}>
          <Stack gap={8}>
            <Text>Subtle content</Text>
            <Text tone="muted">Supporting subtle content</Text>
          </Stack>
        </Surface>
        <Surface tone="inverse" padding={16}>
          <Text>Nested inverse content keeps the same context.</Text>
        </Surface>
      </Stack>
    ),
  },
};
