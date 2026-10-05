import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Tabs } from "./Tabs.js";
export default {
  title: "Navigation/Tabs",
  component: Tabs,
  args: {
    label: "Library sections",
    items: [
      {
        id: "assets",
        title: "Assets",
        content: "Browse reusable assets for your next composition.",
      },
      {
        id: "collections",
        title: "Collections",
        content: "Organize assets into collections.",
      },
      {
        id: "saved",
        title: "Saved",
        content: "Return to your saved compositions.",
      },
    ],
  },
} satisfies Meta<typeof Tabs>;
type Story = StoryObj<typeof Tabs>;
export const LibrarySections: Story = {};

export const VerticalSections: Story = { args: { orientation: "vertical" } };
export const ControlledSections: Story = {
  render: function ControlledSections(args) {
    const [selected, setSelected] = useState("collections");
    return (
      <Tabs {...args} selectedKey={selected} onSelectionChange={setSelected} />
    );
  },
};

export const DocumentSections: Story = {
  args: {
    label: "Document sections",
    items: [
      "Overview",
      "Contents",
      "References",
      "Annotations",
      "Versions",
      "Contributors",
      "Permissions",
      "Activity",
    ].map((title) => ({
      id: title.toLowerCase(),
      title,
      content: `${title} for this document.`,
    })),
  },
};
