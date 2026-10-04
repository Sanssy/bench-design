import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading } from "../heading/Heading";
import { Stack } from "../stack/Stack";
import { Text } from "../text/Text";
import { Divider } from "./Divider";
export default { title: "Layout/Divider", component: Divider } satisfies Meta<
  typeof Divider
>;
type Story = StoryObj<typeof Divider>;
export const ReadingSections: Story = {
  render: () => (
    <Stack gap={24}>
      <section>
        <Heading level={2}>From the reading room</Heading>
        <Text>Notes on the books that stayed with us this month.</Text>
      </section>
      <Divider />
      <section>
        <Heading level={2}>Coming next</Heading>
        <Text tone="muted">
          Discover next month’s essays and conversations.
        </Text>
      </section>
    </Stack>
  ),
};
