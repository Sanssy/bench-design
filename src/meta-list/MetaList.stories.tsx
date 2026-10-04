import type { Meta, StoryObj } from "@storybook/react-vite";
import { MetaList } from "./MetaList";
export default {
  title: "Data/MetaList",
  component: MetaList,
} satisfies Meta<typeof MetaList>;
type Story = StoryObj<typeof MetaList>;
export const SourceDetails: Story = {
  args: {
    label: "Source details",
    items: [
      { term: "Source", details: "City archive" },
      { term: "Updated", details: "4 October 2026" },
      { term: "License", details: "Public domain" },
      { term: "Format", details: "Digitized documents" },
    ],
  },
};
