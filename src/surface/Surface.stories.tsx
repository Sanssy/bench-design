import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading } from "../heading/Heading";
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
