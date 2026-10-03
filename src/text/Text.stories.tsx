import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "./Text";
export default {
  title: "Typography/Text",
  component: Text,
  args: { children: "Read the next chapter." },
} satisfies Meta<typeof Text>;
type Story = StoryObj<typeof Text>;
export const Paragraph: Story = { args: {} };
export const Metadata: Story = { args: { size: "meta" } };
export const Body: Story = { args: { size: "body" } };
export const Lead: Story = { args: { size: "lead" } };
export const Muted: Story = { args: { tone: "muted" } };
export const Label: Story = { args: { variant: "label" } };
export const Mono: Story = { args: { variant: "mono", as: "span" } };
