import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReferenceList } from "./ReferenceList";
export default {
  title: "Data/ReferenceList",
  component: ReferenceList,
} satisfies Meta<typeof ReferenceList>;
type Story = StoryObj<typeof ReferenceList>;
export const References: Story = {
  args: {
    label: "References",
    items: [
      {
        id: "guide",
        title: "Publication guide",
        href: "#guide",
        description:
          "Revised edition, with publication dates and contributor notes.",
      },
      {
        id: "archive",
        title:
          "ArchiveReferenceWithAnUnbrokenIdentifierThatMustRemainReadableOnSmallScreens",
      },
    ],
  },
};

export const AccentReferences: Story = {
  args: {
    label: "Supporting references",
    marker: "accent",
    items: [
      {
        id: "guide",
        title: "Publication guide",
        href: "#guide",
        description: "Revised edition with contributor notes.",
        meta: "p. 3",
      },
      {
        id: "archive",
        title: "Archive notes",
        description: "Background material for the next edition.",
        meta: "pp. 8–12",
      },
    ],
  },
};
export const NumberedMetadata: Story = {
  args: { ...AccentReferences.args, marker: "number" },
};
