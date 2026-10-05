import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "../text/Text";
import { Link } from "./Link";

export default {
  title: "Typography/Link",
  component: Link,
  args: { href: "#chapter", children: "Read the next chapter" },
} satisfies Meta<typeof Link>;
type Story = StoryObj<typeof Link>;
export const Paragraph: Story = {
  render: (args) => (
    <Text>
      Continue your reading: <Link {...args} />.
    </Text>
  ),
};
export const External: Story = {
  args: {
    href: "https://example.com",
    external: true,
    trailingIcon: "arrow-right",
    children: "Visit Example",
  },
};

export const Metadata: Story = {
  args: {
    variant: "meta",
    icon: "info",
    trailingIcon: "arrow-right",
    children: "Read source details",
  },
};
export const LongLabel: Story = {
  args: {
    icon: "info",
    trailingIcon: "arrow-right",
    children:
      "Read the complete supporting documentation and implementation reference for this chapter",
  },
  render: (args) => (
    <Text>
      <Link {...args} />
    </Text>
  ),
};
