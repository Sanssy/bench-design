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
    children: "Visit Example",
  },
};
