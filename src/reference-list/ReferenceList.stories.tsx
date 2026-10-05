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
