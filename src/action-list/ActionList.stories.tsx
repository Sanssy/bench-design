import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActionList } from "./ActionList.js";
export default {
  title: "Navigation/ActionList",
  component: ActionList,
} satisfies Meta<typeof ActionList>;
type Story = StoryObj<typeof ActionList>;
export const Resources: Story = {
  args: {
    label: "Resources",
    items: [
      {
        id: "archive",
        title: "Browse the archive",
        description: "Explore documents and reference material.",
        icon: "file-text",
        href: "#archive",
      },
      {
        id: "guide",
        title:
          "Read the complete reference guide for preparing and organizing a collection of documents",
        description:
          "A detailed guide with practical examples and supporting resources.",
        href: "https://example.com",
        external: true,
      },
    ],
  },
};
export const NumberedActions: Story = {
  args: {
    label: "Next steps",
    numbered: true,
    items: [
      {
        id: "draft",
        title: "Create a draft",
        description: "Start with an empty document.",
        icon: "pen",
        onPress: () => window.dispatchEvent(new Event("create-draft")),
      },
      { id: "browse", title: "Browse existing documents", href: "#documents" },
    ],
  },
};
