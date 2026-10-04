import type { Meta, StoryObj } from "@storybook/react-vite";
import { Disclosure } from "./Disclosure.js";

export default {
  title: "Structure/Disclosure",
  component: Disclosure,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Disclosure>;
type Story = StoryObj<typeof Disclosure>;
export const DocumentDetails: Story = {
  args: {
    title: "Document details",
    meta: "PDF",
    children: "A summary of this document and its source.",
  },
};
export const ExpandedDetails: Story = {
  args: {
    title: "Sharing details",
    defaultExpanded: true,
    children: "People with access can read this document.",
  },
};
