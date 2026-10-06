import type { Meta, StoryObj } from "@storybook/react-vite";
import { Link } from "../link/Link";
import { Timeline } from "./Timeline";
export default {
  title: "Data/Timeline",
  component: Timeline,
} satisfies Meta<typeof Timeline>;
type Story = StoryObj<typeof Timeline>;
export const PublicationHistory: Story = {
  args: {
    label: "Publication history",
    items: [
      { id: "draft", marker: "Step 1 — Date unknown", title: "Draft prepared" },
      {
        id: "review",
        marker: "Review period — September through October 2026",
        title:
          "Reviewed with contributors and revised after a detailed discussion of the supporting material",
        children: (
          <Link href="#source">
            Read the supporting source and its full publication history
          </Link>
        ),
      },
      {
        id: "publication",
        marker: "PublicationDateAwaitingConfirmationFromTheEditorialCommittee",
        title:
          "PublicationReferenceWithAnUnbrokenIdentifierThatMustRemainReadableOnSmallScreens",
        children: (
          <p>
            The next update will include the final document and related
            resources.
          </p>
        ),
      },
    ],
  },
};

export const EventColumns: Story = {
  args: {
    label: "Event history",
    layout: "columns",
    items: [
      {
        id: "draft",
        marker: "September 2026",
        title: "Draft prepared",
        href: "#draft",
      },
      {
        id: "review",
        marker: "October 2026",
        title: "Reviewed with contributors",
        href: "#review",
        children: "Supporting material updated.",
      },
      { id: "next", marker: "Date unknown", title: "Next edition planned" },
    ],
  },
};
