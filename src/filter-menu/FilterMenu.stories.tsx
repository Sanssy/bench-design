import type { Meta, StoryObj } from "@storybook/react-vite";
import { FilterMenu } from "./FilterMenu.js";
export default {
  title: "Form/FilterMenu",
  component: FilterMenu,
  args: {
    label: "Collections",
    options: [
      { id: "reading", label: "Reading" },
      { id: "research", label: "Research" },
      { id: "archive", label: "Archive" },
    ],
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof FilterMenu>;
type Story = StoryObj<typeof FilterMenu>;
export const Default: Story = {};
export const Active: Story = {
  args: {
    defaultValue: [
      { id: "reading", label: "Reading" },
      { id: "research", label: "Research" },
      { id: "archive", label: "Archive" },
    ],
  },
};
