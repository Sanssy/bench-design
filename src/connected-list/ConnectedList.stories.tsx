import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "../badge/Badge";
import { Link } from "../link/Link";
import { ConnectedList } from "./ConnectedList";
export default {
  title: "Data/ConnectedList",
  component: ConnectedList,
} satisfies Meta<typeof ConnectedList>;
type Story = StoryObj<typeof ConnectedList>;
export const RelatedResources: Story = {
  args: {
    label: "Related resources",
    items: [
      { id: "overview", title: "Overview", meta: <Badge>Reference</Badge> },
      {
        id: "source",
        title: (
          <Link href="#source">
            Read the supporting source and its detailed reference notes
          </Link>
        ),
        meta: "Related material supplied by the author",
      },
      {
        id: "appendix",
        title:
          "AppendixWithAnUnbrokenIdentifierThatMustRemainReadableOnSmallScreens",
        meta: <Link href="#appendix">Read appendix</Link>,
      },
    ],
  },
};
