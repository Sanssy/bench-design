import type { Meta, StoryObj } from "@storybook/react-vite";
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
