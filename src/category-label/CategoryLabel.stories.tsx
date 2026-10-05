import type { Meta, StoryObj } from "@storybook/react-vite";
import { Inline } from "../inline/Inline.js";
import { CategoryLabel } from "./CategoryLabel.js";
export default {
  title: "Data/CategoryLabel",
  component: CategoryLabel,
  args: { category: "teal", children: "Research" },
  parameters: { layout: "centered" },
} satisfies Meta<typeof CategoryLabel>;
type Story = StoryObj<typeof CategoryLabel>;
export const Research: Story = {};
export const Categories: Story = {
  render: () => (
    <Inline gap={8}>
      <CategoryLabel category="teal">Research</CategoryLabel>
      <CategoryLabel category="magenta">Culture</CategoryLabel>
      <CategoryLabel category="orange">Projects</CategoryLabel>
      <CategoryLabel category="violet">Technology</CategoryLabel>
      <CategoryLabel category="green">Nature</CategoryLabel>
      <CategoryLabel category="blue">Travel</CategoryLabel>
    </Inline>
  ),
};
