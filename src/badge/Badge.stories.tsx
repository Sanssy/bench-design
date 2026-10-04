import type { Meta, StoryObj } from "@storybook/react-vite";
import { Inline } from "../inline/Inline";
import { Text } from "../text/Text";
import { Badge } from "./Badge";
export default { title: "Feedback/Badge", component: Badge } satisfies Meta<
  typeof Badge
>;
type Story = StoryObj<typeof Badge>;
export const DocumentCount: Story = {
  args: { children: 12, variant: "outline" },
  render: (args) => (
    <Inline gap={8} align="center">
      <Text as="span">Documents</Text>
      <Badge {...args} />
    </Inline>
  ),
};
export const ExportFormat: Story = {
  args: { children: "SVG", variant: "solid" },
  render: (args) => (
    <Inline gap={8} align="center">
      <Badge {...args} />
      <Text as="span">Vector download</Text>
    </Inline>
  ),
};
