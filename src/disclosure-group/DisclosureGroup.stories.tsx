import type { Meta, StoryObj } from "@storybook/react-vite";
import { Disclosure } from "../disclosure/Disclosure.js";
import { DisclosureGroup } from "./DisclosureGroup.js";
export default {
  title: "Structure/DisclosureGroup",
  component: DisclosureGroup,
  parameters: { layout: "centered" },
} satisfies Meta<typeof DisclosureGroup>;
type Story = StoryObj<typeof DisclosureGroup>;
export const DocumentSections: Story = {
  render: () => (
    <DisclosureGroup>
      <Disclosure title="Details">Document details</Disclosure>
      <Disclosure title="History">Document history</Disclosure>
    </DisclosureGroup>
  ),
};
export const CompareSections: Story = {
  render: () => (
    <DisclosureGroup allowsMultipleExpanded>
      <Disclosure title="Original">Original document</Disclosure>
      <Disclosure title="Revision">Revised document</Disclosure>
    </DisclosureGroup>
  ),
};
