import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading } from "./Heading";
export default {
  title: "Typography/Heading",
  argTypes: {
    align: { control: "select", options: [undefined, "start", "center"] },
  },
  component: Heading,
  args: { level: 1, children: "A new perspective" },
} satisfies Meta<typeof Heading>;
type Story = StoryObj<typeof Heading>;
export const Article: Story = { args: { level: 1 } };
export const Section: Story = { args: { level: 2 } };
export const Subsection: Story = { args: { level: 3 } };
export const Detail: Story = { args: { level: 4 } };
export const Display: Story = { args: { level: 2, size: "display" } };

export const Centered: Story = { args: { align: "center" } };
export const Start: Story = { args: { align: "start" } };
