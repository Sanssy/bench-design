import type { Meta, StoryObj } from "@storybook/react-vite";
import { TopNav } from "./TopNav.js";
export default {
  title: "Navigation/TopNav",
  component: TopNav,
  args: {
    label: "Main pages",
    currentId: "browse",
    items: [
      {
        id: "browse",
        label: "Browse",
        href: "#browse",
        icon: "search",
        count: 0,
      },
      { id: "saved", label: "Saved collections", href: "#saved", count: 123 },
      { id: "ask", label: "Ask", href: "#ask" },
    ],
  },
} satisfies Meta<typeof TopNav>;
type Story = StoryObj<typeof TopNav>;
export const PageNavigation: Story = {};
export const LongLabels: Story = {
  args: {
    items: [
      {
        id: "browse",
        label: "Browse all available resources",
        href: "#browse",
      },
      {
        id: "saved",
        label: "Saved collections and references",
        href: "#saved",
        count: 123,
      },
      { id: "ask", label: "Ask", href: "#ask" },
    ],
  },
};
