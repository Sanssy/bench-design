import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
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

export const TopicLabels: Story = {
  render: () => (
    <div
      style={
        {
          "--bd-metadata-radius": "999px",
          "--bd-metadata-padding-vertical": "3px",
          "--bd-metadata-padding-horizontal": "10px",
          "--bd-metadata-gap": "6px",
          "--bd-category-label-min-block-size": "0px",
          "--bd-category-label-marker-size": "8px",
          "--bd-category-label-marker-radius": "50%",
        } as CSSProperties
      }
    >
      <Inline gap={8}>
        <CategoryLabel category="teal" icon="file-text">
          Research and supporting documentation
        </CategoryLabel>
        <CategoryLabel category="blue" icon="link" variant="plain">
          Related resources
        </CategoryLabel>
        <CategoryLabel category="green" variant="plain">
          Nature
        </CategoryLabel>
      </Inline>
    </div>
  ),
};
