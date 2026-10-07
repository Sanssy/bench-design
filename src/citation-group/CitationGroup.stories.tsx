import type { Meta, StoryObj } from "@storybook/react-vite";
import { CitationGroup } from "./CitationGroup";
export default {
  title: "Data/CitationGroup",
  component: CitationGroup,
} satisfies Meta<typeof CitationGroup>;
type Story = StoryObj<typeof CitationGroup>;
export const SourcePassages: Story = {
  args: {
    title: "Annual report",
    meta: "City archive · 2026",
    citations: [
      {
        id: "introduction",
        label: "Introduction",
        locator: "Page 1",
        quote: "The archive preserves records for future generations.",
        actionLabel: "Read this passage",
        href: "#introduction",
      },
      {
        id: "summary",
        label: "Summary",
        locator: "Page 12",
        quote: "The collection is available to every reader.",
      },
    ],
  },
};
export const PreviewAction: Story = {
  args: {
    title: "Collection guide",
    icon: "briefcase",
    headingLevel: 2,
    citations: [
      {
        id: "access",
        label: "Access",
        quote: "Consult the original record before citing it.",
        actionLabel: "Preview passage",
        onAction: () => window.dispatchEvent(new Event("preview-passage")),
      },
    ],
  },
};
